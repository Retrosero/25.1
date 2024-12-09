import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant, SubscriptionPlan } from '../types/tenant';

interface TenantsState {
  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, 'id' | 'apiKey' | 'createdAt'>) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  getTenantByApiKey: (apiKey: string) => Tenant | undefined;
  generateApiKey: () => string;
  calculateExpiryDate: (plan: SubscriptionPlan) => string;
}

export const useTenants = create<TenantsState>()(
  persist(
    (set, get) => ({
      tenants: [],
      
      addTenant: (tenant) => {
        const apiKey = get().generateApiKey();
        const newTenant: Tenant = {
          ...tenant,
          id: `TNT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          apiKey,
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          tenants: [...state.tenants, newTenant]
        }));
      },

      updateTenant: (id, updates) => {
        set(state => ({
          tenants: state.tenants.map(tenant =>
            tenant.id === id ? { ...tenant, ...updates } : tenant
          )
        }));
      },

      deleteTenant: (id) => {
        set(state => ({
          tenants: state.tenants.filter(tenant => tenant.id !== id)
        }));
      },

      getTenantByApiKey: (apiKey) => {
        return get().tenants.find(tenant => tenant.apiKey === apiKey);
      },

      generateApiKey: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const segments = 4;
        const segmentLength = 8;
        
        const segments_arr = [];
        for (let i = 0; i < segments; i++) {
          let segment = '';
          for (let j = 0; j < segmentLength; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          segments_arr.push(segment);
        }
        
        return segments_arr.join('-');
      },

      calculateExpiryDate: (plan) => {
        const date = new Date();
        if (plan === 'monthly') {
          date.setMonth(date.getMonth() + 1);
        } else {
          date.setFullYear(date.getFullYear() + 1);
        }
        return date.toISOString();
      },
    }),
    {
      name: 'tenants-storage',
    }
  )
);