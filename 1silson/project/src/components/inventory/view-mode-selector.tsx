import { LayoutGrid, List } from 'lucide-react';
import { cn } from '../../lib/utils';

type ViewMode = 'grid' | 'list';

interface ViewModeSelectorProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ value, onChange }: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
          value === 'grid' && 'bg-gray-100 dark:bg-gray-700'
        )}
        title="Resimli Görünüm"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={cn(
          'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
          value === 'list' && 'bg-gray-100 dark:bg-gray-700'
        )}
        title="Liste Görünümü"
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}