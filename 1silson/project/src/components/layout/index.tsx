import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { BottomNav } from './bottom-nav';
import { useSettings } from '../../hooks/use-settings';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Layout() {
  const { navigationType } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar className="fixed top-0 left-0 right-0 z-50" />
      <div className="pt-16 min-h-[calc(100vh-4rem)]">
        {navigationType === 'sidebar' && (
          <>
            <div className={cn( 
              "fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 pt-16",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "fixed top-4 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                isSidebarOpen ? "left-64" : "left-0"
              )}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </>
        )}
        <main 
          className={cn(
            'flex-1 transition-all duration-300',
            'pb-20',
            navigationType === 'sidebar' && isSidebarOpen && 'ml-64'
          )}
        >
          <div className="container mx-auto px-2 sm:px-4">
            <Outlet />
          </div>
        </main>
      </div>
      {navigationType === 'bottom' && <BottomNav />}
    </div>
  );
}