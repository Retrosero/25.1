import { X, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

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

interface PurchaseHistoryPopupProps {
  product: PurchasedProduct;
  selectedProducts: SelectedProduct[];
  onSelect: (product: PurchasedProduct, purchase: Purchase) => void;
  onQuantityChange: (productId: string, transactionId: string, quantity: number) => void;
  onClose: () => void;
}

export function PurchaseHistoryPopup({
  product,
  selectedProducts,
  onSelect,
  onQuantityChange,
  onClose,
}: PurchaseHistoryPopupProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-gray-500">Alış Geçmişi</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {product.purchases.map((purchase) => {
              const selected = selectedProducts.find(p => 
                p.productId === product.productId && p.transactionId === purchase.transactionId
              );

              return (
                <div
                  key={purchase.transactionId}
                  className={`p-4 rounded-lg border ${
                    selected ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Alış Tarihi: {new Date(purchase.date).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="font-medium mt-1">{formatCurrency(purchase.price)}</p>
                      <p className="text-sm text-gray-500">Alınan Miktar: {purchase.quantity}</p>
                    </div>
                    <div>
                      {selected ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onQuantityChange(
                              product.productId,
                              purchase.transactionId,
                              selected.quantity - 1
                            )}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{selected.quantity}</span>
                          <button
                            onClick={() => onQuantityChange(
                              product.productId,
                              purchase.transactionId,
                              selected.quantity + 1
                            )}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            disabled={selected.quantity >= purchase.quantity}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(product, purchase);
                          }}
                          className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Seç
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}