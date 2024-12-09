import { useState } from 'react';
import { useOrders } from '../../hooks/use-orders';
import { Search, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { OrderDeliveryDetail } from '../../components/orders/order-delivery-detail';

type CompletedRoute = {
  id: string;
  name: string;
  date: string;
  orders: any[];
  totalAmount: number;
};

export function CompletedDeliveriesPage() {
  const { getOrdersByStatus } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Get all delivered orders
  const deliveredOrders = getOrdersByStatus('delivered')
    .filter(order => order.routeId && order.completedRouteDate); // Only show completed routes

  // Group orders by route
  const completedRoutes = deliveredOrders.reduce((acc, order) => {
    if (!order.routeId) return acc;
    
    if (!acc[order.routeId]) {
      acc[order.routeId] = {
        id: order.routeId,
        name: order.routeName || 'Teslimat Rotası',
        date: order.completedRouteDate!,
        orders: [],
        totalAmount: 0
      };
    }
    acc[order.routeId].orders.push(order);
    acc[order.routeId].totalAmount += order.totalAmount;
    return acc;
  }, {} as Record<string, CompletedRoute>);

  // Convert to array and sort by date (newest first)
  const routes = Object.values(completedRoutes)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(route => 
      !searchQuery || 
      route.orders.some(order => 
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .filter(route => 
      !selectedDate || new Date(route.date).toISOString().split('T')[0] === selectedDate
    );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tamamlanan Teslimatlar</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri veya adres ara..."
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
        {routes.map((route) => {
          const isExpanded = expandedRoute === route.id;
          
          return (
            <div
              key={route.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div
                onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{route.name}</h3>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                      {route.orders.length} Sipariş
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <p>
                      {new Date(route.date).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>Toplam: {formatCurrency(route.totalAmount)}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {route.orders
                      .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0))
                      .map((order) => (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order.id)}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-primary-600 rounded-full text-sm font-medium">
                                {order.routeOrder}
                              </span>
                              <h4 className="font-medium">{order.customer.name}</h4>
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                Teslim Edildi
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{order.customer.address}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.deliveryDate!).toLocaleTimeString('tr-TR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                            <p className="text-sm text-gray-500">{order.items.length} Ürün</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <OrderDeliveryDetail
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          readOnly
        />
      )}
    </div>
  );
}