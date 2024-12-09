import { useState } from 'react';
import { useOrders } from '../../hooks/use-orders';
import { MapPin, Check } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { OrderDeliveryDetail } from '../../components/orders/order-delivery-detail';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function OrderDeliveryPage() {
  const navigate = useNavigate();
  const { getOrdersByStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get('routeId');

  // Get all orders with routes
  const allRouteOrders = [...getOrdersByStatus('ready'), ...getOrdersByStatus('delivered')]
    .filter(order => order.routeId && !order.completedRouteDate)
    .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0));

  // If no routeId is provided, use the latest route
  const activeRouteId = routeId || allRouteOrders[0]?.routeId;

  // Get orders for active route
  const routeOrders = allRouteOrders.filter(order => order.routeId === activeRouteId);
  const deliveredOrders = routeOrders.filter(order => order.status === 'delivered');
  const currentOrderIndex = deliveredOrders.length;

  const routeName = routeOrders[0]?.routeName || 'Teslimat Rotası';

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (!activeRouteId || routeOrders.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-500">Aktif teslimat rotası bulunamadı</h2>
          <p className="text-gray-400 mt-2">Lütfen önce bir teslimat rotası oluşturun</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{routeName}</h1>
          <p className="text-gray-500 mt-1">{routeOrders.length} Teslimat</p>
        </div>
      </div>

      <div className="space-y-4">
        {routeOrders.map((order, index) => {
          const isDelivered = order.status === 'delivered';
          const isCurrent = index === currentOrderIndex;

          return (
            <div
              key={order.id}
              className={cn(
                "relative pl-16",
                isDelivered && "opacity-60"
              )}
            >
              {/* Modern timeline design */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2",
                    isDelivered 
                      ? "bg-primary-600 border-primary-600 text-white" 
                      : isCurrent
                      ? "bg-white border-primary-600"
                      : "bg-white border-gray-300"
                  )}
                >
                  {isDelivered ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{order.routeOrder}</span>
                  )}
                </div>
                {index !== routeOrders.length - 1 && (
                  <div 
                    className={cn(
                      "w-0.5 flex-1 mt-2",
                      isDelivered ? "bg-primary-600" : "bg-gray-300"
                    )}
                  />
                )}
              </div>

              <div 
                onClick={() => !isDelivered && setSelectedOrder(order.id)}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-lg border p-4",
                  !isDelivered && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50",
                  isCurrent && "border-primary-600 shadow-lg",
                  !isCurrent && !isDelivered && "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{order.customer.name}</h3>
                    <p className="text-sm text-gray-500">{order.customer.address}</p>
                    {isDelivered && (
                      <p className="text-sm text-gray-500">
                        {new Date(order.deliveryDate!).toLocaleTimeString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(order.customer.address);
                      }}
                      className="flex items-center gap-1 px-2 py-1 mt-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Konum</span>
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {order.items.length} Ürün
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <OrderDeliveryDetail
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}