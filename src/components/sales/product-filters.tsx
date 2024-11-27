import { Filter, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

interface ProductFiltersProps {
  onSortChange: (sort: SortOption) => void;
  onItemsPerPageChange: (count: number) => void;
  itemsPerPage: number;
}

export function ProductFilters({ onSortChange, onItemsPerPageChange, itemsPerPage }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'name-asc', label: 'İsim (A-Z)' },
    { value: 'name-desc', label: 'İsim (Z-A)' },
    { value: 'price-asc', label: 'Fiyat (Düşük-Yüksek)' },
    { value: 'price-desc', label: 'Fiyat (Yüksek-Düşük)' },
    { value: 'stock-asc', label: 'Stok (Az-Çok)' },
    { value: 'stock-desc', label: 'Stok (Çok-Az)' },
  ];

  const handleApplyFilters = () => {
    // Filtre uygulama mantığı burada olacak
    setShowFilters(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700",
            showFilters && "bg-gray-100 dark:bg-gray-700"
          )}
          title="Filtrele"
        >
          <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {showFilters && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10">
            <h3 className="font-medium mb-3">Filtreler</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Fiyat Aralığı</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Stok Durumu</label>
                <select className="w-full px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700">
                  <option value="">Tümü</option>
                  <option value="in-stock">Stokta Var</option>
                  <option value="out-of-stock">Stokta Yok</option>
                  <option value="low-stock">Stok Az</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg"
              >
                Uygula
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={sortRef}>
        <button
          onClick={() => setShowSort(!showSort)}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700",
            showSort && "bg-gray-100 dark:bg-gray-700"
          )}
          title="Sırala"
        >
          <ArrowUpDown className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {showSort && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value as SortOption);
                  setShowSort(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2"
      >
        <option value="25">25</option>
        <option value="100">100</option>
        <option value="250">250</option>
        <option value="500">500</option>
      </select>
    </div>
  );
}