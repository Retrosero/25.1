import { useState } from 'react';
import { Search } from 'lucide-react';
import { products } from '../../data/products';
import { ProductCountCard } from './product-count-card';
import { CountedProduct } from '../../hooks/use-inventory-count';
import { useSettings } from '../../hooks/use-settings';

interface ProductSearchProps {
  countedProducts: CountedProduct[];
  availableProducts: typeof products;
  onMergeConfirm: (countedProduct: CountedProduct, existingCount: CountedProduct) => void;
  onCount: (product: CountedProduct) => void;
}

export function ProductSearch({ countedProducts, availableProducts, onMergeConfirm, onCount }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { inventoryViewMode } = useSettings();

  const filteredProducts = searchQuery ? availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div>
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara (kod, barkod veya isim)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
            autoFocus
          />
        </div>
      </div>

      {searchQuery && filteredProducts.length > 0 && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredProducts.map((product) => (
            <ProductCountCard
              key={product.id}
              product={product}
              countedProducts={countedProducts}
              onMergeConfirm={onMergeConfirm}
              onCount={onCount}
              showImage={inventoryViewMode === 'grid'}
            />
          ))}
        </div>
      )}
    </div>
  );
}