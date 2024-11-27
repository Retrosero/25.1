import { useState } from 'react';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';
import { useCustomer } from '../hooks/use-customer';
import { CustomerInfo } from '../components/sales/customer-info';
import { CustomerSelector } from '../components/sales/customer-selector';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useApprovals } from '../hooks/use-approvals';
import { useTransactions } from '../hooks/use-transactions';
import { useAuth } from '../hooks/use-auth';
import { useSettings } from '../hooks/use-settings';
import { ReturnNotePopup } from '../components/returns/return-note-popup';
import { PurchaseHistoryPopup } from '../components/returns/purchase-history-popup';

type Purchase = {
  transactionId: string;
  date: string;
  price: number;
  quantity: number;
};

type PurchasedProduct = {
  productId: string;
  name: string;
  image: string;
  barcode?: string;
  purchases: Purchase[];
};

type SelectedProduct = {
  productId: string;
  transactionId: string;
  quantity: number;
  price: number;
  note?: string;
};

export function ReturnsPage() {
  const navigate = useNavigate();
  const { selectedCustomer, setSelectedCustomer } = useCustomer();
  const { addApproval } = useApprovals();
  const { addTransaction } = useTransactions();
  const { user } = useAuth();
  const { approvalSettings } = useSettings();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showHistoryPopup, setShowHistoryPopup] = useState<PurchasedProduct | null>(null);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [returnNote, setReturnNote] = useState('');

  // Get customer's purchased products
  const { transactions } = useTransactions();
  const customerTransactions = transactions.filter(
    t => t.type === 'sale' && t.customer.id === selectedCustomer?.id
  );

  const purchasedProducts = customerTransactions
    .filter(transaction => transaction.items)
    .flatMap(transaction => 
      transaction.items?.map(item => ({
        transactionId: transaction.id,
        date: transaction.date,
        price: item.price,
        quantity: item.quantity,
        productId: item.productId,
        name: item.name,
        image: item.image,
      })) || []
    )
    .reduce((acc, item) => {
      const existing = acc.find(p => p.productId === item.productId);
      if (existing) {
        existing.purchases.push({
          transactionId: item.transactionId,
          date: item.date,
          price: item.price,
          quantity: item.quantity,
        });
        // Sort purchases by date, newest first
        existing.purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        acc.push({
          productId: item.productId,
          name: item.name,
          image: item.image,
          purchases: [{
            transactionId: item.transactionId,
            date: item.date,
            price: item.price,
            quantity: item.quantity,
          }]
        });
      }
      return acc;
    }, [] as PurchasedProduct[]);

  const filteredProducts = purchasedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuantityChange = (productId: string, transactionId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(p => 
        !(p.productId === productId && p.transactionId === transactionId)
      ));
    } else {
      setSelectedProducts(prev => {
        const existing = prev.find(p => 
          p.productId === productId && p.transactionId === transactionId
        );
        if (existing) {
          return prev.map(p =>
            p.productId === productId && p.transactionId === transactionId
              ? { ...p, quantity }
              : p
          );
        }
        const purchase = purchasedProducts
          .find(p => p.productId === productId)
          ?.purchases.find(p => p.transactionId === transactionId);
        if (!purchase) return prev;
        return [...prev, {
          productId,
          transactionId,
          quantity,
          price: purchase.price,
        }];
      });
    }
  };

  const handleSelectProduct = (product: PurchasedProduct, purchase: Purchase) => {
    handleQuantityChange(product.productId, purchase.transactionId, 1);
  };

  const handleComplete = () => {
    if (!selectedCustomer || selectedProducts.length === 0) return;

    const returnData = {
      customer: {
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        taxNumber: selectedCustomer.taxNumber,
        address: selectedCustomer.address,
        phone: selectedCustomer.phone,
      },
      items: selectedProducts.map(item => {
        const product = purchasedProducts.find(p => p.productId === item.productId);
        return {
          productId: item.productId,
          name: product?.name || '',
          quantity: item.quantity,
          price: item.price,
          transactionId: item.transactionId,
        };
      }),
      note: returnNote,
      total: selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      date: new Date().toISOString(),
    };

    if (approvalSettings.returns) {
      addApproval({
        type: 'return',
        user: user?.name || 'Unknown User',
        oldData: null,
        newData: returnData,
        description: `${selectedCustomer.name} - ${formatCurrency(returnData.total)}`,
        amount: returnData.total,
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
        },
      });
      
      setSelectedProducts([]);
      setReturnNote('');
      setSelectedCustomer(null);
      navigate('/dashboard');
    } else {
      addTransaction({
        type: 'return',
        description: 'İade',
        customer: returnData.customer,
        amount: -returnData.total,
        items: returnData.items,
        note: returnData.note,
        date: new Date().toISOString(),
      });

      setSelectedProducts([]);
      setReturnNote('');
      setSelectedCustomer(null);
      navigate('/dashboard');
    }
  };

  const total = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!selectedCustomer) {
    return <CustomerSelector onSelect={setSelectedCustomer} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <CustomerInfo
          customer={selectedCustomer}
          onEdit={() => setSelectedCustomer(null)}
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara (isim, kod veya barkod)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Ürün Grid'i */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-20">
        {filteredProducts.map((product) => {
          const latestPurchase = product.purchases[0];
          const hasSelected = selectedProducts.some(p => p.productId === product.productId);
          
          return (
            <div
              key={product.productId}
              className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${
                hasSelected ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">Kod: {product.productId}</p>
                  {product.barcode && (
                    <p className="text-sm text-gray-500">Barkod: {product.barcode}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Son Alış: {new Date(latestPurchase.date).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="font-medium mt-1">{formatCurrency(latestPurchase.price)}</p>
                  <button
                    onClick={() => setShowHistoryPopup(product)}
                    className="text-sm text-primary-600 hover:text-primary-700 mt-1"
                  >
                    Alış Geçmişi ({product.purchases.length})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alt Bar */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">İade Tutarı</p>
              <p className="text-2xl font-bold">
                {formatCurrency(total)}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNotePopup(true)}
                className="px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {returnNote ? 'Not Düzenle' : 'Not Ekle'}
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                İade Al
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popuplar */}
      {showHistoryPopup && (
        <PurchaseHistoryPopup
          product={showHistoryPopup}
          selectedProducts={selectedProducts}
          onSelect={handleSelectProduct}
          onQuantityChange={handleQuantityChange}
          onClose={() => setShowHistoryPopup(null)}
        />
      )}

      {showNotePopup && (
        <ReturnNotePopup
          note={returnNote}
          onSave={(note) => {
            setReturnNote(note);
            setShowNotePopup(false);
          }}
          onClose={() => setShowNotePopup(false)}
        />
      )}
    </div>
  );
}