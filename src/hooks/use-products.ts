import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts } from '../data/products';

export type ProductImage = {
  id: string;
  url: string;
  order: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images: ProductImage[];
  brand?: string;
  category?: string;
  barcode?: string;
  shelf?: string;
  packaging?: string;
};

type ProductsState = {
  products: Product[];
  updateProduct: (productId: string, action: 'update' | 'increaseStock' | 'decreaseStock' | 'addImage' | 'removeImage' | 'reorderImages', payload: any) => void;
  getProduct: (productId: string) => Product | undefined;
};

export const useProducts = create<ProductsState>()(
  persist(
    (set, get) => ({
      // Convert initial products to include images array
      products: initialProducts.map(p => ({
        ...p,
        images: [{ id: '1', url: p.image, order: 0 }],
      })),
      
      updateProduct: (productId, action, payload) => {
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== productId) return product;

            switch (action) {
              case 'update':
                return { ...product, ...payload };
              
              case 'increaseStock':
                return { ...product, stock: product.stock + payload };
              
              case 'decreaseStock':
                return { ...product, stock: Math.max(0, product.stock - payload) };
              
              case 'addImage': {
                const newImage = {
                  id: Date.now().toString(),
                  url: payload.url,
                  order: (product.images || []).length
                };
                const updatedImages = [...(product.images || []), newImage]
                  .sort((a, b) => a.order - b.order);
                return {
                  ...product,
                  images: updatedImages,
                  image: updatedImages[0]?.url || product.image // Update main image if it's the first image
                };
              }
              
              case 'removeImage': {
                const updatedImages = (product.images || [])
                  .filter(img => img.id !== payload)
                  .map((img, idx) => ({ ...img, order: idx }));
                return {
                  ...product,
                  images: updatedImages,
                  image: updatedImages[0]?.url || product.image // Update main image if first image changed
                };
              }
              
              case 'reorderImages': {
                const imageIds = payload as string[];
                const updatedImages = imageIds.map((id, idx) => ({
                  ...product.images.find(img => img.id === id)!,
                  order: idx
                }));
                return {
                  ...product,
                  images: updatedImages,
                  image: updatedImages[0]?.url || product.image // Update main image if order changed
                };
              }
              
              default:
                return product;
            }
          }),
        }));
      },

      getProduct: (productId) => {
        return get().products.find(p => p.id === productId);
      },
    }),
    {
      name: 'products-storage',
    }
  )
);