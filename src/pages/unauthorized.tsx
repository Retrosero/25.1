import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAccessRequests } from '../hooks/use-access-requests';
import { useAuth } from '../hooks/use-auth'; 
import { useUsers } from '../hooks/use-users';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { addRequest } = useAccessRequests();
  const { user } = useAuth();
  const { hasPermission } = useUsers();
  const currentPath = window.location.pathname;

  // Check if user has dashboard access
  const canAccessDashboard = user ? hasPermission(user.id, 'dashboard.view') : false;

  const handleAccessRequest = () => {
    if (!user) return;
    const permissionName = `${currentPath} sayfasına erişim`;

    addRequest({
      userId: user.id,
      userName: user.name,
      permissionId: currentPath,
      permissionName,
    });

    alert('Erişim talebiniz gönderildi. Yöneticiniz tarafından onaylandıktan sonra bu sayfaya erişebileceksiniz.');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <ShieldOff className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Bu sayfaya erişmek için gerekli yetkiye sahip değilsiniz.
        </p>
        <div className="space-y-2">
          <button
            onClick={handleAccessRequest}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mb-2"
          >
            Erişim Talep Et
          </button>
          {canAccessDashboard ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Ana Sayfaya Git
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Giriş Sayfasına Git
            </button>
          )}
        </div>
      </div>
    </div>
  );
}