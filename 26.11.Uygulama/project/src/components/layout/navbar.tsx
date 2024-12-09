import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../hooks/use-notifications';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const navigate = useNavigate();
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();

  return (
    <header className={cn("h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", className)}>
      <div className="h-full px-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-primary-600 dark:text-primary-400 hover:opacity-80">
          Saha Satış Mikro API
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}