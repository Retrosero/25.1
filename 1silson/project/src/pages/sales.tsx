import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Barcode, LayoutGrid, List, Table } from 'lucide-react';
import { cn } from '../lib/utils';
import { getProducts } from '../lib/db/sales';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/use-settings';
import { useCart } from '../hooks/use-cart';
import { useCustomer } from '../hooks/use-customer';
import { FloatingCart } from '../components/sales/floating-cart';
import { Pagination } from '../components/ui/pagination';
import { ProductCard } from '../components/sales/product-card';
import { CustomerSelector } from '../components/sales/customer-selector';
import { CustomerInfo } from '../components/sales/customer-info';

export function SalesPage() {
  const navigate = useNavigate();
  const { defaultViewMode, defaultItemsPerPage } = useSettings();
  const { items: cartItems, addItem, updateQuantity } = useCart();
  const { selectedCustomer, setSelectedCustomer } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [showCart, setShowCart] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!selectedCustomer) {
      setShowCustomerSelector(true);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Loading products from IndexedDB...');
        setIsLoading(true);
        setError(null);
        const { products: dbProducts, total } = await getProducts(currentPage, itemsPerPage, searchQuery);
        console.log('Loaded products:', dbProducts.length);
        setProducts(dbProducts);
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err.message : 'Ürünler yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity === 0) {
      updateQuantity(productId, 0);
    } else {
      const existingItem = cartItems.find(item => item.productId === productId);
      if (existingItem) {
        updateQuantity(productId, quantity);
      } else {
        addItem(productId, quantity);
      }
    }
  };

  return (
    <div className="p-6">
      {selectedCustomer && (
        <div className="mb-6">
          <CustomerInfo
            customer={selectedCustomer}
            onEdit={() => setShowCustomerSelector(true)}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Barkod Okuyucu"
          >
            <Barcode className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
              viewMode === 'grid' && 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
              viewMode === 'list' && 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list-no-image')}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
              viewMode === 'list-no-image' && 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <Table className="w-5 h-5" />
          </button>
        </div>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="w-16 h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        {selectedCustomer && (
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        )}
      </div>

      {selectedCustomer && (
        <div>
          <div className={cn(
            'space-y-4',
            viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 space-y-0'
          )}>
            {products.map((product) => {
              const cartItem = cartItems.find(item => item.productId === product.sto_kod);
              const quantity = cartItem?.quantity || 0;

              return (
                <ProductCard
                  key={product.sto_kod}
                  product={product}
                  quantity={quantity}
                  onQuantityChange={(qty) => handleQuantityChange(product.sto_kod, qty)}
                  viewMode={viewMode}
                />
              );
            })}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {showCustomerSelector && (
        <CustomerSelector
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerSelector(false);
          }}
          onClose={() => {
            if (selectedCustomer) {
              setShowCustomerSelector(false);
            }
          }}
        />
      )}

      {showCart && (
        <FloatingCart onClose={() => setShowCart(false)} />
      )}
    </div>
  );
}
