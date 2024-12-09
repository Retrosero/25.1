import { openDB, DBSchema } from 'idb';
import { fetchProducts } from '../api';

export interface ProductDB extends DBSchema {
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
      images1?: string;
      images2?: string;
      images3?: string;
      images4?: string;
      images5?: string;
      images6?: string;
      images7?: string;
      images8?: string;
      images9?: string;
      images10?: string;
      bar_kodu?: string;
      sth_eldeki_miktar?: number;
      sfiyat_fiyati?: number;
      sfiyat_fiyati_2?: number;
      sfiyat_fiyati_3?: number;
    };
    indexes: { 'by-lastup': string };
  };
  sync_status: {
    key: string;
    value: {
      table_name: string;
      last_sync: string;
    };
  };
}

const DB_NAME = 'product-db';
const DB_VERSION = 4;

export async function initProductDB() {
  return openDB<ProductDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // Ürünler store'u
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'sto_kod' });
        store.createIndex('by-lastup', 'sto_lastup_date');
      }

      // Sync status store'unu ekle
      if (!db.objectStoreNames.contains('sync_status')) {
        db.createObjectStore('sync_status', { keyPath: 'table_name' });
      }
    },
  });
}

export async function getLastSyncTime(tableName: string) {
  const db = await initProductDB();
  const syncStatus = await db.get('sync_status', tableName);
  return syncStatus?.last_sync;
}

export async function updateLastSyncTime(tableName: string) {
  const db = await initProductDB();
  await db.put('sync_status', {
    table_name: tableName,
    last_sync: new Date().toISOString(),
  });
}

export async function addProducts(products: any[]) {
  const db = await initProductDB();
  const tx = db.transaction('products', 'readwrite');
  await Promise.all(
    products.map((product) => {
      for (let i = 1; i <= 10; i++) {
        product[`images${i}`] = product.images && product.images[i - 1] ? product.images[i - 1].url : '';
      }
      delete product.images; // Remove the images array if not needed
      return tx.store.put(product);
    })
  );
  await tx.done;
}

export async function getProducts(page: number, limit: number, search?: string) {
  try {
    const db = await initProductDB();
    const store = db.transaction('products', 'readonly').store;
    let allProducts = [];

    // Sayfalama için cursor kullan
    let cursor = await store.openCursor();
    let count = 0;
    const skip = (page - 1) * limit;

    while (cursor && allProducts.length < limit) {
      if (
        !search ||
        cursor.value.sto_isim.toLowerCase().includes(search.toLowerCase()) ||
        cursor.value.sto_kod.toLowerCase().includes(search.toLowerCase())
      ) {
        if (count >= skip) {
          allProducts.push(cursor.value);
        }
        count++;
      }
      cursor = await cursor.continue();
    }

    // Toplam kayıt sayısını al
    const total = await store.count();

    return {
      products: allProducts,
      total,
    };
  } catch (error) {
    console.error('Ürünler alınırken hata:', error);
    throw error;
  }
}

export async function getProductsUpdatedAfter(date: string) {
  const db = await initProductDB();
  const index = db.transaction('products').store.index('by-lastup');
  return index.getAll(IDBKeyRange.lowerBound(date));
}
