import { useState } from 'react';
import { formatCurrency } from '../../lib/utils';
import { Product } from '../../hooks/use-products';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '../../hooks/use-settings';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  viewMode?: 'grid' | 'list' | 'list-no-image';
}

export function ProductCard({ product, quantity, onQuantityChange, viewMode = 'grid' }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { productCardFields } = useSettings();
  
  const sortedImages = [...(product.images || [])].sort((a, b) => a.order - b.order);
  const enabledFields = productCardFields?.filter(field => field.enabled)
    .sort((a, b) => a.order - b.order) || [];

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  const renderProductInfo = () => {
    return (
      <div className="space-y-1">
        {enabledFields.map(field => {
          switch (field.id) {
            case 'name':
              return <h3 key={field.id} className="font-medium">{product.name}</h3>;
            case 'code':
              return <p key={field.id} className="text-sm text-gray-500">Kod: {product.id}</p>;
            case 'barcode':
              return product.barcode ? (
                <p key={field.id} className="text-sm text-gray-500">Barkod: {product.barcode}</p>
              ) : null;
            case 'brand':
              return product.brand ? (
                <p key={field.id} className="text-sm text-gray-500">Marka: {product.brand}</p>
              ) : null;
            case 'packaging':
              return product.packaging ? (
                <p key={field.id} className="text-sm text-gray-500">Ambalaj: {product.packaging}</p>
              ) : null;
            case 'stock':
              return <p key={field.id} className="text-sm text-gray-500">Stok: {product.stock}</p>;
            default:
              return null;
          }
        })}
      </div>
    );
  };

  if (viewMode === 'list-no-image') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {renderProductInfo()}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold">{formatCurrency(product.price)}</span>
            <input
              type="number"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              min="0"
              max={product.stock}
              className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
            />
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-4">
          <img
            src={sortedImages[currentImageIndex]?.url || product.image}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            {renderProductInfo()}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold">{formatCurrency(product.price)}</span>
            <input
              type="number"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              min="0"
              max={product.stock}
              className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="relative group">
        <img
          src={sortedImages[currentImageIndex]?.url || product.image}
          alt={product.name}
          className="w-full h-48 object-contain"
        />
        
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {sortedImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentImageIndex
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="p-4">
        {renderProductInfo()}
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold">{formatCurrency(product.price)}</span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
            min="0"
            max={product.stock}
            className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
          />
        </div>
      </div>
    </div>
  );
}