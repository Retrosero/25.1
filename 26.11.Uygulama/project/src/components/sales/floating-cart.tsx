import { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, FileText, MessageSquare } from 'lucide-react';
import { useCart } from '../../hooks/use-cart';
import { useCustomer } from '../../hooks/use-customer';
import { getProducts } from '../../lib/db/sales';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useApprovals } from '../../hooks/use-approvals';
import { useTransactions } from '../../hooks/use-transactions';
import { useAuth } from '../../hooks/use-auth';
import { useSettings } from '../../hooks/use-settings';
import { NotePopup } from './note-popup';
import { ProductNotePopup } from './product-note-popup';

interface FloatingCartProps {
  onClose: () => void;
}

export function FloatingCart({ onClose }: FloatingCartProps) {
  const navigate = useNavigate();
  const { items: cartItems, updateQuantity, removeItem, discount, setDiscount, orderNote, setOrderNote, getTotal, clearCart } = useCart();
  const { selectedCustomer } = useCustomer();
  const { addApproval } = useApprovals();
  const { addTransaction } = useTransactions();
  const { user } = useAuth();
  const { approvalSettings } = useSettings();
  const [showOrderNotePopup, setShowOrderNotePopup] = useState(false);
  const [editingItemNote, setEditingItemNote] = useState<{productId: string, note?: string} | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });

  useEffect(() => {
    const loadProducts = async () => {
      const { products } = await getProducts(1, 1000); // Tüm ürünleri al
      setProducts(products);
      const newTotals = getTotal(products);
      setTotals(newTotals);
    };
    loadProducts();
  }, [cartItems, discount]);

  const handleComplete = () => {
    if (!selectedCustomer || cartItems.length === 0) return;

    const cartProducts = cartItems.map(item => {
      const product = products.find(p => p.sto_kod === item.productId);
      if (!product) return null;
      return {
        productId: product.sto_kod,
        name: product.sto_isim,
        quantity: item.quantity,
        price: product.sfiyat_fiyati || 0,
        image: product.images?.[0]?.url || '',
        note: item.note,
      };
    }).filter(Boolean);

    const orderData = {
      customer: {
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        taxNumber: selectedCustomer.taxNumber,
        address: selectedCustomer.address,
        phone: selectedCustomer.phone,
      },
      items: cartProducts,
      discount,
      note: orderNote,
      total: totals.total,
      date: new Date().toISOString(),
    };

    if (approvalSettings.sales) {
      addApproval({
        type: 'sale',
        user: user?.name || 'Unknown User',
        oldData: null,
        newData: orderData,
        description: `${selectedCustomer.name} - ${formatCurrency(totals.total)}`,
        amount: totals.total,
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
        },
      });
      
      clearCart();
      onClose();
      navigate('/dashboard');
    } else {
      addTransaction({
        type: 'sale',
        description: 'Satış',
        customer: orderData.customer,
        amount: totals.total,
        items: orderData.items,
        discount,
        note: orderNote,
        date: new Date().toISOString(),
      });

      clearCart();
      onClose();
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Sepet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Sepetiniz boş</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = products.find(p => p.sto_kod === item.productId);
                if (!product) return null;

                return (
                  <div
                    key={item.productId}
                    className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images?.[0]?.url || ''}
                        alt={product.sto_isim}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{product.sto_isim}</h3>
                        <p className="text-sm text-gray-500">{formatCurrency(product.sfiyat_fiyati || 0)}</p>
                        {item.note && (
                          <p className="text-sm text-gray-500 mt-1">Not: {item.note}</p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItemNote({ productId: item.productId, note: item.note });
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 mt-1"
                        >
                          {item.note ? 'Notu Düzenle' : 'Not Ekle'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="w-24 text-right font-medium">
                        {formatCurrency((product.sfiyat_fiyati || 0) * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">İskonto (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => setShowOrderNotePopup(true)}
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary-600"
                >
                  <FileText className="w-4 h-4" />
                  <span>Sipariş Notu {orderNote && '✓'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>İskonto ({discount}%)</span>
                <span>-{formatCurrency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Toplam</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={cartItems.length === 0}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siparişi Tamamla
          </button>
        </div>
      </div>

      {showOrderNotePopup && (
        <NotePopup
          title="Sipariş Notu"
          note={orderNote}
          onSave={setOrderNote}
          onClose={() => setShowOrderNotePopup(false)}
        />
      )}
      
      {editingItemNote && (
        <ProductNotePopup
          note={editingItemNote.note || ''}
          onSave={(note) => {
            const item = cartItems.find(item => item.productId === editingItemNote.productId);
            if (item) {
              const updatedItem = { ...item, note };
              updateQuantity(item.productId, item.quantity, note);
            }
            setEditingItemNote(null);
          }}
          onClose={() => setEditingItemNote(null)}
        />
      )}
    </div>
  );
}