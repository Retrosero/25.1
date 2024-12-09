import { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, Eye, Printer, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOrders, OrderStatus } from '../../hooks/use-orders';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';

const tabs: { id: OrderStatus; label: string }[] = [
  { id: 'preparing', label: 'Hazırlanacak' },
  { id: 'checking', label: 'Kontrol Edilecek' },
  { id: 'loading', label: 'Yüklenecek' },
  { id: 'ready', label: 'Teslim Edilecek' },
  { id: 'delivered', label: 'Teslim Edilenler' },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const { getOrdersByStatus, getStatusCounts } = useOrders();
  const tabsRef = useRef<HTMLDivElement>(null);

  const activeTab = (searchParams.get('status') as OrderStatus) || 'preparing';
  const statusCounts = getStatusCounts();

  const orders = getOrdersByStatus(activeTab).filter(order => {
    const matchesSearch = !searchQuery || 
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || order.date.startsWith(selectedDate);
    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    const data = orders.map(order => ({
      'Sipariş No': order.id,
      'Tarih': new Date(order.date).toLocaleString('tr-TR'),
      'Müşteri': order.customer.name,
      'Adres': order.customer.address,
      'Telefon': order.customer.phone,
      'Tutar': formatCurrency(order.totalAmount),
      'Durum': order.status === 'preparing' ? 'Hazırlanıyor' :
               order.status === 'checking' ? 'Kontrol Ediliyor' :
               order.status === 'loading' ? 'Yükleniyor' :
               order.status === 'ready' ? 'Teslime Hazır' :
               'Teslim Edildi'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Siparişler');
    XLSX.writeFile(wb, `siparisler-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    
    const scrollAmount = 200;
    const container = tabsRef.current;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Siparişler</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Excel
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 relative">
        <button
          onClick={() => handleScroll('left')}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div 
          ref={tabsRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex gap-2 min-w-max px-2 py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(`/orders?status=${tab.id}`)}
                className={cn(
                  'px-4 py-2 rounded-lg relative whitespace-nowrap min-w-[120px]',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                )}
              >
                {tab.label}
                {statusCounts[tab.id] > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center z-20">
                    {statusCounts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sipariş ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48 pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Sipariş #{order.id}</h3>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'checking' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'loading' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  )}>
                    {order.status === 'preparing' ? 'Hazırlanıyor' :
                     order.status === 'checking' ? 'Kontrol Ediliyor' :
                     order.status === 'loading' ? 'Yükleniyor' :
                     order.status === 'ready' ? 'Teslime Hazır' :
                     'Teslim Edildi'}
                  </span>
                  {order.pendingApproval && (
                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                      Onay Bekliyor
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleString('tr-TR')}
                </p>
                <div className="mt-2">
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">{order.customer.address}</p>
                  <p className="text-sm text-gray-500">Tel: {order.customer.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(order.totalAmount)}</p>
                <button
                  onClick={() => navigate(`/orders/preparation/${order.id}`)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Eye className="w-5 h-5" />
                  <span>
                    {order.status === 'preparing' ? 'Hazırla' :
                     order.status === 'checking' ? 'Kontrol Et' :
                     order.status === 'loading' ? 'Yükle' :
                     'Görüntüle'}
                  </span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium mb-2">Sipariş İçeriği</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className={cn(
                      "flex justify-between items-center p-2 rounded-lg",
                      item.collectedQuantity === item.quantity ? "bg-green-50 dark:bg-green-900/20" :
                      item.collectedQuantity > item.quantity ? "bg-yellow-50 dark:bg-yellow-900/20" :
                      item.collectedQuantity < item.quantity ? "bg-red-50 dark:bg-red-900/20" :
                      "bg-gray-50 dark:bg-gray-700/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      {item.collectedQuantity !== undefined && (
                        <p className={cn(
                          "text-sm",
                          item.collectedQuantity === item.quantity ? "text-green-600" :
                          item.collectedQuantity > item.quantity ? "text-yellow-600" :
                          "text-red-600"
                        )}>
                          Toplanan: {item.collectedQuantity}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}