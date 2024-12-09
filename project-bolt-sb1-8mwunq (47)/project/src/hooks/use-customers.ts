import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { customers as initialCustomers, Customer } from '../data/customers';

type CustomersState = {
  customers: Customer[];
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  getCustomer: (id: string) => Customer | undefined;
};

export const useCustomers = create<CustomersState>()(
  persist(
    (set, get) => ({
      customers: initialCustomers,
      
      updateCustomer: (id, updates) => {
        set(state => ({
          customers: state.customers.map(customer =>
            customer.id === id ? { ...customer, ...updates } : customer
          ),
        }));
      },

      getCustomer: (id) => {
        return get().customers.find(c => c.id === id);
      },
    }),
    {
      name: 'customers-storage',
    }
  )
);