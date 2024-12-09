import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { useSettings } from '../../hooks/use-settings';
import { ViewModeSelector } from './view-mode-selector';

interface DifferentLocationsPopupProps {
  onClose: () => void;
}

export function DifferentLocationsPopup({ onClose }: DifferentLocationsPopupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { getActiveCount } = useInventoryCount();
  const { inventoryViewMode, setInventoryViewMode } = useSettings();
  const activeCount = getActiveCount();

  const countedProducts = activeCount?.items || [];
  
  // Group products by ID to find ones counted in different locations
  const groupedProducts = countedProducts.reduce((acc, product) => {
    if (!acc[product.id]) {
      acc[product.id] = [];
    }
    acc[product.id].push(product);
    return acc;
  }, {} as Record<string, typeof countedProducts>);

  const differentLocationsProducts = Object.entries(groupedProducts)
    .filter(([_, products]) => products.length > 1)
    .map(([id, products]) => ({
      id,
      name: products[0].name,
      code: products[0].code,
      image: products[0].image,
      locations: products.map(p => ({
        department: p.countedDepartments[0],
        quantity: p.countedStock
      }))
    }))
    .filter(product =>
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">Farklı Yerde Sayılan Ürünler</h3>
            <p className="text-sm text-gray-500">{differentLocationsProducts.length} ürün</p>
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
                {differentLocationsProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-500">Kod: {product.code}</p>
                      <div className="mt-2 space-y-1">
                        {product.locations.map((loc, index) => (
                          <p key={index} className="text-sm">
                            {loc.department}: {loc.quantity} adet
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Ürün Adı</th>
                    <th className="text-left p-4">Kod</th>
                    <th className="text-left p-4">Reyonlar ve Miktarlar</th>
                  </tr>
                </thead>
                <tbody>
                  {differentLocationsProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.code}</td>
                      <td className="p-4">
                        {product.locations.map((loc, index) => (
                          <div key={index}>
                            {loc.department}: {loc.quantity} adet
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}