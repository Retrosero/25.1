import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Key, CheckCircle, XCircle } from 'lucide-react';
import { useTenants } from '../../hooks/use-tenants';
import { Tenant } from '../../types/tenant';
import { formatDate } from '../../lib/utils';
import { TenantEditPopup } from './tenant-edit-popup';
import { DeleteConfirmationPopup } from './delete-confirmation-popup';

export function SuperAdminPage() {
  const navigate = useNavigate();
  const { tenants, deleteTenant } = useTenants();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Müşteri Yönetimi</h1>
        <button
          onClick={() => setEditingTenant({} as Tenant)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Müşteri</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Müşteri</th>
                <th className="text-left p-4">API Key</th>
                <th className="text-left p-4">Paket</th>
                <th className="text-center p-4">Durum</th>
                <th className="text-left p-4">Bitiş Tarihi</th>
                <th className="text-center p-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        {tenant.apiKey}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(tenant.apiKey)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Kopyala"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize">
                      {tenant.plan === 'monthly' ? 'Aylık' : 'Yıllık'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tenant.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : tenant.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.status === 'active' ? 'Aktif' :
                         tenant.status === 'suspended' ? 'Askıda' : 'Süresi Doldu'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {formatDate(new Date(tenant.expiresAt))}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingTenant(tenant)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Düzenle"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setTenantToDelete(tenant.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingTenant && (
        <TenantEditPopup
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
        />
      )}

      {tenantToDelete && (
        <DeleteConfirmationPopup
          onConfirm={() => {
            deleteTenant(tenantToDelete);
            setTenantToDelete(null);
          }}
          onCancel={() => setTenantToDelete(null)}
        />
      )}
    </div>
  );
}