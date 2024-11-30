import { useState } from 'react';
import { useNotifications } from '../hooks/use-notifications';
import { useAuth } from '../hooks/use-auth';
import { useUsers } from '../hooks/use-users';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale'; 
import { Check, X, Bell, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAccessRequests } from '../hooks/use-access-requests';

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const { hasPermission } = useUsers();
  const { updateRequestStatus } = useAccessRequests();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const canApprove = user?.role === 'admin' || hasPermission(user?.id || '', 'approvals.approve');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return filter === 'unread' ? !notification.read : notification.read;
  }).filter(notification => 
    !notification.userId || notification.userId === user?.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bildirimler</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1 rounded-lg text-sm",
              filter === 'all' ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700"
            )}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              "px-3 py-1 rounded-lg text-sm",
              filter === 'unread' ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700"
            )}
          >
            Okunmamış
          </button>
          <button
            onClick={() => setFilter('read')}
            className={cn(
              "px-3 py-1 rounded-lg text-sm",
              filter === 'read' ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700"
            )}
          >
            Okunmuş
          </button>
        </div>
        {filteredNotifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50 px-3 py-1 rounded-lg"
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz bildiriminiz yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-4 rounded-lg border flex items-start gap-4",
                notification.read ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" : "bg-white dark:bg-gray-900 border-primary-200 dark:border-primary-800"
              )}
            >
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { locale: tr, addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
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
                {notification.type === 'access_request' && !notification.data?.status && canApprove && (
                  <>
                    <button
                      onClick={() => {
                        updateRequestStatus(notification.data.id, 'approved', user?.name || '');
                        markAsRead(notification.id);
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg"
                      title="Onayla"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        updateRequestStatus(notification.data.id, 'rejected', user?.name || '');
                        markAsRead(notification.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                      title="Reddet"
                    >
                      <ShieldX className="w-4 h-4" />
                    </button>
                  </>
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
          ))}
        </div>
      )}
    </div>
  );
}