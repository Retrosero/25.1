import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, AlertTriangle } from 'lucide-react';
import { useAccessRequests } from '../hooks/use-access-requests';
import { useAuth } from '../hooks/use-auth'; 
import { useUsers } from '../hooks/use-users';

interface UnauthorizedPageProps {
  message?: string;
}

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { addRequest } = useAccessRequests();
  const { user } = useAuth();
  const { hasPermission } = useUsers();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [originalPath] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('from') || '/dashboard';
  });
  const [originalPermission] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('permission') || 'dashboard.view';
  });

  // Check if user has dashboard access
  const canAccessDashboard = user ? hasPermission(user.id, 'dashboard.view') : false;

  const handleAccessRequest = () => {
    if (!user || !originalPermission) return;
    setShowConfirmation(true);
    setRequestSent(false);
  };

  const confirmAccessRequest = () => {
    if (!user || !originalPermission) return;
    
    const permissionName = `${originalPath} sayfası için ${originalPermission} izni`;

    addRequest({
      userId: user.id,
      userName: user.name,
      permissionId: originalPermission,
      permissionName,
      note: `${originalPath} sayfasına erişim talebi`
    });

    alert('Erişim talebiniz başarıyla gönderildi. Yöneticiniz tarafından onaylandıktan sonra bu sayfaya erişebileceksiniz.');
    setRequestSent(true);
    setShowConfirmation(false);
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
            onClick={() => handleAccessRequest()}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mb-2"
          >
            Erişim İste
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

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium">Erişim İsteği Onayı</h3>
            </div>

            <div className="p-4">
              <p>Bu sayfaya erişim isteği göndermek istediğinize emin misiniz?</p>
              <p className="text-sm text-gray-500 mt-2">
                İsteğiniz yöneticiniz tarafından onaylandıktan sonra sayfaya erişebileceksiniz.
              </p>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={confirmAccessRequest}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Evet, İstek Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}