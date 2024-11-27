import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, UserPermission } from '../types/user';
import { permissions } from '../data/permissions';

interface UsersState {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  updateUserPermissions: (userId: string, permissions: UserPermission[]) => void;
  hasPermission: (userId: string, permissionId: string) => boolean;
  grantFullPermissions: () => void;
}

// Create initial admin user with all permissions
const adminUser: User = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  active: true,
  permissions: permissions.map(p => ({ id: p.id, allowed: true })),
  createdAt: new Date().toISOString(),
};

export const useUsers = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [adminUser],

      addUser: (user) => {
        const newUser: User = {
          ...user,
          id: `USER${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          permissions: permissions.map(p => ({ id: p.id, allowed: true })),
        };

        set(state => ({
          users: [...state.users, newUser]
        }));
      },

      updateUser: (id, updates) => {
        set(state => ({
          users: state.users.map(user =>
            user.id === id ? { ...user, ...updates } : user
          )
        }));
      },

      deleteUser: (id) => {
        set(state => ({
          users: state.users.filter(user => user.id !== id)
        }));
      },

      getUserById: (id) => {
        return get().users.find(user => user.id === id);
      },

      getUsersByRole: (role) => {
        return get().users.filter(user => user.role === role);
      },

      updateUserPermissions: (userId, newPermissions) => {
        set(state => ({
          users: state.users.map(user =>
            user.id === userId
              ? { ...user, permissions: newPermissions }
              : user
          )
        }));
      },

      hasPermission: (userId, permissionId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return false;
        
        // Admin always has access
        if (user.role === 'admin') return true;
        
        // All users have basic access if no specific permission is required
        if (!permissionId) return true;
        
        const permission = user.permissions.find(p => p.id === permissionId);
        return permission?.allowed || false;
      },

      grantFullPermissions: () => {
        set(state => ({
          users: state.users.map(user => ({
            ...user,
            permissions: permissions.map(p => ({ id: p.id, allowed: true }))
          }))
        }));
      },
    }),
    {
      name: 'users-storage',
    }
  )
);