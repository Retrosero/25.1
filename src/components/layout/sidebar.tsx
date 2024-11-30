import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ListTodo,
  Calendar,
  ShoppingCart, 
  Package,
  Wallet,
  RefreshCcw,
  FileText,
  AlertCircle,
  Settings,
  PackageCheck,
  MapPin,
  ClipboardList,
  Menu,
  ChevronDown,
  ChevronUp,
  User,
  LogOut,
  UserCircle,
  UserCog,
  Truck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApprovals } from '../../hooks/use-approvals';
import { useOrders } from '../../hooks/use-orders';
import { useInventoryCount } from '../../hooks/use-inventory-count';
import { useAuth } from '../../hooks/use-auth';
import { useUsers } from '../../hooks/use-users';

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  path: string;
  count?: number;
  permission?: string;
  subItems?: Array<{
    label: string;
    path: string;
    count?: number;
    permission?: string;
  }>;
}

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ isOpen, onOpenChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { approvals } = useApprovals();
  const { getStatusCounts } = useOrders();
  const { getCounts } = useInventoryCount();
  const { user, logout } = useAuth();
  const { hasPermission } = useUsers();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const orderCounts = getStatusCounts();
  const pendingListsCount = getCounts().filter(list => list.status === 'in-progress').length;
  
  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: 'dashboard.view' },
    { id: 'customers', icon: Users, label: 'Müşteriler', path: '/customers', permission: 'customers.view' },
    { id: 'sales', icon: ShoppingCart, label: 'Satış', path: '/sales', permission: 'sales.create' },
    { id: 'calendar', icon: Calendar, label: 'Takvim', path: '/calendar', permission: 'calendar.view' },
    { id: 'todos', icon: ListTodo, label: 'Görevler', path: '/todos', permission: 'todos.view' },
    { id: 'products', icon: Package, label: 'Ürünler', path: '/products', permission: 'products.view' },
    { id: 'payments', icon: Wallet, label: 'Tahsilat', path: '/payments', permission: 'payments.create' },
    { id: 'returns', icon: RefreshCcw, label: 'İadeler', path: '/returns', permission: 'returns.create' },
    { id: 'daily-report', icon: FileText, label: 'Gün Sonu', path: '/daily-report', permission: 'reports.view' },
    { 
      id: 'approvals', 
      icon: AlertCircle, 
      label: 'Onay Bekleyenler', 
      path: '/approvals',
      permission: 'approvals.view',
      count: pendingApprovalsCount 
    },
    { 
      id: 'orders', 
      icon: PackageCheck, 
      label: 'Siparişler', 
      path: '/orders',
      permission: 'orders.view',
      count: orderCounts.preparing + orderCounts.checking + orderCounts.loading + orderCounts.ready,
      subItems: [
        { label: 'Hazırlanacak', path: '/orders?status=preparing', count: orderCounts.preparing },
        { label: 'Kontrol Edilecek', path: '/orders?status=checking', count: orderCounts.checking },
        { label: 'Yüklenecek', path: '/orders?status=loading', count: orderCounts.loading },
        { label: 'Teslim Edilecek', path: '/orders?status=ready', count: orderCounts.ready },
        { label: 'Teslim Edilenler', path: '/orders?status=delivered' }
      ]
    },
    {
      id: 'delivery',
      icon: MapPin,
      label: 'Teslimat',
      path: '/delivery',
      permission: 'orders.deliver',
      subItems: [
        { label: 'Teslimat Sırası', path: '/orders/route' },
        { label: 'Teslimat', path: '/orders/delivery' },
        { label: 'Tamamlanan Teslimatlar', path: '/orders/completed-deliveries' }
      ]
    },
    { 
      id: 'inventory', 
      icon: ClipboardList, 
      label: 'Sayım', 
      path: '/inventory',
      permission: 'inventory.view',
      count: pendingListsCount,
      subItems: [
        { label: 'Sayım Yap', path: '/inventory/count' },
        { label: 'Sayım Listeleri', path: '/inventory/lists', count: pendingListsCount },
        { label: 'Tamamlananlar', path: '/inventory/completed' }
      ]
    },
    { id: 'users', icon: UserCog, label: 'Kullanıcı Yönetimi', path: '/users', permission: 'users.manage' },
    { id: 'settings', icon: Settings, label: 'Ayarlar', path: '/settings', permission: 'settings.view' },
    { id: 'cargo', icon: Truck, label: 'Kargo Teslim', path: '/cargo-delivery' }
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    // Check specific permission if defined
    if (item.permission) {
      return hasPermission(user.id, item.permission);
    }
    
    return true; // Show items without specific permissions
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Main Navigation - Scrollable Area */}
        <nav className="flex-1 overflow-y-auto h-[calc(100%-5rem)]">
          <ul className="space-y-1 p-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.subItems && item.subItems.some(sub => location.pathname + location.search === sub.path));
              const isExpanded = expandedItems.includes(item.id);

              return (
                <li key={item.id}>
                  {item.subItems ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                          isActive
                            ? "bg-primary-50 dark:bg-primary-900/50 text-primary-600"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                      >
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 mr-3" />
                          <span>{item.label}</span>
                          {item.count > 0 && (
                            <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {item.count}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.subItems.map((subItem, index) => (
                            <li key={index}>
                              <Link
                                to={subItem.path}
                                className={cn(
                                  "flex items-center px-3 py-2 rounded-lg",
                                  location.pathname + location.search === subItem.path
                                    ? "bg-primary-50 dark:bg-primary-900/50 text-primary-600"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                              >
                                <span>{subItem.label}</span>
                                {subItem.count > 0 && (
                                  <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {subItem.count}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-lg",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/50 text-primary-600"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.label}</span>
                      {item.count > 0 && (
                        <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section - Fixed at Bottom */}
        <div className="relative p-4 border-t border-gray-200 dark:border-gray-700" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
            <ChevronUp className={cn(
              "w-5 h-5 transition-transform",
              !showProfileMenu && "rotate-180"
            )} />
          </button>

          {/* Profile Menu - Positioned Above the Profile Section */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-5 h-5" />
                <span>Profil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-b-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}