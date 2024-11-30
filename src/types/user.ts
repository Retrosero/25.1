export type UserRole = 'admin' | 'supervisor' | 'manager' | 'sales' | 'warehouse' | 'accounting';

export type Permission = {
  id: string;
  name: string;
  description: string;
  module: 'sales' | 'inventory' | 'customers' | 'orders' | 'payments' | 'approvals' | 'reports' | 'settings' | 'calendar';
};

export type UserPermission = {
  id: string;
  allowed: boolean;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  permissions: UserPermission[];
  series?: string;
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
  department?: string;
  phone?: string;
  notes?: string;
}

export type AccessRequest = {
  id: string;
  userId: string;
  userName: string;
  permissionId: string;
  permissionName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  responseDate?: string;
  respondedBy?: string;
  note?: string;
};

export type Notification = {
  id: string;
  type: 'access_request' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  userId?: string;
  data?: any;
};