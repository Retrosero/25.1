import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    series?: string;
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
        // TODO: Implement actual login logic
        set({
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'Demo Kullanıcı',
            email,
          },
        });
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