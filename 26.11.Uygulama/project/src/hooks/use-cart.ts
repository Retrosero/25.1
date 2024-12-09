import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  productId: string;
  quantity: number;
  note?: string;
};

type CartState = {
  items: CartItem[];
  discount: number;
  orderNote: string;
  addItem: (productId: string, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number, note?: string) => void;
  removeItem: (productId: string) => void;
  setItemNote: (productId: string, note: string) => void;
  setDiscount: (discount: number) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;
  getTotal: (products: any[]) => { subtotal: number; discount: number; total: number };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      orderNote: '',
      
      addItem: (productId, quantity) => {
        const items = get().items;
        const existingItem = items.find(item => item.productId === productId);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { productId, quantity }] });
        }
      },

      updateQuantity: (productId, quantity, note?: string) => {
        const items = get().items;
        if (quantity <= 0) {
          set({ items: items.filter(item => item.productId !== productId) });
        } else {
          const existingItem = items.find(item => item.productId === productId);
          if (existingItem) {
            set({
              items: items.map(item =>
                item.productId === productId ? { ...item, quantity, ...(note !== undefined && { note }) } : item
              ),
            });
          } else {
            set({ items: [...items, { productId, quantity, note }] });
          }
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.productId !== productId) });
      },

      setItemNote: (productId, note) => {
        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, note }
              : item
          ),
        });
      },

      setDiscount: (discount) => set({ discount }),
      setOrderNote: (note) => set({ orderNote: note }),
      clearCart: () => set({ items: [], discount: 0, orderNote: '' }),

      getTotal: (products) => {
        const items = get().items;
        const discount = get().discount;
        
        const subtotal = items.reduce((sum, item) => {
          const product = products.find(p => p.sto_kod === item.productId);
          return sum + (product?.sfiyat_fiyati || 0) * item.quantity;
        }, 0);

        const discountAmount = subtotal * (discount / 100);
        const total = subtotal - discountAmount;

        return { subtotal, discount: discountAmount, total };
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);