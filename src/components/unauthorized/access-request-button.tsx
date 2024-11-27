import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { useNotifications } from '../../hooks/use-notifications';
import { Clock } from 'lucide-react';

export function AccessRequestButton() {
  const [isRequesting, setIsRequesting] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { addNotification, getAccessRequestStatus } = useNotifications();

  const status = user ? getAccessRequestStatus(user.id, location.pathname) : 'none';

  const handleRequestAccess = () => {
    if (!user || status !== 'none') return;
    
    setIsRequesting(true);

    // Add notification for admins
    addNotification({
      type: 'access_request',
      title: 'Erişim İzni İsteği',
      message: `${user.name} kullanıcısı ${location.pathname} sayfası için erişim izni istiyor.`,
      userId: user.id,
      forAdmin: true,
      metadata: {
        userId: user.id,
        userName: user.name,
        pageUrl: location.pathname,
        pageName: getPageName(location.pathname),
        status: 'pending'
      }
    });

    // Add confirmation notification for user
    addNotification({
      type: 'info',
      title: 'Erişim İsteği Gönderildi',
      message: 'Erişim isteğiniz yöneticilere iletildi. Onay durumu size bildirilecektir.',
      userId: user.id,
      metadata: {
        pageUrl: location.pathname,
        pageName: getPageName(location.pathname),
        status: 'pending'
      }
    });

    setIsRequesting(false);
  };

  const getPageName = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'Ana Sayfa';
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  };

  if (status === 'pending') {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg cursor-not-allowed"
      >
        <Clock className="w-5 h-5" />
        Onay Bekleniyor
      </button>
    );
  }

  if (status === 'rejected') {
    return (
      <button
        onClick={handleRequestAccess}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Tekrar İzin İste
      </button>
    );
  }

  return (
    <button
      onClick={handleRequestAccess}
      disabled={isRequesting}
      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
    >
      {isRequesting ? 'İstek Gönderiliyor...' : 'Erişim İzni İste'}
    </button>
  );
}