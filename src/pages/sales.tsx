import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Barcode, LayoutGrid, List, Table, Edit } from 'lucide-react';
import { cn } from '../lib/utils';
import { products } from '../data/products';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/use-settings';
import { useCart } from '../hooks/use-cart';
import { useCustomer } from '../hooks/use-customer';
import { FloatingCart } from '../components/sales/floating-cart';
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
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [showCart, setShowCart] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);

  // Show customer selector if no customer is selected
  useEffect(() => {
    if (!selectedCustomer) {
      setShowCustomerSelector(true);
    }
  }, [selectedCustomer]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity === 0) {
      updateQuantity(productId, 0);
    } else {
      addItem(productId, quantity);
    }
  };

  return (
    <div className="p-6">
      {/* Customer Info */}
      {selectedCustomer && (
        <div className="mb-6">
          <CustomerInfo
            customer={selectedCustomer}
            onEdit={() => setShowCustomerSelector(true)}
          />
        </div>
      )}

      {/* Product Search and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <button
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Barkod Okuyucu"
        >
          <Barcode className="w-5 h-5" />
        </button>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="h-10 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <option value={25}>25 Ürün</option>
          <option value={50}>50 Ürün</option>
          <option value={100}>100 Ürün</option>
        </select>
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

      {/* Products Grid/List */}
      {selectedCustomer && (
        <div className={cn(
          'space-y-4',
          viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 space-y-0'
        )}>
          {filteredProducts.map((product) => {
            const cartItem = cartItems.find(item => item.productId === product.id);
            const quantity = cartItem?.quantity || 0;

            return (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantity}
                onQuantityChange={(qty) => handleQuantityChange(product.id, qty)}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      )}

      {/* Customer Selector Popup */}
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

      {/* Cart Popup */}
      {showCart && (
        <FloatingCart onClose={() => setShowCart(false)} />
      )}
    </div>
  );
}