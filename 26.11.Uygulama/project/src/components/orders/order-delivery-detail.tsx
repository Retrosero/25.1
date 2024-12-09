import { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useOrders } from '../../hooks/use-orders';
import { useApprovals } from '../../hooks/use-approvals';
import { useAuth } from '../../hooks/use-auth';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface OrderDeliveryDetailProps {
  orderId: string;
  onClose: () => void;
  readOnly?: boolean;
}

export function OrderDeliveryDetail({ orderId, onClose, readOnly = false }: OrderDeliveryDetailProps) {
  const navigate = useNavigate();
  const { getOrderById, updateOrder, getOrdersByStatus } = useOrders();
  const { addApproval } = useApprovals();
  const { user } = useAuth();
  const [deliveredItems, setDeliveredItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  const order = getOrderById(orderId);
  if (!order) return null;

  // Initialize delivered items if not set
  if (deliveredItems.length === 0 && order.items) {
    setDeliveredItems(order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })));
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (readOnly) return;
    setDeliveredItems(prev => 
      prev.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const hasQuantityChanges = order.items.some(item => {
    const deliveredItem = deliveredItems.find(i => i.productId === item.productId);
    return deliveredItem && deliveredItem.quantity !== item.quantity;
  });

  const calculateNewTotal = () => {
    return order.items.reduce((total, item) => {
      const deliveredItem = deliveredItems.find(i => i.productId === item.productId);
      return total + (item.price * (deliveredItem?.quantity || 0));
    }, 0);
  };

  const handleDelivery = () => {
    if (readOnly) return;

    if (hasQuantityChanges) {
      // Create approval request for quantity changes
      const updatedOrder = {
        ...order,
        items: order.items.map(item => {
          const deliveredItem = deliveredItems.find(i => i.productId === item.productId);
          return {
            ...item,
            quantity: deliveredItem?.quantity || item.quantity
          };
        }),
        totalAmount: calculateNewTotal(),
        pendingApproval: true
      };

      addApproval({
        type: 'order_change',
        user: user?.name || 'Unknown User',
        oldData: order,
        newData: updatedOrder,
        description: `${order.customer.name} - Teslimat Miktarı Değişikliği`,
        amount: updatedOrder.totalAmount,
        customer: order.customer,
      });

      updateOrder(order.id, { pendingApproval: true });
      onClose();
    } else {
      // Get all orders in the current route
      const routeOrders = [...getOrdersByStatus('ready'), ...getOrdersByStatus('delivered')]
        .filter(o => o.routeId === order.routeId)
        .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0));

      // Update current order status
      updateOrder(order.id, {
        status: 'delivered',
        deliveryDate: new Date().toISOString()
      });

      // Check if this was the last undelivered order in the route
      const remainingUndelivered = routeOrders.filter(o => 
        o.id !== order.id && o.status !== 'delivered'
      );

      if (remainingUndelivered.length === 0) {
        // This was the last order, mark the entire route as completed
        const completedDate = new Date().toISOString();
        routeOrders.forEach(o => {
          updateOrder(o.id, {
            completedRouteDate: completedDate
          });
        });

        onClose();
        navigate('/orders/completed-deliveries');
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium">Sipariş Detayı</h3>
            <p className="text-sm text-gray-500">#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <h4 className="font-medium mb-2">Müşteri Bilgileri</h4>
            <p>{order.customer.name}</p>
            <p className="text-sm text-gray-500">{order.customer.address}</p>
            <p className="text-sm text-gray-500">Tel: {order.customer.phone}</p>
            {order.deliveryDate && (
              <p className="text-sm text-gray-500 mt-2">
                Teslim Tarihi: {new Date(order.deliveryDate).toLocaleString('tr-TR')}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {order.items.map((item) => {
              const deliveredItem = deliveredItems.find(i => i.productId === item.productId);
              const quantity = deliveredItem?.quantity || 0;

              return (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">Sipariş: {item.quantity} adet</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {!readOnly && !order.pendingApproval ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, Math.max(0, quantity - 1))}
                          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, quantity + 1)}
                          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="w-12 text-center">{item.quantity} adet</span>
                    )}
                    <p className="w-24 text-right font-medium">
                      {formatCurrency(item.price * (readOnly ? item.quantity : quantity))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Toplam Tutar</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(readOnly ? order.totalAmount : calculateNewTotal())}
                </p>
                {order.pendingApproval && (
                  <p className="text-sm text-yellow-500 mt-1">Onay Bekliyor</p>
                )}
              </div>
              {!readOnly && !order.pendingApproval && (
                <button
                  onClick={handleDelivery}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Check className="w-5 h-5" />
                  <span>Teslim Et</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}