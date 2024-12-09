import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { fetchCustomers, fetchCustomerBalance } from '../../lib/api';
import { Customer } from '../../types/customer';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../lib/utils';

interface CustomerSelectorProps {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

export function CustomerSelector({ onSelect, onClose }: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch customers with search
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: () => fetchCustomers(searchQuery),
  });

  // Fetch all customer balances in one query
  const { data: balances } = useQuery({
    queryKey: ['customerBalances'],
    queryFn: async () => {
      if (!customers) return {};
      const balancePromises = customers.map(customer => 
        fetchCustomerBalance(customer.id)
          .then(balance => ({ [customer.id]: balance }))
          .catch(() => ({ [customer.id]: 0 }))
      );
      const balanceResults = await Promise.all(balancePromises);
      return Object.assign({}, ...balanceResults);
    },
    enabled: !!customers,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Müşteri Seçimi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Müşteri ara (isim, telefon veya vergi no)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
              autoFocus
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              {customers?.map((customer) => {
                const balance = balances?.[customer.id] ?? 0;
                
                return (
                  <button
                    key={customer.id}
                    onClick={() => onSelect(customer)}
                    className="w-full text-left p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-gray-500">VN: {customer.taxNumber}</p>
                        <p className="text-sm text-gray-500">{customer.address}</p>
                        <p className="text-sm text-gray-500">Tel: {customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Bakiye</p>
                        <p className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}