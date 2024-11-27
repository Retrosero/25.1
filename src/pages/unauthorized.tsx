import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export function UnauthorizedPage() {
  const navigate = useNavigate();

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
            onClick={() => navigate(-1)}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Geri Dön
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Ana Sayfaya Git
          </button>
        </div>
      </div>
    </div>
  );
}