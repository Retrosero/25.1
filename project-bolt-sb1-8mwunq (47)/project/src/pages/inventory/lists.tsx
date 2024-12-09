import { useState } from 'react';
import { Search, Plus, Eye, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { InventoryListDetail } from '../../components/inventory/inventory-list-detail';
import { CreateListPopup } from '../../components/inventory/create-list-popup';
import { DeleteConfirmationPopup } from '../../components/inventory/delete-confirmation-popup';

export function InventoryListsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const { getCounts, getList, deleteList } = useInventoryCount();

  const lists = getCounts();

  const filteredLists = lists.filter(list => {
    const matchesSearch = !searchQuery || 
      list.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showCompletedOnly ? list.status === 'completed' : true;
    return matchesSearch && matchesStatus;
  });

  const handleStartCount = (listId: string) => {
    navigate(`/inventory/count?listId=${listId}`);
  };

  const handleDelete = (listId: string) => {
    setDeleteListId(listId);
  };

  const handleConfirmDelete = () => {
    if (deleteListId) {
      deleteList(deleteListId);
      setDeleteListId(null);
    }
  };

  const handleExport = () => {
    // Excel export işlemi
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sayım Listeleri</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreatePopup(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Sayım Listesi
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Excel
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Liste ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <button
          onClick={() => setShowCompletedOnly(!showCompletedOnly)}
          className={`px-4 py-2 rounded-lg border ${
            showCompletedOnly
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/50 text-primary-600'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          Tamamlananlar
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Liste Adı</th>
                <th className="text-left p-4">Tarih</th>
                <th className="text-center p-4">Durum</th>
                <th className="text-right p-4">Ürün Sayısı</th>
                <th className="text-right p-4">Toplam Değer</th>
                <th className="text-center p-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredLists.map((list) => {
                const countedItemsCount = list.items.filter(item => item.countedStock > 0).length;
                return (
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
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        list.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {list.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {list.productIds.length}/{countedItemsCount}
                    </td>
                    <td className="p-4 text-right">{formatCurrency(list.totalValue)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {list.status === 'completed' ? (
                          <button
                            onClick={() => setSelectedList(list.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Görüntüle"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartCount(list.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Sayıma Başla"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(list.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                              title="Sil"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedList && (
        <InventoryListDetail
          list={getList(selectedList)!}
          onClose={() => setSelectedList(null)}
          readOnly={true}
        />
      )}

      {showCreatePopup && (
        <CreateListPopup onClose={() => setShowCreatePopup(false)} />
      )}

      {deleteListId && (
        <DeleteConfirmationPopup
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteListId(null)}
        />
      )}
    </div>
  );
}