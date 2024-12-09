import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Product } from '../../hooks/use-products';
import { useApprovals } from '../../hooks/use-approvals';
import { useAuth } from '../../hooks/use-auth';
import { cn } from '../../lib/utils';

interface ProductEditPopupProps {
  product: Product;
  onClose: () => void;
}

export function ProductEditPopup({ product, onClose }: ProductEditPopupProps) {
  const { addApproval } = useApprovals();
  const { user } = useAuth();
  const [editedProduct, setEditedProduct] = useState({ ...product });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addApproval({
      type: 'product',
      user: user?.name || 'Unknown User',
      oldData: product,
      newData: editedProduct,
      description: `${product.name} - Ürün Güncelleme`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Ürün Düzenle</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ürün Adı</label>
              <input
                type="text"
                value={editedProduct.name}
                onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fiyat</label>
                <input
                  type="number"
                  value={editedProduct.price}
                  onChange={(e) => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  required
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stok</label>
                <input
                  type="number"
                  value={editedProduct.stock}
                  onChange={(e) => setEditedProduct({ ...editedProduct, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Marka</label>
                <input
                  type="text"
                  value={editedProduct.brand || ''}
                  onChange={(e) => setEditedProduct({ ...editedProduct, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <input
                  type="text"
                  value={editedProduct.category || ''}
                  onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Barkod</label>
                <input
                  type="text"
                  value={editedProduct.barcode || ''}
                  onChange={(e) => setEditedProduct({ ...editedProduct, barcode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Raf</label>
                <input
                  type="text"
                  value={editedProduct.shelf || ''}
                  onChange={(e) => setEditedProduct({ ...editedProduct, shelf: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ambalaj</label>
                <input
                  type="text"
                  value={editedProduct.packaging || ''}
                  onChange={(e) => setEditedProduct({ ...editedProduct, packaging: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <textarea
                value={editedProduct.description || ''}
                onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[100px]"
              />
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
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}