import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package,
  CreditCard,
  FileText,
  AlertCircle,
  Settings,
  RefreshCcw,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApprovals } from '../../hooks/use-approvals';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Müşteriler', path: '/customers' },
  { icon: ShoppingCart, label: 'Satışlar', path: '/sales' },
  { icon: Package, label: 'Ürünler', path: '/products' },
  { icon: CreditCard, label: 'Ödemeler', path: '/payments' },
  { icon: RefreshCcw, label: 'İadeler', path: '/returns' },
  { icon: FileText, label: 'Gün Sonu', path: '/daily-report' },
  { icon: AlertCircle, label: 'Onaylar', path: '/approvals' },
  { icon: ClipboardList, label: 'Sayım', path: '/inventory/count' },
  { icon: Settings, label: 'Ayarlar', path: '/settings' },
];

export function BottomNav() {
  const location = useLocation();
  const { approvals } = useApprovals();
  const [currentPage, setCurrentPage] = useState(0);
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  const itemsPerPage = 5;
  const totalPages = Math.ceil(menuItems.length / itemsPerPage);
  const displayedItems = menuItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          className={cn(
            "p-2",
            currentPage === 0 ? "invisible" : "visible"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex justify-around">
          {displayedItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showBadge = item.path === '/approvals' && pendingApprovalsCount > 0;

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
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          className={cn(
            "p-2",
            currentPage === totalPages - 1 ? "invisible" : "visible"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}