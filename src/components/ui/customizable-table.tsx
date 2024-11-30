import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Column {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

interface CustomizableTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  onColumnSettingsChange: (columns: Column[]) => void;
}

export function CustomizableTable({ columns: initialColumns, data, onRowClick, onColumnSettingsChange }: CustomizableTableProps) {
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedColumns = localStorage.getItem('tableColumns');
    return savedColumns ? JSON.parse(savedColumns) : initialColumns;
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  useEffect(() => {
    const tableId = 'customerTransactions';
    localStorage.setItem(`tableColumns_${tableId}`, JSON.stringify(columns));
    onColumnSettingsChange(columns);
  }, [columns, onColumnSettingsChange]);

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const moveColumn = (columnId: string, direction: 'up' | 'down') => {
    setColumns(prevColumns => {
      const index = prevColumns.findIndex(col => col.id === columnId);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prevColumns.length - 1)
      ) {
        return prevColumns;
      }

      const newColumns = [...prevColumns];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newColumns[index], newColumns[swapIndex]] = [newColumns[swapIndex], newColumns[index]];
      
      return newColumns.map((col, i) => ({ ...col, order: i }));
    });
  };

  const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="relative">
      <div className="flex justify-end mb-4">
        <div className="relative">
        <button
          onClick={() => setShowColumnSettings(!showColumnSettings)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700",
            showColumnSettings && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <Filter className="w-4 h-4" />
          <span>Sütunlar</span>
        </button>
        </div>
      </div>

      {showColumnSettings && (
        <div className="absolute right-0 top-12 z-10 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium mb-4">Görünür Sütunlar</h3>
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => toggleColumnVisibility(column.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600"
                  />
                  <span className="ml-2">{column.label}</span>
                </label>
                {column.visible && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveColumn(column.id, 'up')}
                      className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      disabled={column.order === 0}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveColumn(column.id, 'down')}
                      className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      disabled={column.order === visibleColumns.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {visibleColumns.map((column) => (
                <th key={column.id} className="text-left p-4">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} 
                onClick={() => onRowClick?.(row)}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                {visibleColumns.map((column) => (
                  <td key={column.id} className="p-4">
                    {row[column.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}