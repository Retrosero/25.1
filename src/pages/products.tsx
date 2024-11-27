import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Edit, LayoutGrid, List } from 'lucide-react';
import { useProducts } from '../hooks/use-products';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { ProductEditPopup } from '../components/products/product-edit-popup';
import { ImageManager } from '../components/products/image-manager';
import { ImageCarousel } from '../components/products/image-carousel';

type TabType = 'general' | 'prices' | 'details' | 'description' | 'images';
type ViewMode = 'grid' | 'list';

export function ProductsPage() {
  const navigate = useNavigate();
  const { products, updateProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productStates, setProductStates] = useState<Record<string, { activeTab: TabType }>>({});

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock-asc':
        return a.stock - b.stock;
      case 'stock-desc':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  const getProductState = (productId: string) => {
    if (!productStates[productId]) {
      setProductStates(prev => ({
        ...prev,
        [productId]: { activeTab: 'general' }
      }));
      return { activeTab: 'general' };
    }
    return productStates[productId];
  };

  const setProductTab = (productId: string, tab: TabType) => {
    setProductStates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], activeTab: tab }
    }));
  };

  const handleSaveDescription = (productId: string, description: string) => {
    updateProduct(productId, 'update', { description });
  };

  return (
    <div className="p-6">
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
        <div className="flex gap-2">
          <button
            onClick={() => {/* Handle filter */}}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => {/* Handle sort */}}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
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
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <option value={25}>25 Ürün</option>
            <option value={50}>50 Ürün</option>
            <option value={100}>100 Ürün</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {sortedProducts.map((product) => {
          const { activeTab } = getProductState(product.id);

          return (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-4">
                  <button
                    onClick={() => setProductTab(product.id, 'general')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium',
                      activeTab === 'general' && 'text-primary-600'
                    )}
                  >
                    Genel Bilgiler
                  </button>
                  <button
                    onClick={() => setProductTab(product.id, 'prices')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium',
                      activeTab === 'prices' && 'text-primary-600'
                    )}
                  >
                    Fiyatlar
                  </button>
                  <button
                    onClick={() => setProductTab(product.id, 'details')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium',
                      activeTab === 'details' && 'text-primary-600'
                    )}
                  >
                    Detaylar
                  </button>
                  <button
                    onClick={() => setProductTab(product.id, 'description')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium',
                      activeTab === 'description' && 'text-primary-600'
                    )}
                  >
                    Açıklama
                  </button>
                  <button
                    onClick={() => setProductTab(product.id, 'images')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium',
                      activeTab === 'images' && 'text-primary-600'
                    )}
                  >
                    Resimler
                  </button>
                </div>
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Düzenle"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                {activeTab === 'general' && (
                  <div>
                    <div className="mb-4">
                      {viewMode === 'grid' ? (
                        <ImageCarousel images={product.images} />
                      ) : null}
                    </div>
                    <div className="grid grid-cols-[120px,1fr] gap-y-2 text-sm">
                      <div className="text-gray-500">Ürün Adı:</div>
                      <div>{product.name}</div>
                      <div className="text-gray-500">Ürün Kodu:</div>
                      <div>{product.id}</div>
                      <div className="text-gray-500">Marka:</div>
                      <div>{product.brand || '-'}</div>
                      <div className="text-gray-500">Kategori:</div>
                      <div>{product.category || '-'}</div>
                      <div className="text-gray-500">Barkod:</div>
                      <div>{product.barcode || '-'}</div>
                      <div className="text-gray-500">Raf:</div>
                      <div>{product.shelf || '-'}</div>
                      <div className="text-gray-500">Ambalaj:</div>
                      <div>{product.packaging || '-'}</div>
                      <div className="text-gray-500">Stok:</div>
                      <div>{product.stock}</div>
                      <div className="text-gray-500">Fiyat:</div>
                      <div>{formatCurrency(product.price)}</div>
                    </div>
                  </div>
                )}

                {activeTab === 'prices' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">1. Fiyat</label>
                      <div className="text-lg font-bold">{formatCurrency(product.price)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">2. Fiyat</label>
                      <div className="text-lg font-bold">{formatCurrency(product.price * 1.1)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">3. Fiyat</label>
                      <div className="text-lg font-bold">{formatCurrency(product.price * 1.2)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">4. Fiyat</label>
                      <div className="text-lg font-bold">{formatCurrency(product.price * 1.3)}</div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Giriş Tarihi</label>
                      <div>12.03.2024</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Son Giriş Tarihi</label>
                      <div>15.03.2024</div>
                    </div>
                  </div>
                )}

                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <textarea
                      value={product.description || ''}
                      onChange={(e) => handleSaveDescription(product.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px]"
                      placeholder="Ürün açıklaması..."
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveDescription(product.id, product.description || '')}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="space-y-4">
                    <ImageManager
                      images={product.images}
                      onAddImage={(url) => {
                        const newImage = {
                          id: Date.now().toString(),
                          url,
                          order: product.images?.length || 0
                        };
                        updateProduct(product.id, 'addImage', { url: newImage.url });
                      }}
                      onAddFile={(file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const url = reader.result as string;
                          const newImage = {
                            id: Date.now().toString(),
                            url,
                            order: product.images?.length || 0
                          };
                          updateProduct(product.id, 'addImage', { url: newImage.url });
                        };
                        reader.readAsDataURL(file);
                      }}
                      onRemoveImage={(id) => {
                        updateProduct(product.id, 'removeImage', id);
                      }}
                      onReorderImages={(imageIds) => {
                        updateProduct(product.id, 'reorderImages', imageIds);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingProduct && (
        <ProductEditPopup
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}