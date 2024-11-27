import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/use-orders';
import { MapPin, Search, GripVertical } from 'lucide-react'; // Changed from DragHandle to GripVertical
import { formatCurrency } from '../../lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function OrderRoutePage() {
  const navigate = useNavigate();
  const { getOrdersByStatus, updateOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [routeOrders, setRouteOrders] = useState<string[]>([]);
  const [routeName, setRouteName] = useState(() => {
    const today = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `${today} Teslimat Rotası`;
  });

  // Get orders that are ready for delivery and not already in a route
  const readyOrders = getOrdersByStatus('ready')
    .filter(order => !order.routeId)
    .filter(order =>
      !searchQuery ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get orders that are already planned in this route
  const plannedOrders = routeOrders
    .map(orderId => readyOrders.find(order => order.id === orderId))
    .filter(Boolean);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(routeOrders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRouteOrders(items);
  };

  const handleStartDelivery = () => {
    // Save the route order and navigate to delivery page
    const routeId = `ROUTE${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    routeOrders.forEach((orderId, index) => {
      updateOrder(orderId, { 
        routeOrder: index + 1,
        routeId,
        routeName,
        routeDate: new Date().toISOString()
      });
    });
    navigate(`/orders/delivery?routeId=${routeId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teslimat Sırası</h1>
        {routeOrders.length > 0 && (
          <button
            onClick={handleStartDelivery}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <MapPin className="w-5 h-5" />
            <span>Teslimata Başla</span>
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Unplanned Orders */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium mb-4">Bekleyen Siparişler</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sipariş ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="p-4 space-y-4">
              {readyOrders
                .filter(order => !routeOrders.includes(order.id))
                .map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setRouteOrders([...routeOrders, order.id])}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{order.customer.name}</h3>
                        <p className="text-sm text-gray-500">{order.customer.address}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} Ürün
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Route Planning */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium mb-4">Teslimat Rotası</h2>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                placeholder="Rota İsmi"
              />
              <p className="text-sm text-gray-500 mt-2">{plannedOrders.length} sipariş</p>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="route-orders">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-4 space-y-4 min-h-[200px]"
                  >
                    {plannedOrders.map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-start gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              >
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-medium">{order.customer.name}</h3>
                                    <p className="text-sm text-gray-500">{order.customer.address}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRouteOrders(routeOrders.filter(id => id !== order.id));
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                  >
                                    <span className="sr-only">Kaldır</span>
                                    ×
                                  </button>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.items.length} Ürün • {formatCurrency(order.totalAmount)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
}