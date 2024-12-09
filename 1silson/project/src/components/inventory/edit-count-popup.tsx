import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { ShelfSelector } from './shelf-selector';

interface EditCountPopupProps {
  product: any;
  onSave: (product: any, shelf: string, quantity: number) => void;
  onClose: () => void;
}

export function EditCountPopup({ product, onSave, onClose }: EditCountPopupProps) {
  const [selectedShelf, setSelectedShelf] = useState(product.countedDepartments[0] || '');
  const [quantity, setQuantity] = useState(product.countedStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) return;
    onSave(product, selectedShelf, quantity);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Sayım Düzenle</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-500">Kod: {product.code}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reyon</label>
              <ShelfSelector value={selectedShelf} onChange={setSelectedShelf} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Miktar</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              disabled={!quantity || quantity <= 0}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}