import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NotificationType = 'system' | 'access_request';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  userId?: string;
  data?: any;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
  getUserNotifications: (userId: string) => Notification[];
}

export const useNotifications = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `NOTIF${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },

      markAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        }));
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true
          }))
        }));
      },

      deleteNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(notification => notification.id !== id)
        }));
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
      },

      getUserNotifications: (userId) => {
        return get().notifications.filter(notification => 
          !notification.userId || notification.userId === userId
        );
      },
    }),
    {
      name: 'notifications-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            notifications: persistedState.notifications.map((n: any) => ({
              ...n,
              createdAt: n.date || new Date().toISOString()
            }))
          };
        }
        return persistedState;
      },
    }
  )
);