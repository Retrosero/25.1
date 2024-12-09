import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { User, UserRole } from '../../types/user';
import { permissions } from '../../data/permissions';
import { useUsers } from '../../hooks/use-users';

interface UserPermissionsPopupProps {
  user: User;
  onClose: () => void;
}

export function UserPermissionsPopup({ user, onClose }: UserPermissionsPopupProps) {
  const { updateUserPermissions, updateRolePermissions } = useUsers();
  const [userPermissions, setUserPermissions] = useState(user.permissions);
  const [applyToRole, setApplyToRole] = useState(false);
  const [showRoleDefaults, setShowRoleDefaults] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, {
    accessType: 'permanent' | 'temporary';
    duration?: number;
    durationType?: 'hours' | 'days';
  }>>({});

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
    
    if (allowed) {
      setSelectedPermissions(prev => ({
        ...prev,
        [permissionId]: { accessType: 'permanent' }
      }));
    } else {
      setSelectedPermissions(prev => {
        const { [permissionId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSave = () => {
    if (!user) return;
    if (applyToRole) {
      // Update role permissions
      const rolePerms = userPermissions.map(p => ({
        id: p.id,
        allowed: p.allowed,
        ...(selectedPermissions[p.id] || {})
      }));
      updateRolePermissions(user.role, rolePerms);
    } else {
      // Update user-specific permissions
      const userPerms = userPermissions.map(p => ({
        id: p.id,
        allowed: p.allowed,
        ...(selectedPermissions[p.id] || {})
      }));
      updateUserPermissions(user.id, userPerms);
    }
    onClose();
  };

  useEffect(() => {
    const savedPermissions = localStorage.getItem(`user_permissions_${user.id}`);
    if (savedPermissions) {
      setUserPermissions(JSON.parse(savedPermissions));
    } else {
      setUserPermissions(user.permissions);
    }
  }, [user.id]);

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
          {user.role !== 'admin' && (
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applyToRole}
                  onChange={(e) => setApplyToRole(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Bu izinleri tüm {user.role} rolündeki kullanıcılara uygula</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showRoleDefaults}
                  onChange={(e) => setShowRoleDefaults(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Rol varsayılan izinlerini göster</span>
              </label>
            </div>
          )}

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
                          disabled={user.role === 'admin' || showRoleDefaults}
                        />
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-gray-500">{permission.description}</p>
                          {currentPermission?.allowed && (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`access-type-${permission.id}`}
                                  checked={selectedPermissions[permission.id]?.accessType === 'permanent'}
                                  onChange={() => setSelectedPermissions(prev => ({
                                    ...prev,
                                    [permission.id]: { accessType: 'permanent' }
                                  }))}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">Kalıcı Erişim</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`access-type-${permission.id}`}
                                  checked={selectedPermissions[permission.id]?.accessType === 'temporary'}
                                  onChange={() => setSelectedPermissions(prev => ({
                                    ...prev,
                                    [permission.id]: { 
                                      accessType: 'temporary',
                                      duration: 24,
                                      durationType: 'hours'
                                    }
                                  }))}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">Geçici Erişim</span>
                              </div>
                              {selectedPermissions[permission.id]?.accessType === 'temporary' && (
                                <div className="flex items-center gap-2 ml-6">
                                  <input
                                    type="number"
                                    min="1"
                                    value={selectedPermissions[permission.id]?.duration || 24}
                                    onChange={(e) => setSelectedPermissions(prev => ({
                                      ...prev,
                                      [permission.id]: {
                                        ...prev[permission.id],
                                        duration: parseInt(e.target.value)
                                      }
                                    }))}
                                    className="w-20 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-700"
                                  />
                                  <select
                                    value={selectedPermissions[permission.id]?.durationType || 'hours'}
                                    onChange={(e) => setSelectedPermissions(prev => ({
                                      ...prev,
                                      [permission.id]: {
                                        ...prev[permission.id],
                                        durationType: e.target.value as 'hours' | 'days'
                                      }
                                    }))}
                                    className="px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-700"
                                  >
                                    <option value="hours">Saat</option>
                                    <option value="days">Gün</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          )}
                          {showRoleDefaults && (
                            <p className="text-xs text-primary-600">
                              Varsayılan: {currentPermission?.allowed ? 'İzin Var' : 'İzin Yok'}
                            </p>
                          )}
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