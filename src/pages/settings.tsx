import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Calendar,
  Package,
  Wallet,
  RefreshCcw,
  FileText,
  AlertCircle,
  Settings,
  LayoutGrid,
  List,
  Table,
  Edit2,
  User,
  Mail,
  FileSpreadsheet,
  Sun,
  Moon,
  Sidebar,
  Menu,
  GripVertical,
  GripHorizontal,
  ListTodo,
  MapPin,
  PackageCheck,
  UserCog,
  Truck,
  ClipboardList
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../hooks/use-settings';
import { useAuth } from '../hooks/use-auth';
import { useTheme } from '../providers/theme-provider';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { 
    navigationType, 
    setNavigationType,
    defaultViewMode,
    setDefaultViewMode,
    defaultItemsPerPage,
    setDefaultItemsPerPage,
    defaultSortOption,
    setDefaultSortOption,
    dashboardLayout,
    setDashboardLayout,
    dashboardOrder,
    setDashboardOrder,
    dashboardCards,
    setDashboardCards,
    dashboardMetrics,
    setDashboardMetrics,
    approvalSettings,
    setApprovalSettings,
    inventoryViewMode,
    setInventoryViewMode,
    productCardFields,
    updateProductCardField,
    reorderProductCardFields,
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState('appearance');

  const handleProductFieldsDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(productCardFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    reorderProductCardFields(reorderedItems);
  };

  const handleDashboardCardsDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = [...dashboardOrder];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardOrder(items);
  };

  // Initialize dashboard order if empty
  useEffect(() => {
    if (dashboardOrder.length === 0) {
      setDashboardOrder(menuCards.map(card => card.id));
    }
  }, [dashboardOrder.length, setDashboardOrder]);

  const menuCards = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'sales', label: 'Satış', icon: ShoppingCart },
    { id: 'calendar', label: 'Takvim', icon: Calendar },
    { id: 'todos', label: 'Görevler', icon: ListTodo },
    { id: 'products', label: 'Ürünler', icon: Package },
    { id: 'payments', label: 'Tahsilat', icon: Wallet },
    { id: 'returns', label: 'İadeler', icon: RefreshCcw },
    { id: 'daily-report', label: 'Gün Sonu', icon: FileText },
    { id: 'approvals', label: 'Onay Bekleyenler', icon: AlertCircle },
    { id: 'orders', label: 'Siparişler', icon: PackageCheck },
    { id: 'delivery', label: 'Teslimat', icon: MapPin },
    { id: 'inventory', label: 'Sayım', icon: ClipboardList },
    { id: 'users', label: 'Kullanıcı Yönetimi', icon: UserCog },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
    { id: 'cargo', label: 'Kargo Teslim', icon: Truck }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'appearance'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Görünüm
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'sales'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Satış Sayfası
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'dashboard'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'approvals'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Onay Ayarları
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'inventory'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Sayım
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Görünüm</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Tema
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span>Açık</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span>Koyu</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Navigasyon Tipi
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setNavigationType('sidebar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      navigationType === 'sidebar'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sidebar className="w-5 h-5" />
                    <span>Kenar Çubuğu</span>
                  </button>
                  <button
                    onClick={() => setNavigationType('bottom')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      navigationType === 'bottom'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Menu className="w-5 h-5" />
                    <span>Alt Menü</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Satış Sayfası Ayarları</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Varsayılan Görünüm
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDefaultViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      defaultViewMode === 'grid'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span>Izgara</span>
                  </button>
                  <button
                    onClick={() => setDefaultViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      defaultViewMode === 'list'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
                    <span>Liste</span>
                  </button>
                  <button
                    onClick={() => setDefaultViewMode('list-no-image')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      defaultViewMode === 'list-no-image'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Table className="w-5 h-5" />
                    <span>Tablo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Ürün Kartı Alanları
                </label>
                <DragDropContext onDragEnd={handleProductFieldsDragEnd}>
                  <Droppable droppableId="product-card-fields">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {productCardFields.map((field, index) => (
                          <Draggable
                            key={field.id}
                            draggableId={field.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>
                                <label className="flex items-center flex-1">
                                  <input
                                    type="checkbox"
                                    checked={field.enabled}
                                    onChange={(e) => updateProductCardField(field.id, { enabled: e.target.checked })}
                                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                  />
                                  <span className="ml-2">{field.label}</span>
                                </label>
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

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Sayfa Başına Ürün Sayısı
                </label>
                <select
                  value={defaultItemsPerPage}
                  onChange={(e) => setDefaultItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <option value={25}>25</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Varsayılan Sıralama
                </label>
                <select
                  value={defaultSortOption}
                  onChange={(e) => setDefaultSortOption(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <option value="name-asc">İsim (A-Z)</option>
                  <option value="name-desc">İsim (Z-A)</option>
                  <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                  <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                  <option value="stock-asc">Stok (Az-Çok)</option>
                  <option value="stock-desc">Stok (Çok-Az)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Dashboard Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Görünüm Tipi
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDashboardLayout('metrics')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      dashboardLayout === 'metrics'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Metrikler</span>
                  </button>
                  <button
                    onClick={() => setDashboardLayout('cards')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      dashboardLayout === 'cards'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span>Kartlar</span>
                  </button>
                </div>
              </div>

              {dashboardLayout === 'cards' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Kartlar ve Sıralama
                  </label>
                  <DragDropContext onDragEnd={handleDashboardCardsDragEnd}>
                    <Droppable droppableId="dashboard-cards">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {dashboardOrder.map((cardId, index) => {
                            const card = menuCards.find(c => c.id === cardId);
                            if (!card) return null;
                            const Icon = card.icon;

                            return (
                              <Draggable
                                key={cardId}
                                draggableId={cardId}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                  >
                                    <div {...provided.dragHandleProps} className="cursor-move">
                                      <GripHorizontal className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <label className="flex items-center flex-1 gap-3">
                                      <input
                                        type="checkbox"
                                        checked={dashboardCards[cardId] !== false}
                                        onChange={(e) => setDashboardCards({ [cardId]: e.target.checked })}
                                        className="rounded border-gray-300"
                                      />
                                      <Icon className="w-5 h-5 text-gray-500" />
                                      <span>{card.label}</span>
                                    </label>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}


              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Görünür Metrikler
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dashboardMetrics['total-sales'] ?? true}
                      onChange={(e) => setDashboardMetrics({ 'total-sales': e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">Toplam Satış</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dashboardMetrics['daily-sales'] ?? true}
                      onChange={(e) => setDashboardMetrics({ 'daily-sales': e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">Günlük Satış</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dashboardMetrics['total-customers'] ?? true}
                      onChange={(e) => setDashboardMetrics({ 'total-customers': e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">Toplam Müşteri</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dashboardMetrics['total-products'] ?? true}
                      onChange={(e) => setDashboardMetrics({ 'total-products': e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">Toplam Ürün</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dashboardMetrics['pending-approvals'] ?? true}
                      onChange={(e) => setDashboardMetrics({ 'pending-approvals': e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">Bekleyen Onaylar</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dashboardMetrics['low-stock'] ?? true}
                      onChange={(e) => setDashboardMetrics({ 'low-stock': e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">Düşük Stok</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Onay Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  İşlem Onayları
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sales-approval"
                      checked={approvalSettings.sales}
                      onChange={(e) => setApprovalSettings({ sales: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="sales-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Satışlar onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="payments-approval"
                      checked={approvalSettings.payments}
                      onChange={(e) => setApprovalSettings({ payments: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="payments-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Tahsilatlar onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="expenses-approval"
                      checked={approvalSettings.expenses}
                      onChange={(e) => setApprovalSettings({ expenses: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="expenses-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Tediyeler onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="returns-approval"
                      checked={approvalSettings.returns}
                      onChange={(e) => setApprovalSettings({ returns: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="returns-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      İadeler onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="products-approval"
                      checked={approvalSettings.products}
                      onChange={(e) => setApprovalSettings({ products: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="products-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Ürün değişiklikleri onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inventory-approval"
                      checked={approvalSettings.inventory}
                      onChange={(e) => setApprovalSettings({ inventory: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="inventory-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Sayım sonuçları onaya gönderilsin
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Sayım Ayarları</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Varsayılan Görünüm
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setInventoryViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      inventoryViewMode === 'grid'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span>Resimli</span>
                  </button>
                  <button
                    onClick={() => setInventoryViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      inventoryViewMode === 'list'
                        ? 'border-primary-600 text-primary- 600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
                    <span>Liste</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}