import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AccessRequest } from '../types/user';
import { useNotifications } from './use-notifications';
import { useUsers } from './use-users';

interface AccessRequestsState {
  requests: AccessRequest[];
  addRequest: (request: Omit<AccessRequest, 'id' | 'status' | 'requestDate'>) => void;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected', respondedBy: string) => void;
  getRequestsByStatus: (status: AccessRequest['status']) => AccessRequest[];
  getRequestsByUser: (userId: string) => AccessRequest[];
}

export const useAccessRequests = create<AccessRequestsState>()(
  persist(
    (set, get) => ({
      requests: [],

      addRequest: (request) => {
        const { addNotification } = useNotifications.getState();
        
        const newRequest: AccessRequest = {
          ...request,
          id: `REQ${Math.random().toString(36).substr(2, 9)}`,
          status: 'pending',
          requestDate: new Date().toISOString(),
        };

        addNotification({
          type: 'access_request',
          title: 'Yeni Erişim Talebi',
          message: `${request.userName} kullanıcısı ${request.permissionName} izni için erişim talebinde bulundu.`,
          date: new Date().toISOString(),
          data: newRequest,
        });

        set(state => ({
          requests: [newRequest, ...state.requests]
        }));
      },

      updateRequestStatus: (id, status, respondedBy) => {
        const { addNotification } = useNotifications.getState();
        const request = get().requests.find(r => r.id === id);
        const { updateUserPermissions } = useUsers.getState();

        if (request) {
          // When approving, grant the requested permission
          if (status === 'approved') {
            updateUserPermissions(request.userId, [{
              id: request.permissionId,
              allowed: true
            }]);
          }

          addNotification({
            type: 'access_request',
            title: 'Erişim Talebi Güncellendi',
            message: `${request.permissionName} için erişim talebiniz ${
              status === 'approved' ? 'onaylandı' : 'reddedildi'
            }.`,
            date: new Date().toISOString(),
            data: { ...request, status },
          });
        }

        set(state => ({
          requests: state.requests.map(request =>
            request.id === id
              ? {
                  ...request,
                  status,
                  responseDate: new Date().toISOString(),
                  respondedBy,
                }
              : request
          ),
        }));
      },

      getRequestsByStatus: (status) => {
        return get().requests.filter(request => request.status === status);
      },

      getRequestsByUser: (userId) => {
        return get().requests.filter(request => request.userId === userId);
      },
    }),
    {
      name: 'access-requests-storage',
    }
  )
);