import { X, MapPin } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface RouteDetailPopupProps {
  route: {
    date: string;
    orders: any[];
    totalAmount: number;
  };
  onClose: () => void;
}

export function RouteDetailPopup({ route, onClose }: RouteDetailPopupProps) {
  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">Teslimat Detayı</h3>
            <p className="text-sm text-gray-500">
              {new Date(route.date).toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Toplam Sipariş</p>
              <p className="text-xl font-bold">{route.orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Toplam Tutar</p>
              <p className="text-xl font-bold">{formatCurrency(route.totalAmount)}</p>
            </div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-4">
              {route.orders
                .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0))
                .map((order, index) => (
                  <div
                    key={order.id}
                    className="relative ml-16 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1/2 -translate-x-[2.25rem] -translate-y-1/2 w-4 h-4 rounded-full bg-primary-600" />

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-primary-600 rounded-full text-sm font-medium">
                            {order.routeOrder}
                          </span>
                          <h4 className="font-medium">{order.customer.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500">{order.customer.address}</p>
                        <p className="text-sm text-gray-500">Tel: {order.customer.phone}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item: any) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{item.name}</span>
                          <span>{item.quantity} adet</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => openInMaps(order.customer.address)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Konum</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}