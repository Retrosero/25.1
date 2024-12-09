import { getLastSyncTime, updateLastSyncTime, addCustomers, getCustomersUpdatedAfter } from '../db';

const API_URL = 'http://localhost:3000/api';
export async function syncBarkodlar() {
  try {
    const lastSync = await getLastSyncTime('BARKOD_TANIMLARI');
    
    // Son senkronizasyondan sonra güncellenen barkodları al
    const response = await fetch(`${API_URL}/barkod/sync?after=${lastSync || ''}`);
    if (!response.ok) throw new Error('Barkodlar alınamadı');
    
    const updatedBarkodlar = await response.json();
    
    if (updatedBarkodlar.length > 0) {
      await addBarkodlar(updatedBarkodlar);
    }
    
    await updateLastSyncTime('BARKOD_TANIMLARI');
    
    return {
      success: true,
      syncedRecords: updatedBarkodlar.length
    };
  } catch (error) {
    console.error('Barkod senkronizasyonu başarısız:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
}

    };
  }
}

export async function syncCustomers() {
  try {
    const lastSync = await getLastSyncTime('CARI_HESAPLAR');
    
    // Get customers updated since last sync
    const response = await fetch(`${API_URL}/customers/sync?after=${lastSync || ''}`);
    if (!response.ok) throw new Error('Failed to fetch customers');
    
    const updatedCustomers = await response.json();
    
    if (updatedCustomers.length > 0) {
      await addCustomers(updatedCustomers);
    }
    
    // Get local changes
    const localChanges = await getCustomersUpdatedAfter(lastSync || '');
    
    if (localChanges.length > 0) {
      // Send local changes to server
      await fetch(`${API_URL}/customers/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localChanges)
      });
    }
    
    await updateLastSyncTime('CARI_HESAPLAR');
    
    return {
      success: true,
      syncedRecords: updatedCustomers.length + localChanges.length
    };
  } catch (error) {
    console.error('Sync failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
export async function startPeriodicSync(interval = 5 * 60 * 1000) { // Default 5 minutes
  setInterval(async () => {
    await syncBarkodlar();
  }, interval);
}