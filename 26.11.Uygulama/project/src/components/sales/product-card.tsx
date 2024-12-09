import { useState } from 'react';
import { formatCurrency } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { useSettings } from '../../hooks/use-settings';

interface ProductCardProps {
  product: any;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  viewMode?: 'grid' | 'list' | 'list-no-image';
}

export function ProductCard({ product, quantity, onQuantityChange, viewMode = 'grid' }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { productCardFields } = useSettings();
  
  const sortedImages = product.images ? [...product.images].sort((a, b) => a.order - b.order) : [];
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
      <div className="space-y-1 min-h-[120px]">
        {enabledFields.map(field => {
          switch (field.id) {
            case 'name':
              return <h3 key={field.id} className="font-medium">{product.sto_isim}</h3>;
            case 'code':
              return <p key={field.id} className="text-sm text-gray-500">Kod: {product.sto_kod || ''}</p>;
            case 'barcode':
              // Boş olsa bile Barkod satırı gösterilecek
              return <p key={field.id} className="text-sm text-gray-500">Barkod: {product.bar_kodu || ''}</p>;
            case 'brand':
              // Boş olsa bile Marka satırı gösterilecek
              return <p key={field.id} className="text-sm text-gray-500">Marka: {product.sto_marka_kodu || ''}</p>;
            case 'packaging':
              // Boş olsa bile Ambalaj satırı gösterilecek
              return <p key={field.id} className="text-sm text-gray-500">Ambalaj: {product.sto_ambalaj_kodu || ''}</p>;
            case 'stock':
              // Stok bilgisi yoksa 0 gösterir
              return <p key={field.id} className="text-sm text-gray-500">Stok: {product.sth_eldeki_miktar ?? 0}</p>;
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
            <span className="font-bold">{formatCurrency(product.sfiyat_fiyati || 0)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                min="0"
                max={product.sth_eldeki_miktar}
                className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
            alt={product.sto_isim}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            {renderProductInfo()}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold">{formatCurrency(product.sfiyat_fiyati || 0)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                min="0"
                max={product.sth_eldeki_miktar}
                className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full justify-between">
      <div className="relative group">
        <div className="w-full h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
          <img
            src={sortedImages[currentImageIndex]?.url || product.image}
            alt={product.sto_isim}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
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
              {sortedImages.map((_: any, idx: number) => (
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
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>{renderProductInfo()}</div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="font-bold">{formatCurrency(product.sfiyat_fiyati || 0)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              min="0"
              max={product.sth_eldeki_miktar}
              className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
