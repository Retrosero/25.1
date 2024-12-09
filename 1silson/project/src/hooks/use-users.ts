import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Permission, UserPermission } from '../types/user';
import { permissions } from '../data/permissions';

type RolePermissions = {
  role: UserRole;
  permissions: UserPermission[];
};

interface UsersState {
  users: User[];
  rolePermissions: RolePermissions[];
  defaultRolePermissions: Record<UserRole, UserPermission[]>;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  hasPermission: (userId: string, permissionId: string) => boolean;
  updateUserPermissions: (userId: string, permissions: UserPermission[]) => void;
  updateRolePermissions: (role: UserRole, permissions: UserPermission[]) => void;
  getRolePermissions: (role: UserRole) => UserPermission[];
  grantFullPermissions: () => void;
}

const adminUser = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin' as UserRole,
  active: true,
  permissions: permissions.map(p => ({ id: p.id, allowed: true })),
  createdAt: new Date().toISOString(),
};

export const useUsers = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [{
        ...adminUser,
        permissions: permissions.map(p => ({ id: p.id, allowed: true })),
      }],
      rolePermissions: [],
      defaultRolePermissions: {
        admin: permissions.map(p => ({ id: p.id, allowed: true })),
        supervisor: permissions.map(p => ({ id: p.id, allowed: false })),
        manager: permissions.map(p => ({ id: p.id, allowed: false })),
        sales: permissions.map(p => ({ id: p.id, allowed: false })),
        warehouse: permissions.map(p => ({ id: p.id, allowed: false })),
        accounting: permissions.map(p => ({ id: p.id, allowed: false })),
      },

      addUser: (user) => {
        const defaultPerms = get().defaultRolePermissions[user.role];
        const newUser: User = {
          ...user,
          id: `USER${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          permissions: defaultPerms || [],
        };

        set(state => ({
          users: [...state.users, newUser],
        }));
      },

      updateUser: (id, updates) => {
        set(state => ({
          users: state.users.map(user =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
      },

      deleteUser: (id) => {
        set(state => ({
          users: state.users.filter(user => user.id !== id),
        }));
      },

      hasPermission: (userId, permissionId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return false;

        // Admin has all permissions
        if (user.role === 'admin') return true;
        
        // First check user-specific permissions
        const userPermission = user.permissions.find(p => p.id === permissionId);
        if (userPermission) {
          return userPermission.allowed;
        }
        
        // Then check role permissions
        const rolePerms = get().rolePermissions.find(rp => rp.role === user.role);
        if (rolePerms) {
          const rolePermission = rolePerms.permissions.find(p => p.id === permissionId);
          if (rolePermission) {
            return rolePermission.allowed;
          }
        }

        return false;
      },

      updateUserPermissions: (userId, newPermissions) => {
        set(state => ({
          users: state.users.map(user =>
            user.id === userId
              ? { 
                  ...user, 
                  permissions: [
                    ...user.permissions.filter(p => !newPermissions.find(np => np.id === p.id)),
                    ...newPermissions
                  ]
                }
              : user
          ),
        }));
      },

      updateRolePermissions: (role, permissions) => {
        set(state => ({
          rolePermissions: [
            ...state.rolePermissions.filter(rp => rp.role !== role),
            { role, permissions }
          ],
        }));
      },

      getRolePermissions: (role) => {
        const rolePerms = get().rolePermissions.find(rp => rp.role === role);
        if (rolePerms) return rolePerms.permissions;
        return get().defaultRolePermissions[role] || [];
      },

      grantFullPermissions: () => {
        const allPermissions = permissions.map(p => ({
          id: p.id,
          allowed: true,
        }));

        set(state => ({
          defaultRolePermissions: {
            ...state.defaultRolePermissions,
            admin: allPermissions,
          },
        }));
      },
    }),
    {
      name: 'users-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            users: persistedState.users.map((user: User) => ({
              ...user,
              permissions: user.role === 'admin' 
                ? permissions.map(p => ({ id: p.id, allowed: true }))
                : permissions.map(p => ({ id: p.id, allowed: false }))
            }))
          };
        }
        return persistedState;
      },
    }
  )
);