import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Search, Package, Users, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/use-auth';
import { useUsers } from '../../hooks/use-users';

interface CargoUser {
  id: string;
  name: string;
}

type TabType = 'users' | 'deliveries';

export function CargoDeliverySettingsPage() {
  const [users, setUsers] = useState<CargoUser[]>(() => {
    const savedUsers = localStorage.getItem('cargoUsers');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [deliveries, setDeliveries] = useState(() => {
    const saved = localStorage.getItem('cargoDeliveries');
    return saved ? JSON.parse(saved) : [];
  });
  const [newUserName, setNewUserName] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = useUsers();

  const canDeleteUsers = user?.role === 'admin' || hasPermission(user?.id || '', 'users.manage');

  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    
    const newUser = {
      id: Date.now().toString(),
      name: newUserName.trim()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('cargoUsers', JSON.stringify(updatedUsers));
    setNewUserName('');
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('cargoUsers', JSON.stringify(updatedUsers));
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    !searchQuery || 
    delivery.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    delivery.createdAt.startsWith(selectedDate)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kargo Teslim Ayarları</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              activeTab === 'users'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            )}
          >
            <Users className="w-5 h-5" />
            <span>Kullanıcılar</span>
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              activeTab === 'deliveries'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            )}
          >
            <Package className="w-5 h-5" />
            <span>Okutulan Kargolar</span>
          </button>
          <button
            onClick={() => navigate('/cargo-delivery')}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Geri Dön
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'users' ? (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Kullanıcı Ekle</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Kullanıcı adı"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={handleAddUser}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Kullanıcılar</h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="font-medium">{user.name}</span>
                    {canDeleteUsers && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Henüz kullanıcı eklenmemiş
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Barkod veya kullanıcı ara..."
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
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Tarih</th>
                    <th className="text-left p-4">Kullanıcı</th>
                    <th className="text-left p-4">Barkod</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">
                        {new Date(delivery.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="p-4">{delivery.userName}</td>
                      <td className="p-4">{delivery.barcode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDeliveries.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {searchQuery ? 'Aranan kriterlere uygun kayıt bulunamadı' : 'Henüz kayıt bulunmuyor'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}