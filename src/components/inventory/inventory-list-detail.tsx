import { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { ShelfSelector } from './shelf-selector';
import { InventoryList } from '../../hooks/use-inventory-count';

interface InventoryListDetailProps {
  list: InventoryList;
  onClose: () => void;
  readOnly?: boolean;
}

export function InventoryListDetail({ list, onClose, readOnly = false }: InventoryListDetailProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sayılan ürün sayısını hesapla
  const countedItemsCount = list.items.filter(item => item.countedStock > 0).length;

  // Filtreleme işlemleri
  const filteredItems = list.items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || 
      item.countedDepartments?.includes(selectedDepartment);
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">{list.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(list.date).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const printContent = document.getElementById('inventory-list-content');
                if (!printContent) return;

                const printWindow = window.open('', '_blank');
                if (!printWindow) return;

                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Sayım Listesi</title>
                      <style>
                        body { font-family: system-ui, -apple-system, sans-serif; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        @media print {
                          .no-print { display: none; }
                        }
                      </style>
                    </head>
                    <body>
                      ${printContent.innerHTML}
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="inventory-list-content" className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Liste Bilgileri</h3>
              <p><span className="font-medium">Durum:</span> {list.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}</p>
              {list.completedBy && (
                <p><span className="font-medium">Tamamlayan:</span> {list.completedBy}</p>
              )}
              {list.completedDate && (
                <p><span className="font-medium">Tamamlanma Tarihi:</span> {new Date(list.completedDate).toLocaleDateString('tr-TR')}</p>
              )}
              {list.note && (
                <p><span className="font-medium">Not:</span> {list.note}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Özet</h3>
              <p><span className="font-medium">Toplam Ürün:</span> {list.productIds?.length}/{countedItemsCount}</p>
              <p><span className="font-medium">Toplam Değer:</span> {formatCurrency(list.totalValue || 0)}</p>
              <p><span className="font-medium">Reyon Sayısı:</span> {list.departments?.length || 0}</p>
            </div>
          </div>

          <div className="mb-4">
            <ShelfSelector
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              includeAll={true}
            />
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 w-[40%]">Ürün</th>
                <th className="text-left p-4 w-[15%]">Kod</th>
                <th className="text-right p-4 w-[15%]">Mevcut Stok</th>
                <th className="text-right p-4 w-[10%]">Sayılan</th>
                <th className="text-right p-4 w-[10%]">Fark</th>
                <th className="text-left p-4 w-[10%]">Raf</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const difference = (item.countedStock || 0) - (item.currentStock || 0);
                return (
                  <tr key={`${item.id}-${item.countedDepartments?.[0]}`} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2">{item.code}</td>
                    <td className="py-2 text-right">{item.currentStock || 0}</td>
                    <td className="py-2 text-right">{item.countedStock || 0}</td>
                    <td className="py-2 text-right">
                      <span className={
                        difference === 0 ? 'text-green-500' :
                        difference > 0 ? 'text-red-500' :
                        'text-yellow-500'
                      }>
                        {difference}
                      </span>
                    </td>
                    <td className="py-2 pl-8">{item.countedDepartments?.join(', ') || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}