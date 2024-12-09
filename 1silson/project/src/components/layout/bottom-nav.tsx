import { Link, useLocation } from 'react-router-dom';
import { useTodos } from '../../hooks/use-todos';
import { useAuth } from '../../hooks/use-auth';
import { useApprovals } from '../../hooks/use-approvals';
import { useSettings } from '../../hooks/use-settings';

import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  ListTodo,
  ShoppingCart, 
  Package,
  Wallet,
  FileText,
  AlertCircle,
  Settings,
  RefreshCcw,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PackageCheck,
  UserCog,
  Truck
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  count?: number;
  subItems?: Array<{
    label: string;
    path: string;
  }>;
}

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { getTodosByUser } = useTodos();
  const { approvals } = useApprovals();
  const { dashboardOrder } = useSettings();
  
  const assignedTodosCount = user ? getTodosByUser(user.id).filter(todo => todo.status !== 'completed').length : 0;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

const menuItems: MenuItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { id: 'customers', icon: Users, label: 'Müşteriler', path: '/customers' },
  { id: 'sales', icon: ShoppingCart, label: 'Satış', path: '/sales' },
  { id: 'calendar', icon: Calendar, label: 'Takvim', path: '/calendar' },
  { id: 'todos', icon: ListTodo, label: 'Görevler', path: '/todos', count: assignedTodosCount },
  { id: 'products', icon: Package, label: 'Ürünler', path: '/products' },
  { id: 'payments', icon: Wallet, label: 'Tahsilat', path: '/payments' },
  { id: 'returns', icon: RefreshCcw, label: 'İadeler', path: '/returns' },
  { id: 'daily-report', icon: FileText, label: 'Gün Sonu', path: '/daily-report' },
  { id: 'approvals', icon: AlertCircle, label: 'Onaylar', path: '/approvals', count: pendingApprovalsCount },
  { 
    icon: PackageCheck, 
    label: 'Siparişler', 
    path: '/orders',
    subItems: [
      { label: 'Hazırlanacak', path: '/orders?status=preparing' },
      { label: 'Kontrol Edilecek', path: '/orders?status=checking' },
      { label: 'Yüklenecek', path: '/orders?status=loading' },
      { label: 'Teslim Edilecek', path: '/orders?status=ready' },
      { label: 'Teslim Edilenler', path: '/orders?status=delivered' }
    ]
  },
  {
    icon: MapPin,
    label: 'Teslimat',
    path: '/delivery',
    subItems: [
      { label: 'Teslimat Sırası', path: '/orders/route' },
      { label: 'Teslimat', path: '/orders/delivery' },
      { label: 'Tamamlanan Teslimatlar', path: '/orders/completed-deliveries' }
    ]
  },
  { 
    icon: ClipboardList, 
    label: 'Sayım', 
    path: '/inventory',
    subItems: [
      { label: 'Sayım Yap', path: '/inventory/count' },
      { label: 'Sayım Listeleri', path: '/inventory/lists' },
      { label: 'Tamamlananlar', path: '/inventory/completed' }
    ]
  },
  { id: 'users', icon: UserCog, label: 'Kullanıcı Yönetimi', path: '/users' },
  { id: 'settings', icon: Settings, label: 'Ayarlar', path: '/settings' },
  { id: 'cargo', icon: Truck, label: 'Kargo Teslim', path: '/cargo-delivery' }
];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center px-2 py-1 min-w-max gap-1">
          {[...menuItems].sort((a, b) => {
            const aIndex = dashboardOrder.indexOf(a.id);
            const bIndex = dashboardOrder.indexOf(b.id);
            return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
          }).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showBadge = item.path === '/approvals' && pendingApprovalsCount > 0;
            const showTodoBadge = item.path === '/todos' && assignedTodosCount > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center py-2 px-1 relative',
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1 truncate w-full text-center">{item.label}</span>
                {showBadge && (
                  <span className="absolute -top-1 right-1/4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingApprovalsCount}
                  </span>
                )}
                {showTodoBadge && (
                  <span className="absolute -top-1 right-1/4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {assignedTodosCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}