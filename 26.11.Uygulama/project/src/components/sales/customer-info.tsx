import { Edit } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Customer } from '../../types/customer';
import { fetchCustomerBalance } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';

interface CustomerInfoProps {
  customer: Customer;
  onEdit: () => void;
}

export function CustomerInfo({ customer, onEdit }: CustomerInfoProps) {
  const { data: balance = 0 } = useQuery({
    queryKey: ['customerBalance', customer.id],
    queryFn: () => fetchCustomerBalance(customer.id),
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{customer.name}</h3>
          <p className="text-sm text-gray-500">{customer.address}</p>
          <p className="text-sm text-gray-500">Tel: {customer.phone}</p>
          <p className="text-sm text-gray-500">VN: {customer.taxNumber}</p>
        </div>
        <div className="flex items-start gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Bakiye</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Müşteri Değiştir"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}