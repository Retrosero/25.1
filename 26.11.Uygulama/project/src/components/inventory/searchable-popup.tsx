import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface SearchablePopupProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onSelect: (selected: string[]) => void;
  onClose: () => void;
}

export function SearchablePopup({
  title,
  items,
  selectedItems,
  onSelect,
  onClose
}: SearchablePopupProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleItem = (item: string) => {
    const newSelected = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    onSelect(newSelected);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredItems.map((item) => (
              <label key={item} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item)}
                  onChange={() => handleToggleItem(item)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600"
                />
                <span className="ml-2">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}