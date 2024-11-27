import { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../../types/user';
import { permissions } from '../../data/permissions';
import { useUsers } from '../../hooks/use-users';

interface UserPermissionsPopupProps {
  user: User;
  onClose: () => void;
}

export function UserPermissionsPopup({ user, onClose }: UserPermissionsPopupProps) {
  const { updateUserPermissions } = useUsers();
  const [userPermissions, setUserPermissions] = useState(user.permissions);

  // Modüllere göre izinleri grupla
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const handlePermissionChange = (permissionId: string, allowed: boolean) => {
    const newPermissions = userPermissions.map(p =>
      p.id === permissionId ? { ...p, allowed } : p
    );
    setUserPermissions(newPermissions);
  };

  const handleSave = () => {
    updateUserPermissions(user.id, userPermissions);
    onClose();
  };

  const moduleLabels: Record<string, string> = {
    sales: 'Satış',
    inventory: 'Stok',
    customers: 'Müşteriler',
    orders: 'Siparişler',
    payments: 'Ödemeler',
    approvals: 'Onaylar',
    reports: 'Raporlar',
    settings: 'Ayarlar'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">Kullanıcı İzinleri</h3>
            <p className="text-sm text-gray-500">{user.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <div
                key={module}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
              >
                <h4 className="font-medium mb-4">{moduleLabels[module]}</h4>
                <div className="space-y-3">
                  {modulePermissions.map((permission) => {
                    const currentPermission = userPermissions.find(p => p.id === permission.id);
                    return (
                      <label key={permission.id} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={currentPermission?.allowed || false}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                          disabled={user.role === 'admin'} // Admin'in izinleri değiştirilemez
                        />
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-gray-500">{permission.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            disabled={user.role === 'admin'} // Admin'in izinleri değiştirilemez
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}