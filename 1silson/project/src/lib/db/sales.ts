import { openDB, DBSchema } from 'idb';

interface SalesDB extends DBSchema {
  products: {
    key: string;
    value: {
      sto_kod: string;
      sto_isim: string;
      sto_kisa_ismi: string;
      sto_yer_kod: string;
      sto_sektor_kodu: string;
      sto_ambalaj_kodu: string;
      sto_marka_kodu: string;
      sto_create_date: string;
      sto_lastup_date: string;
      bar_kodu?: string;
      sth_eldeki_miktar?: number;
      sfiyat_fiyati?: number;
      images?: Array<{
        id: string;
        url: string;
        order: number;
      }>;
      lastSync?: string;
    };
    indexes: { 'by-name': string; 'by-code': string; 'by-sync': string };
  };
  sync_status: {
    key: string;
    value: {
      table_name: string;
      last_sync: string;
    };
  };
}

const DB_NAME = 'sales-db';
const DB_VERSION = 1;

export async function initSalesDB() {
  return openDB<SalesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Ürünler store'u
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'sto_kod' });
        store.createIndex('by-name', 'sto_isim');
        store.createIndex('by-code', 'sto_kod');
        store.createIndex('by-sync', 'lastSync');
      }

      // Senkronizasyon durumu store'u
      if (!db.objectStoreNames.contains('sync_status')) {
        db.createObjectStore('sync_status', { keyPath: 'table_name' });
      }
    }
  });
}

export async function getLastSyncTime(tableName: string) {
  const db = await initSalesDB();
  const syncStatus = await db.get('sync_status', tableName);
  return syncStatus?.last_sync;
}

export async function updateLastSyncTime(tableName: string) {
  const db = await initSalesDB();
  await db.put('sync_status', {
    table_name: tableName,
    last_sync: new Date().toISOString()
  });
}

export async function addProducts(products: any[]) {
  const db = await initSalesDB();
  const tx = db.transaction('products', 'readwrite');
  
  // Her ürün için images alanını kontrol et ve ekle
  const productsWithImages = products.map(product => ({
    ...product,
    images: product.images || [],
    lastSync: new Date().toISOString(),
  }));

  await Promise.all(productsWithImages.map(product => tx.store.put(product)));
  await tx.done;
  console.log('Sales products added:', productsWithImages.length);
}

export async function getProducts(page: number, limit: number, search?: string) {
  const db = await initSalesDB();
  const store = db.transaction('products', 'readonly').store;
  let allProducts = [];
  
  // Get total count first
  const total = await store.count();
  
  // Calculate pagination
  const start = (page - 1) * limit;
  let count = 0;
  let cursor = await store.openCursor();

  // Skip to start position
  while (cursor && count < start) {
    cursor = await cursor.continue();
    count++;
  }

  // Get products for current page
  while (cursor && allProducts.length < limit) {
    const product = cursor.value;
    
    if (!search || 
        product.sto_isim.toLowerCase().includes(search.toLowerCase()) ||
        product.sto_kod.toLowerCase().includes(search.toLowerCase()) ||
        (product.bar_kodu && product.bar_kodu.includes(search))) {
      allProducts.push(product);
    }
    
    cursor = await cursor.continue();
  }

  return {
    products: allProducts,
    total
  };
}

export async function getProductById(id: string) {
  const db = await initSalesDB();
  return db.get('products', id);
}

export async function getProductsUpdatedAfter(date: string) {
  const db = await initSalesDB();
  const index = db.transaction('products').store.index('by-sync');
  return index.getAll(IDBKeyRange.lowerBound(date));
}

export async function updateProduct(id: string, updates: Partial<SalesDB['products']['value']>) {
  const db = await initSalesDB();
  const product = await db.get('products', id);
  if (!product) return;

  await db.put('products', {
    ...product,
    ...updates,
    lastSync: new Date().toISOString()
  });
}