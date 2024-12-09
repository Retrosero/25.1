export type SubscriptionPlan = 'monthly' | 'yearly';

export type TenantStatus = 'active' | 'suspended' | 'expired';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  plan: SubscriptionPlan;
  status: TenantStatus;
  createdAt: string;
  expiresAt: string;
  maxUsers: number;
  features: {
    inventory: boolean;
    orders: boolean;
    reports: boolean;
    api: boolean;
  };
  adminUser: {
    email: string;
    password: string;
    name: string;
  };
}