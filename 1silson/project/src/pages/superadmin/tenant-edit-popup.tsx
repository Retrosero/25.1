import { useState } from 'react';
import { X } from 'lucide-react';
import { useTenants } from '../../hooks/use-tenants';
import { Tenant } from '../../types/tenant';

interface TenantEditPopupProps {
  tenant: Partial<Tenant>;
  onClose: () => void;
}

export function TenantEditPopup({ tenant, onClose }: TenantEditPopupProps) {
  const { addTenant, updateTenant, generateApiKey, calculateExpiryDate } = useTenants();
  const [formData, setFormData] = useState({
    name: tenant.name || '',
    email: tenant.email || '',
    adminUser: tenant.adminUser || {
      email: '',
      password: '',
      name: ''
    },
    plan: tenant.plan || 'monthly',
    maxUsers: tenant.maxUsers || 5,
    features: tenant.features || {
      inventory: true,
      orders: true,
      reports: true,
      api: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expiresAt = calculateExpiryDate(formData.plan as 'monthly' | 'yearly');

    if (tenant.id) {
      updateTenant(tenant.id, {
        ...formData,
        expiresAt,
      });
    } else {
      addTenant({
        ...formData,
        status: 'active',
        expiresAt,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">
            {tenant.id ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Firma Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Paket</label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                required
              >
                <option value="monthly">Aylık</option>
                <option value="yearly">Yıllık</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Maksimum Kullanıcı</label>
              <input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                min="1"
                required
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h4 className="font-medium mb-4">Admin Kullanıcı Bilgileri</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={formData.adminUser.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      adminUser: { ...prev.adminUser, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">E-posta</label>
                  <input
                    type="email"
                    value={formData.adminUser.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      adminUser: { ...prev.adminUser, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Şifre</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.adminUser.password}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        adminUser: { ...prev.adminUser, password: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const password = generateStrongPassword();
                        setFormData(prev => ({
                          ...prev,
                          adminUser: { ...prev.adminUser, password }
                        }));
                      }}
                      className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Şifre Oluştur
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermeli
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Özellikler</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.inventory}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, inventory: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="ml-2">Stok Yönetimi</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.orders}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, orders: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="ml-2">Sipariş Yönetimi</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.reports}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, reports: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="ml-2">Raporlama</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.api}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, api: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="ml-2">API Erişimi</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {tenant.id ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}