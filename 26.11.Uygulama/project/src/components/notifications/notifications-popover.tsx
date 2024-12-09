import { X, Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/use-notifications';
import { useAuth } from '../../hooks/use-auth';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NotificationsPopoverProps {
  onClose: () => void;
}

export function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
  const { user } = useAuth();
  const { notifications, markAsRead, getUserNotifications } = useNotifications();
  
  const userNotifications = user 
    ? getUserNotifications(user.id, user.role === 'admin')
    : [];
  
  const unreadNotifications = userNotifications.filter(n => !n.read);

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-medium">Bildirimler</h3>
          {unreadNotifications.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
              {unreadNotifications.length} yeni
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="text-sm text-primary-600 hover:text-primary-700"
            onClick={onClose}
          >
            Tümünü Gör
          </Link>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {userNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Bildirim bulunmuyor
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {userNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.date), { addSuffix: true, locale: tr })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {userNotifications.length > 5 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/notifications"
            className="block w-full text-center text-sm text-primary-600 hover:text-primary-700"
            onClick={onClose}
          >
            Tümünü Gör ({userNotifications.length})
          </Link>
        </div>
      )}
    </div>
  );
}