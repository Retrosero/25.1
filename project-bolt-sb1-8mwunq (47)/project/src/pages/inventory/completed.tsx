import { useState } from 'react';
import { Search, Calendar, Eye, Printer, Download } from 'lucide-react';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { formatCurrency } from '../../lib/utils';
import { InventoryListDetail } from '../../components/inventory/inventory-list-detail';

export function CompletedInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const { getCounts, getList } = useInventoryCount();

  const completedLists = getCounts().filter(list => list.status === 'completed');

  const filteredLists = completedLists.filter(list => {
    const matchesSearch = !searchQuery || 
      list.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || list.date.startsWith(selectedDate);
    return matchesSearch && matchesDate;
  });

  const handleExport = (format: 'excel' | 'pdf') => {
    // Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tamamlanan Sayımlar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sayım ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48 pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Sayım Adı</th>
                <th className="text-left p-4">Tarih</th>
                <th className="text-left p-4">Tamamlayan</th>
                <th className="text-right p-4">Ürün Sayısı</th>
                <th className="text-right p-4">Toplam Değer</th>
                <th className="text-center p-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredLists.map((list) => (
                <tr key={list.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{list.name}</p>
                      {list.description && (
                        <p className="text-sm text-gray-500">{list.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {new Date(list.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4">{list.completedBy}</td>
                  <td className="p-4 text-right">{list.items.length}</td>
                  <td className="p-4 text-right">{formatCurrency(list.totalValue)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedList(list.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Görüntüle"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Yazdır"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedList && (
        <InventoryListDetail
          list={getList(selectedList)!}
          onClose={() => setSelectedList(null)}
        />
      )}
    </div>
  );
}