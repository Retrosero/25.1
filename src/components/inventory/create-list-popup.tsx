import { useState } from 'react';
import { X, Plus, Minus, Search } from 'lucide-react';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { products } from '../../data/products';
import { cn } from '../../lib/utils';

interface CreateListPopupProps {
  onClose: () => void;
}

type SelectionMethod = {
  id: 'manual' | 'brand' | 'shelf';
  label: string;
  active: boolean;
};

export function CreateListPopup({ onClose }: CreateListPopupProps) {
  const { createList } = useInventoryCount();
  const [step, setStep] = useState(1);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedShelves, setSelectedShelves] = useState<string[]>([]);

  const [selectionMethods, setSelectionMethods] = useState<SelectionMethod[]>([
    { id: 'manual', label: 'Manuel Seçim', active: false },
    { id: 'brand', label: 'Markaya Göre', active: false },
    { id: 'shelf', label: 'Reyona Göre', active: false },
  ]);

  // Get unique brands and shelves
  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();
  const shelves = Array.from(new Set(products.map(p => p.shelf))).filter(Boolean).sort();

  const toggleSelectionMethod = (id: SelectionMethod['id']) => {
    setSelectionMethods(methods =>
      methods.map(method =>
        method.id === id ? { ...method, active: !method.active } : method
      )
    );
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleShelfSelect = (shelf: string) => {
    setSelectedShelves(prev =>
      prev.includes(shelf)
        ? prev.filter(s => s !== shelf)
        : [...prev, shelf]
    );
  };

  const getSelectedProductIds = () => {
    const manualIds = new Set(selectedProducts);
    const brandIds = new Set(products.filter(p => selectedBrands.includes(p.brand || '')).map(p => p.id));
    const shelfIds = new Set(products.filter(p => selectedShelves.includes(p.shelf || '')).map(p => p.id));
    
    return Array.from(new Set([...manualIds, ...brandIds, ...shelfIds]));
  };

  const handleCreate = () => {
    const productIds = getSelectedProductIds();
    createList(listName, listDescription, productIds);
    onClose();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderSelectionMethod = (method: SelectionMethod) => {
    switch (method.id) {
      case 'manual':
        return (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">Kod: {product.id}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'brand':
        return (
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandSelect(brand)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        );

      case 'shelf':
        return (
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {shelves.map((shelf) => (
              <label
                key={shelf}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedShelves.includes(shelf)}
                  onChange={() => handleShelfSelect(shelf)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>Reyon {shelf}</span>
              </label>
            ))}
          </div>
        );
    }
  };

  const selectedCount = getSelectedProductIds().length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Yeni Sayım Listesi</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Liste Adı</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  placeholder="Liste adını girin..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  rows={3}
                  placeholder="Liste açıklaması..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {selectionMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => toggleSelectionMethod(method.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border',
                      method.active
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/50 text-primary-600'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    {method.active ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {method.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {selectionMethods.map((method) => (
                  method.active && (
                    <div
                      key={method.id}
                      className="p-4 border rounded-lg border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="font-medium mb-4">{method.label}</h4>
                      {renderSelectionMethod(method)}
                    </div>
                  )
                ))}
              </div>

              {selectedCount > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Seçili Ürünler ({selectedCount})</h4>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {getSelectedProductIds().map((id) => {
                      const product = products.find(p => p.id === id);
                      if (!product) return null;

                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">Kod: {product.id}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Geri
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!listName}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                İleri
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={selectedCount === 0}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Oluştur
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}