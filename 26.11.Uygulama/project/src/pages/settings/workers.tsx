// src/pages/settings/workers.tsx
import { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { useUsers } from '../../hooks/use-users';
import { Plus, X, Save } from 'lucide-react';

export function WorkersSettings() {
  const { workers, updateWorkers } = useSettings();
  const { users } = useUsers();
  const [selectedUsers, setSelectedUsers] = useState<string[]>(workers);

  const handleSave = () => {
    updateWorkers(selectedUsers);
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Çalışan Yönetimi</h2>
          
          {/* User Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sistem Kullanıcıları</h3>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleToggleUser(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded ${
                      selectedUsers.includes(user.id)
                        ? 'bg-primary-500'
                        : 'border border-gray-300 dark:border-gray-600'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Workers */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Seçili Çalışanlar</h3>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId);
                return (
                  <div
                    key={userId}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                  >
                    <span>{user?.name}</span>
                    <button
                      onClick={() => handleToggleUser(userId)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}