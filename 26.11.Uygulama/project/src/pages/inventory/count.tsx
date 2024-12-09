import { useState, useEffect } from 'react';
import { Search, FileCheck, ClipboardList, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { ProductSearch } from '../../components/inventory/product-search';
import { CountedProductsList } from '../../components/inventory/counted-products-list';
import { CountedProductsPopup } from '../../components/inventory/counted-products-popup';
import { UncountedProductsPopup } from '../../components/inventory/uncounted-products-popup';
import { DifferentLocationsPopup } from '../../components/inventory/different-locations-popup';
import { MergeConfirmationPopup } from '../../components/inventory/merge-confirmation-popup';
import { products } from '../../data/products';

export function InventoryCountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listId = searchParams.get('listId');
  const { user } = useAuth();
  const { addCount, getActiveCount, completeCount, getList } = useInventoryCount();
  
  const [showCountedProducts, setShowCountedProducts] = useState(false);
  const [showUncountedProducts, setShowUncountedProducts] = useState(false);
  const [showDifferentLocations, setShowDifferentLocations] = useState(false);
  const [mergeProduct, setMergeProduct] = useState<any>(null);
  const [note, setNote] = useState('');

  const activeCount = getActiveCount(listId);
  const list = listId ? getList(listId) : null;
  const countedProducts = activeCount?.items || [];

  // Get available products based on list
  const availableProducts = list?.productIds?.length 
    ? products.filter(p => list.productIds.includes(p.id))
    : products;

  // Calculate counts for indicators
  const countedProductIds = new Set(countedProducts.map(p => p.id));
  const totalProducts = list?.productIds?.length || products.length;
  const countedCount = countedProductIds.size;
  const uncountedCount = totalProducts - countedCount;
  const differentLocationsCount = countedProducts.length - countedProductIds.size;

  const handleComplete = () => {
    if (!activeCount) return;
    
    if (activeCount.items.length === 0) {
      alert('Lütfen en az bir ürün sayın');
      return;
    }

    const confirmed = window.confirm('Sayımı tamamlamak istediğinize emin misiniz?');
    if (!confirmed) return;

    completeCount(activeCount.id, user?.name || 'Unknown User', note);
    navigate('/inventory/completed');
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div 
          onClick={() => setShowCountedProducts(true)}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sayılan Ürünler</p>
              <p className="text-2xl font-bold text-green-600">{countedCount}</p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div 
          onClick={() => setShowUncountedProducts(true)}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sayılmayan Ürünler</p>
              <p className="text-2xl font-bold text-yellow-600">{uncountedCount}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div 
          onClick={() => setShowDifferentLocations(true)}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Farklı Yerde Sayılanlar</p>
              <p className="text-2xl font-bold text-orange-600">{differentLocationsCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Sayım Yap</h2>
          </div>
          <ProductSearch
            countedProducts={countedProducts}
            availableProducts={availableProducts}
            onMergeConfirm={(countedProduct, existingCount) => setMergeProduct({ product: countedProduct, existingCount })}
            onCount={(product) => addCount(product, listId)}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Sayılan Ürünler</h2>
          </div>
          <CountedProductsList />
        </div>

        {activeCount && activeCount.items.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Sayım Notu</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Sayım ile ilgili notlarınızı buraya ekleyebilirsiniz..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 h-24 resize-none"
                />
              </div>
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FileCheck className="w-5 h-5" />
                <span>Sayımı Tamamla</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showCountedProducts && (
        <CountedProductsPopup onClose={() => setShowCountedProducts(false)} />
      )}

      {showUncountedProducts && (
        <UncountedProductsPopup onClose={() => setShowUncountedProducts(false)} />
      )}

      {showDifferentLocations && (
        <DifferentLocationsPopup onClose={() => setShowDifferentLocations(false)} />
      )}

      {mergeProduct && (
        <MergeConfirmationPopup
          product={mergeProduct.product}
          existingCount={mergeProduct.existingCount}
          onConfirm={() => {
            addCount(mergeProduct.product, listId);
            setMergeProduct(null);
          }}
          onCancel={() => setMergeProduct(null)}
        />
      )}
    </div>
  );
}