import { useState } from 'react';
import { Search, AlertTriangle, Edit2 } from 'lucide-react';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { MergeHistoryPopup } from './merge-history-popup';
import { EditCountPopup } from './edit-count-popup';

export function CountedProductsList() {
  const { getActiveCount, updateCount } = useInventoryCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
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

  const handleEdit = (product: any) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = (product: any, shelf: string, quantity: number) => {
    if (!activeCount) return;

    const updatedProduct = {
      ...product,
      countedStock: quantity,
      countedDepartments: [shelf]
    };

    updateCount(activeCount.id, updatedProduct);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sayılan ürünlerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.entries(groupedProducts).map(([id, products]) => {
          const isMerged = products.length > 1;
          const totalQuantity = products.reduce((sum, p) => sum + p.countedStock, 0);

          return (
            <div key={id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-4">
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
                  <div className="mt-1 flex flex-wrap gap-2">
                    {products.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700">
                          {p.countedDepartments[0] || 'Belirsiz'}: {p.countedStock} adet
                        </span>
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Toplam</p>
                  <p className="font-medium">{totalQuantity} adet</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <MergeHistoryPopup
          productName={groupedProducts[selectedProduct][0].name}
          mergeHistory={[
            {
              date: new Date().toISOString(),
              quantities: groupedProducts[selectedProduct].map(p => ({
                department: p.countedDepartments[0] || 'Belirsiz',
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

      {editingProduct && (
        <EditCountPopup
          product={editingProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}