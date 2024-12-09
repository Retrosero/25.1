import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ShelfSelectorProps {
  value: string;
  onChange: (shelf: string) => void;
  includeAll?: boolean;
}

export function ShelfSelector({ value, onChange, includeAll = false }: ShelfSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shelves = [
    ...(includeAll ? ['Tümü'] : []),
    'A1', 'A2', 'A3',
    'B1', 'B2', 'B3',
    'C1', 'C2', 'C3',
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
      >
        <span>{value || (includeAll ? 'Tümü' : 'Reyon Seç')}</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          showDropdown && "transform rotate-180"
        )} />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
          {shelves.map((shelf) => (
            <button
              key={shelf}
              type="button"
              onClick={() => {
                onChange(shelf === 'Tümü' ? '' : shelf);
                setShowDropdown(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700",
                (value === shelf || (shelf === 'Tümü' && !value)) && "bg-primary-50 dark:bg-primary-900/50 text-primary-600"
              )}
            >
              {shelf}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}