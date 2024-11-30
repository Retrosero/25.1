import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUsers } from './use-users';

type AuthState = {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<AuthState['user']>) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email: string, password: string) => {
        const { users } = useUsers.getState();
        const user = users.find(u => u.email === email && u.password === password);

        if (user && user.active) {
          set({
            isAuthenticated: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              permissions: user.permissions,
            },
          });
        } else {
          throw new Error('Invalid credentials');
        }
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
      updateUserProfile: (updates) => {
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);