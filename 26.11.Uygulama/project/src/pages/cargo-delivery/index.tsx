// src/pages/cargo-delivery/index.tsx
import { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { X } from 'lucide-react';

export function CargoDeliveryPage() {
  const [showWorkerPopup, setShowWorkerPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [barcode, setBarcode] = useState('');
  const { workers, scannedItems, addScannedItem } = useSettings();

  useEffect(() => {
    if (!selectedUser) {
      setShowWorkerPopup(true);
    }
  }, [selectedUser]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const now = new Date().toISOString();
    const scan = {
      barcode,
      worker: selectedUser,
      timestamp: now
    };
    
    addScannedItem(scan);
    setBarcode('');
  };

  const handleWorkerSelect = (worker: string) => {
    setSelectedUser(worker);
    setShowWorkerPopup(false);
  };

  return (
    <div className="container mx-auto p-4 relative">
      <h1 className="text-2xl font-bold mb-6">Kargo Teslim</h1>

      {/* Worker Selection Popup */}
      {showWorkerPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Çalışan Seçin</h2>
              <button onClick={() => setShowWorkerPopup(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {workers.map((worker) => (
                <button
                  key={worker}
                  onClick={() => handleWorkerSelect(worker)}
                  className="p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {worker}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Worker Display */}
      {selectedUser && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Aktif Çalışan: <span className="font-semibold">{selectedUser}</span>
          </p>
        </div>
      )}

      {/* Barcode Scanning Form */}
      {selectedUser && (
        <form onSubmit={handleBarcodeSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="Barkod okutun..."
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Scanned Items List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Son Okutulan Ürünler</h2>
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Barkod</th>
                <th className="px-4 py-3 text-left text-sm">Çalışan</th>
                <th className="px-4 py-3 text-left text-sm">Tarih/Saat</th>
              </tr>
            </thead>
            <tbody>
              {scannedItems
                .slice()
                .reverse()
                .map((item, index) => (
                  <tr 
                    key={index}
                    className="border-t dark:border-gray-700"
                  >
                    <td className="px-4 py-3">{item.barcode}</td>
                    <td className="px-4 py-3">{item.worker}</td>
                    <td className="px-4 py-3">
                      {new Date(item.timestamp).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}