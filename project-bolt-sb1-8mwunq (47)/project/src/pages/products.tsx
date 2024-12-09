import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Edit, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination } from '../components/ui/pagination';
import { getProducts, addProducts, getLastSyncTime, updateLastSyncTime } from '../lib/db/product';
import { fetchProducts } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { ProductEditPopup } from '../components/products/product-edit-popup';
import { ImageManager } from '../components/products/image-manager';
import { ImageCarousel } from '../components/products/image-carousel';

type TabType = 'general' | 'prices' | 'details' | 'description' | 'images';
type ViewMode = 'grid' | 'list';

export function ProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [productStates, setProductStates] = useState<Record<string, { activeTab: TabType }>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef(true);
  const isUpdating = useRef(false);

  useEffect(() => {
    if (isInitialLoad.current) {
      loadInitialProducts();
      isInitialLoad.current = false;
    } else {
      loadProducts();
    }
  }, [currentPage, itemsPerPage]);

  // İlk yükleme için hızlı veri çekme
  const loadInitialProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Önce IndexedDB'den hızlıca veri çek
      const { products: dbProducts, total } = await getProducts(currentPage, itemsPerPage, searchQuery);
      setTotalPages(Math.ceil(total / itemsPerPage));
      setProducts(dbProducts);
      setIsLoading(false);

      // Arka planda güncelleme kontrolü yap
      checkForUpdates();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
      setIsLoading(false);
    }
  };

  // Arka planda güncelleme kontrolü
  const checkForUpdates = async () => {
    if (isUpdating.current) return;
    
    try {
      isUpdating.current = true;
      const lastSync = await getLastSyncTime('STOKLAR');
      const now = new Date().toISOString();
      
      // 5 dakikadan eski ise veya hiç senkronize edilmemişse
      if (!lastSync || new Date(now).getTime() - new Date(lastSync).getTime() > 5 * 60 * 1000) {
        // API'den yeni verileri al
        const apiProducts = await fetchProducts(searchQuery);
        
        // IndexedDB'yi güncelle
        await addProducts(apiProducts);
        await updateLastSyncTime('STOKLAR');
        
        // Güncel verileri göster
        const { products: updatedProducts, total: updatedTotal } = await getProducts(currentPage, itemsPerPage, searchQuery);
        setProducts(updatedProducts);
        setTotalPages(Math.ceil(updatedTotal / itemsPerPage));
      }
    } catch (err) {
      console.error('Güncelleme kontrolü sırasında hata:', err);
    } finally {
      isUpdating.current = false;
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { products: dbProducts, total } = await getProducts(currentPage, itemsPerPage, searchQuery);
      setTotalPages(Math.ceil(total / itemsPerPage));
      setProducts(dbProducts);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    // Arama kutusuna otomatik odaklan
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Arama yapıldığında
  useEffect(() => {
    if (searchQuery.length === 0 || searchQuery.length >= 3) {
      loadProducts();
      setCurrentPage(1);
    }
  }, [searchQuery, loadProducts]);

  // Sayfa değiştiğinde
  useEffect(() => {
    if (searchQuery.length === 0 || searchQuery.length >= 3) {
      loadProducts();
    }
  }, [currentPage, itemsPerPage]);

  // Arama kutusuna her tıklandığında
const handleSearchFocus = () => {
  if (searchInputRef.current) {
    searchInputRef.current.select();
  }
};

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.sto_isim.localeCompare(b.sto_isim);
      case 'name-desc':
        return b.sto_isim.localeCompare(a.sto_isim);
      case 'price-asc':
        return (a.sfiyat_fiyati || 0) - (b.sfiyat_fiyati || 0);
      case 'price-desc':
        return (b.sfiyat_fiyati || 0) - (a.sfiyat_fiyati || 0);
      case 'stock-asc':
        return (a.sth_eldeki_miktar || 0) - (b.sth_eldeki_miktar || 0);
      case 'stock-desc':
        return (b.sth_eldeki_miktar || 0) - (a.sth_eldeki_miktar || 0);
      default:
        return 0;
    }
  });



  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption, itemsPerPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

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
            ref={searchInputRef}
            type="text"
            placeholder="Ürün ara..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              <p className="text-sm text-gray-500">Aramak için en az 3 karakter girin</p>
            </div>
          )}
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
            className="h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <option value={25}>25 Ürün</option>
            <option value={50}>50 Ürün</option>
            <option value={100}>100 Ürün</option>
          </select>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="mb-4 text-sm text-gray-500">
        Toplam {totalProducts} üründen {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalProducts)} arası gösteriliyor
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
                      <div>{product.sto_isim}</div>
                      <div className="text-gray-500">Ürün Kodu:</div>
                      <div>{product.sto_kod}</div>
                      <div className="text-gray-500">Marka:</div>
                      <div>{product.sto_marka_kodu || '-'}</div>
                      <div className="text-gray-500">Kategori:</div>
                      <div>{product.category || '-'}</div>
                      <div className="text-gray-500">Barkod:</div>
                      <div>{product.bar_kodu || '-'}</div>
                      <div className="text-gray-500">Raf:</div>
                      <div>{product.sto_yer_kod || '-'}</div>
                      <div className="text-gray-500">Ambalaj:</div>
                      <div>{product.sto_ambalaj_kodu || '-'}</div>
                      <div className="text-gray-500">Stok:</div>
                      <div>{product.sth_eldeki_miktar || 0}</div>
                      <div className="text-gray-500">Fiyat:</div>
                      <div>{formatCurrency(product.sfiyat_fiyati || 0)}</div>
                    </div>
                  </div>
                )}

                {activeTab === 'prices' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">1. Fiyat</label>
                      <div className="text-lg font-bold">{formatCurrency(product.sfiyat_fiyati || 0)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">2. Fiyat</label>
                      <div className="text-lg font-bold">{formatCurrency(product.sfiyat_fiyati * 1.1 || 0)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">3. Fiyat</label>
                      <div className="text-lg font-bold">{formatCurrency(product.sfiyat_fiyati * 1.2 || 0)}</div>
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
                      <div>-</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Son Giriş Tarihi</label>
                      <div>-</div>
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
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {editingProduct && (
        <ProductEditPopup
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}