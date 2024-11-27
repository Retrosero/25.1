import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Edit2, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useUsers } from '../../hooks/use-users';
import { User, UserRole } from '../../types/user';
import { UserEditPopup } from '../../components/users/user-edit-popup';
import { DeleteConfirmationPopup } from '../../components/users/delete-confirmation-popup';
import { UserPermissionsPopup } from '../../components/users/user-permissions-popup';
import { cn } from '../../lib/utils';

const roleLabels: Record<UserRole, string> = {
  admin: 'Yönetici',
  supervisor: 'Süpervizör',
  manager: 'Müdür',
  sales: 'Satış Temsilcisi',
  warehouse: 'Depo Görevlisi',
  accounting: 'Muhasebe',
};

export function UsersPage() {
  const navigate = useNavigate();
  const { users, deleteUser, grantFullPermissions } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);

  // Grant full permissions to all users when the component mounts
  useEffect(() => {
    grantFullPermissions();
  }, [grantFullPermissions]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleDelete = (userId: string) => {
    if (userId === 'admin') {
      alert('Admin kullanıcısı silinemez!');
      return;
    }
    setUserToDelete(userId);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        <button
          onClick={() => setEditingUser({ 
            id: '', 
            name: '', 
            email: '', 
            role: 'sales',
            active: true,
            permissions: [],
            createdAt: new Date().toISOString()
          })}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <UserPlus className="w-5 h-5" />
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
          className="w-48 px-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <option value="all">Tüm Roller</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Kullanıcı</th>
                <th className="text-left p-4">Rol</th>
                <th className="text-center p-4">Durum</th>
                <th className="text-left p-4">Son Giriş</th>
                <th className="text-center p-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">{roleLabels[user.role]}</td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        user.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}>
                        {user.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPermissionsUser(user)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="İzinler"
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Düzenle"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {user.id !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <UserEditPopup
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {userToDelete && (
        <DeleteConfirmationPopup
          onConfirm={() => {
            deleteUser(userToDelete);
            setUserToDelete(null);
          }}
          onCancel={() => setUserToDelete(null)}
        />
      )}

      {permissionsUser && (
        <UserPermissionsPopup
          user={permissionsUser}
          onClose={() => setPermissionsUser(null)}
        />
      )}
    </div>
  );
}