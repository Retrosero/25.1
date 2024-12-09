import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { customers } from '../data/customers';

type CustomerState = {
  selectedCustomer: typeof customers[0] | null;
  setSelectedCustomer: (customer: typeof customers[0] | null) => void;
};

export const useCustomer = create<CustomerState>()(
  persist(
    (set) => ({
      selectedCustomer: null,
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
    }),
    {
      name: 'customer-storage',
    }
  )
);