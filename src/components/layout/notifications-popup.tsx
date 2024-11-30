import { X, Bell, Check } from 'lucide-react';
import { useNotifications } from '../../hooks/use-notifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '../../lib/utils';

import { useAuth } from '../../hooks/use-auth';

interface NotificationsPopupProps {
  onClose: () => void;
}

export function NotificationsPopup({ onClose }: NotificationsPopupProps) {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();

  // Filter notifications to only show relevant ones for the current user
  const userNotifications = notifications.filter(notification => 
    !notification.userId || notification.userId === user?.id
  );

  const handleNotificationClick = (notification: any) => {
    if (notification.data?.todoId) {
      navigate('/todos');
      markAsRead(notification.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mt-16 mr-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-medium">Bildirimler</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllAsRead()}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Tümünü Okundu İşaretle
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          {userNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Bildirim bulunmuyor
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {userNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    !notification.read && "bg-primary-50 dark:bg-primary-900/20",
                    notification.data?.todoId && "cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.date), {
                          addSuffix: true,
                          locale: tr
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-lg"
                          title="Okundu İşaretle"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                        title="Sil"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}