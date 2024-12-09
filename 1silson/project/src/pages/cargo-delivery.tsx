import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, X, Barcode, Check } from 'lucide-react';

interface CargoUser {
  id: string;
  name: string;
}

interface CargoDelivery {
  id: string;
  userId: string;
  userName: string;
  barcode: string;
  createdAt: string;
}

export function CargoDeliveryPage() {
  const [users, setUsers] = useState<CargoUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<CargoUser | null>(null);
  const [barcode, setBarcode] = useState('');
  const [deliveries, setDeliveries] = useState<CargoDelivery[]>(() => {
    const saved = localStorage.getItem('cargoDeliveries');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsers = localStorage.getItem('cargoUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const handleSaveDelivery = () => {
    if (!selectedUser || !barcode.trim()) return;

    const newDelivery = {
      id: Date.now().toString(),
      userId: selectedUser.id,
      userName: selectedUser.name,
      barcode: barcode.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedDeliveries = [newDelivery, ...deliveries];
    setDeliveries(updatedDeliveries);
    localStorage.setItem('cargoDeliveries', JSON.stringify(updatedDeliveries));
    setBarcode('');
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Kargo Teslim - {selectedUser.name}</h1>
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Barkod</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                placeholder="Barkodu okutun veya girin"
                autoFocus
              />
            </div>
            <button
              onClick={handleSaveDelivery}
              disabled={!barcode.trim()}
              className="flex items-center gap-2 px-6 self-end py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              <span>Kaydet</span>
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Son Kayıtlar</h2>
            <div className="space-y-2">
              {deliveries
                .filter(d => d.userId === selectedUser.id)
                .slice(0, 5)
                .map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Barcode className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{delivery.barcode}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(delivery.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kargo Teslim</h1>
        <button
          onClick={() => navigate('/cargo-delivery/settings')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Settings className="w-5 h-5" />
          <span>Ayarlar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
          >
            <h3 className="text-lg font-medium mb-2">{user.name}</h3>
            <p className="text-sm text-gray-500">
              Son 24 saat: {
                deliveries.filter(d => 
                  d.userId === user.id && 
                  new Date(d.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length
              } paket
            </p>
          </button>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz kullanıcı eklenmemiş</p>
          <button
            onClick={() => navigate('/cargo-delivery/settings')}
            className="mt-4 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Kullanıcı Ekle
          </button>
        </div>
      )}
    </div>
  );
}