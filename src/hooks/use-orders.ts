import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'preparing' | 'checking' | 'loading' | 'ready' | 'delivered';

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  collectedQuantity?: number;
  note?: string;
};

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  customer: {
    id: string;
    name: string;
    taxNumber: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  note?: string;
  preparedBy?: string;
  preparationEndDate?: string;
  checkedBy?: string;
  checkEndDate?: string;
  loadedBy?: string;
  loadingEndDate?: string;
  deliveredBy?: string;
  deliveryDate?: string;
  pendingApproval?: boolean;
  routeId?: string;
  routeName?: string;
  routeDate?: string;
  routeOrder?: number;
  completedRouteDate?: string;
};

type OrdersState = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrderItem: (orderId: string, productId: string, updates: Partial<OrderItem>) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByCustomer: (customerId: string) => Order[];
  getOrderById: (id: string) => Order | undefined;
  getStatusCounts: () => Record<OrderStatus, number>;
  setOrderPendingApproval: (orderId: string, pending: boolean) => void;
  deleteOrder: (orderId: string) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order) => {
        const newOrder = {
          ...order,
          id: `ORD${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString(),
        };
        
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
      },

      updateOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, ...updates }
              : order
          ),
        }));
      },

      updateOrderItem: (orderId, productId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.productId === productId
                      ? { ...item, ...updates }
                      : item
                  ),
                }
              : order
          ),
        }));
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      getOrdersByCustomer: (customerId) => {
        return get().orders.filter((order) => order.customer.id === customerId);
      },

      getOrderById: (id) => {
        return get().orders.find((order) => order.id === id);
      },

      getStatusCounts: () => {
        const orders = get().orders;
        return {
          preparing: orders.filter(o => o.status === 'preparing').length,
          checking: orders.filter(o => o.status === 'checking').length,
          loading: orders.filter(o => o.status === 'loading').length,
          ready: orders.filter(o => o.status === 'ready').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
        };
      },

      setOrderPendingApproval: (orderId, pending) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, pendingApproval: pending }
              : order
          ),
        }));
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter(order => order.id !== orderId)
        }));
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);