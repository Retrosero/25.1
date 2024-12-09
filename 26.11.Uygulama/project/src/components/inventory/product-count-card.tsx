import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ShelfSelector } from './shelf-selector';
import { CountedProduct } from '../../hooks/use-inventory-count';

interface ProductCountCardProps {
  product: any;
  countedProducts: CountedProduct[];
  onMergeConfirm: (countedProduct: CountedProduct, existingCount: CountedProduct) => void;
  onCount: (product: CountedProduct) => void;
  showImage?: boolean;
}

export function ProductCountCard({ product, countedProducts, onMergeConfirm, onCount, showImage = true }: ProductCountCardProps) {
  const [selectedShelf, setSelectedShelf] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  
  const countedProduct = countedProducts.find(
    p => p.id === product.id && p.countedDepartments[0] === selectedShelf
  );

  const handleCount = () => {
    if (!quantity || quantity <= 0) return;

    const newCount = {
      id: product.id,
      name: product.name,
      code: product.id,
      barcode: product.barcode,
      currentStock: product.stock,
      countedStock: quantity,
      countedDepartments: [selectedShelf || 'Belirsiz'],
      countDate: new Date().toISOString(),
      image: product.image,
      price: product.price,
    };

    const existingCount = countedProducts.find(
      item => item.id === product.id && item.countedDepartments[0] === selectedShelf
    );

    if (existingCount) {
      onMergeConfirm(newCount, existingCount);
    } else {
      onCount(newCount);
    }

    // Reset quantity after adding
    setQuantity('');
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        {showImage && (
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h4 className="font-medium">{product.name}</h4>
          <p className="text-sm text-gray-500">Kod: {product.id}</p>
          <p className="text-sm text-gray-500">Mevcut Stok: {product.stock}</p>
          {countedProducts.filter(p => p.id === product.id).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {countedProducts
                .filter(p => p.id === product.id)
                .map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700"
                  >
                    {p.countedDepartments[0]}: {p.countedStock} adet
                  </span>
                ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ShelfSelector value={selectedShelf} onChange={setSelectedShelf} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(prev => typeof prev === 'number' ? Math.max(1, prev - 1) : 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={!quantity || quantity <= 1}
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : '')}
              className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
              placeholder="0"
              min="1"
            />
            <button
              onClick={() => setQuantity(prev => typeof prev === 'number' ? prev + 1 : 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleCount}
            disabled={!quantity || quantity <= 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}