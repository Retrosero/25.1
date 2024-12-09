import { useState } from 'react';
import { Search, UserPlus, Filter, Plus, CreditCard, Phone, MapPin, Eye, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { fetchCustomerBalance } from '../lib/api';
import { getCustomers } from '../lib/db/customer';
import { syncCustomers } from '../lib/db/sync';
import { Customer } from '../types/customer';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function normalizeText(text) {
  const charMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };

  return text
    .split('')
    .map(char => charMap[char] || char)
    .join('')
    .toLowerCase();
}
 
export function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBalances, setShowBalances] = useState(() => {
    const saved = localStorage.getItem('showCustomerBalances');
    return saved ? JSON.parse(saved) : true;
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch customers with search
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      const dbCustomers = await getCustomers();

      // Normalize search query
      const normalizedSearch = normalizeText(searchQuery);

      // Verilerde filtreleme yap
      const filteredCustomers = dbCustomers.filter(customer => {
        const normalizedName = normalizeText(customer.name || '');
        const normalizedPhone = normalizeText(customer.phone || '');
        const normalizedCode = normalizeText(customer.cari_kod || '');

        return (
          normalizedName.includes(normalizedSearch) ||
          normalizedPhone.includes(normalizedSearch) ||
          normalizedCode.includes(normalizedSearch)
        );
      });

      // Senkronizasyon işlemini başlat
      syncCustomers().then(syncedCount => {
        if (syncedCount > 0) {
          queryClient.invalidateQueries(['customers']);
        }
      });

      return filteredCustomers;
    },
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

  const handleCustomerClick = (customer: Customer) => {
    navigate(`/customers/${customer.cari_kod}`);
  };

  const handleSaleClick = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/sales', { state: { customer } });
  };

  const handlePaymentClick = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/payments', { state: { customer } });
  };

  const openLocation = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteriler</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <UserPlus className="w-5 h-5" />
          <span>Yeni Müşteri</span>
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri ara (isim, telefon, cari kod)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <button className="px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <Filter className="w-5 h-5" />
        </button>
        <button 
          onClick={() => {
            const newValue = !showBalances;
            setShowBalances(newValue);
            localStorage.setItem('showCustomerBalances', JSON.stringify(newValue));
          }}
          className={`px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
            showBalances ? 'text-primary-600' : 'text-gray-900 dark:text-white'
          }`}
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Müşteriler yükleniyor...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-600 dark:text-red-400">{error instanceof Error ? error.message : 'Bir hata oluştu'}</p>
        </div>
      )}

      <div className="space-y-4">
        {!isLoading && !error && customers?.map((customer) => (
          <div
            key={customer.id}
            onClick={() => handleCustomerClick(customer)}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">#{customer.cari_kod}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{customer.region || 'Bölge Belirtilmemiş'}</span>
              </div>
              <div 
                onClick={(e) => openLocation(customer.address, e)}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{customer.address}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              {showBalances && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bakiye</p>
                  <p className={`text-lg font-medium ${(balances?.[customer.id] || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(balances?.[customer.id] || 0)}
                  </p>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={(e) => handleSaleClick(customer, e)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Satış</span>
                </button>
                <button 
                  onClick={(e) => handlePaymentClick(customer, e)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Tahsilat</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && !error && customers?.length === 0 && (
          <p className="text-center py-12 text-gray-500">Müşteri bulunamadı</p>
        )}
      </div>
    </div>
  );
}
 