import { getLastSyncTime as getCustomerLastSync, updateLastSyncTime as updateCustomerLastSync, addCustomers, initCustomerDB } from './customer';
import { initSalesDB, addProducts as addSalesProducts, getLastSyncTime as getSalesLastSync, updateLastSyncTime as updateSalesLastSync } from './sales';
import { fetchProducts, fetchCustomers } from '../api';
import { fetchCustomers } from '../api';

const API_URL = 'http://localhost:3000/api';

export async function syncSalesProducts() {
  try {
    console.log('Starting sales products sync...');
    await initSalesDB();
    
    const lastSync = await getSalesLastSync('PRODUCTS');
    console.log('Last sync:', lastSync);
    
    const apiProducts = await fetchProducts(undefined);
    console.log('Fetched products:', apiProducts.length);
    
    if (apiProducts.length > 0) {
      await addSalesProducts(apiProducts);
      await updateSalesLastSync('PRODUCTS');
      console.log('Sales products sync completed');
      return apiProducts.length;
    }
    
    return 0;
  } catch (error) {
    console.error('Sales products sync failed:', error);
    throw error;
  }
}
export async function syncProducts() {
  // Ürün senkronizasyon işlemleri
  console.log('Syncing products...');
  // Ürün senkronizasyon mantığını buraya ekleyin
}

export async function syncCustomers() {
  try {
    // Initialize customer database
    await initCustomerDB();
    
    const lastSync = await getCustomerLastSync('CARI_HESAPLAR');
    
    // Get customers updated since last sync
    const apiCustomers = await fetchCustomers();
    
    if (apiCustomers.length > 0) {
      console.log('Syncing customers:', apiCustomers.length);
      await addCustomers(apiCustomers);
      await updateCustomerLastSync('CARI_HESAPLAR');
      return apiCustomers.length;
    }
    
    return 0;
  } catch (error) {
    console.error('Customer sync failed:', error);
    return 0;
  }
}