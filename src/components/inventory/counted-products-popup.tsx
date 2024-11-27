import { useState } from 'react';
import { X, Search, AlertTriangle } from 'lucide-react';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { useSettings } from '../../hooks/use-settings';
import { ViewModeSelector } from './view-mode-selector';
import { MergeHistoryPopup } from './merge-history-popup';

interface CountedProductsPopupProps {
  onClose: () => void;
}

export function CountedProductsPopup({ onClose }: CountedProductsPopupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { getActiveCount } = useInventoryCount();
  const { inventoryViewMode, setInventoryViewMode } = useSettings();
  const activeCount = getActiveCount();

  const countedProducts = activeCount?.items || [];

  const filteredProducts = countedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group products by ID to identify merged ones
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.id]) {
      acc[product.id] = [];
    }
    acc[product.id].push(product);
    return acc;
  }, {} as Record<string, typeof filteredProducts>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">Sayılan Ürünler</h3>
            <p className="text-sm text-gray-500">{countedProducts.length} ürün</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewModeSelector
              value={inventoryViewMode}
              onChange={setInventoryViewMode}
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
              autoFocus
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {inventoryViewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(groupedProducts).map(([id, products]) => {
                  const isMerged = products.length > 1;
                  const totalQuantity = products.reduce((sum, p) => sum + p.countedStock, 0);

                  return (
                    <div
                      key={id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <img
                        src={products[0].image}
                        alt={products[0].name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{products[0].name}</h4>
                          {isMerged && (
                            <button
                              onClick={() => setSelectedProduct(id)}
                              className="p-1 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/50 rounded-lg"
                              title="Birleştirme Detayları"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Kod: {products[0].code}</p>
                        <p className="text-sm text-gray-500">
                          Toplam: {totalQuantity} adet
                          {products.map(p => ` (${p.countedDepartments?.[0] || 'Belirsiz'}: ${p.countedStock})`).join(', ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Ürün Adı</th>
                    <th className="text-left p-4">Kod</th>
                    <th className="text-right p-4">Miktar</th>
                    <th className="text-left p-4">Reyon</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={`${product.id}-${product.countedDepartments?.[0] || 'unknown'}`} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.code}</td>
                      <td className="p-4 text-right">{product.countedStock}</td>
                      <td className="p-4">{product.countedDepartments?.join(', ') || 'Belirsiz'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <MergeHistoryPopup
          productName={groupedProducts[selectedProduct][0].name}
          mergeHistory={[
            {
              date: new Date().toISOString(),
              quantities: groupedProducts[selectedProduct].map(p => ({
                department: p.countedDepartments?.[0] || 'Belirsiz',
                quantity: p.countedStock
              })),
              totalQuantity: groupedProducts[selectedProduct].reduce(
                (sum, p) => sum + p.countedStock, 0
              )
            }
          ]}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}