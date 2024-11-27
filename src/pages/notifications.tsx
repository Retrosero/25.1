import { useState } from 'react';
import { useNotifications } from '../hooks/use-notifications';
import { useAuth } from '../hooks/use-auth';
import { useUsers } from '../hooks/use-users';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Check, X, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const { hasPermission } = useUsers();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const canApprove = user?.role === 'admin' || hasPermission(user?.id || '', 'approvals.approve');

  const filteredNotifications = notifications.filter(notification => {
    // Only show access requests to admins and users with approval permission
    if (notification.type === 'access_request' && !canApprove) {
      return false;
    }

    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bildirimler</h1>
          <p className="text-sm text-gray-500">
            {notifications.filter(n => !n.read).length} okunmamış bildirim
          </p>
        </div>
        <button
          onClick={() => markAllAsRead()}
          className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-lg"
        >
          Tümünü Okundu İşaretle
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg',
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          )}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-4 py-2 rounded-lg',
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          )}
        >
          Okunmamış
        </button>
        <button
          onClick={() => setFilter('read')}
          className={cn(
            'px-4 py-2 rounded-lg',
            filter === 'read'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          )}
        >
          Okunmuş
        </button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'bg-white dark:bg-gray-800 rounded-lg border p-4',
              !notification.read ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-600" />
                  <h3 className="font-medium">{notification.title}</h3>
                  {!notification.read && (
                    <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
                      Yeni
                    </span>
                  )}
                </div>
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

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Bildirim Bulunamadı
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? 'Okunmamış bildiriminiz bulunmuyor'
                : filter === 'read'
                ? 'Okunmuş bildiriminiz bulunmuyor'
                : 'Hiç bildiriminiz bulunmuyor'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}