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
            <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
            {/* Sidebar Toggle Button - Always Visible */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "fixed top-20 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700",
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
            'transition-all duration-300',
            navigationType === 'bottom' ? 'pb-20' : '',
            navigationType === 'sidebar' && isSidebarOpen ? 'ml-64' : ''
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