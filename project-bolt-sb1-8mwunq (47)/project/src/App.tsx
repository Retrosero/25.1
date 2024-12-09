import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './providers/theme-provider';
import { useEffect, useCallback } from 'react';
import { syncProducts, syncCustomers, syncSalesProducts } from './lib/db/sync';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  const handleSync = useCallback(async () => {
    try {
      await syncProducts();
      await syncSalesProducts();
      await syncCustomers();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, []);

  useEffect(() => {
    // Initial sync when app loads
    handleSync();

    // Set up periodic sync every 5 minutes
    const syncInterval = setInterval(() => {
      handleSync();
    }, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, [handleSync]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light">
          <AppRoutes />
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;