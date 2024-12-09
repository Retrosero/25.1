import { openDB } from 'idb';
import { MikroDB } from './schema';

const DB_NAME = 'mikro_db';
const DB_VERSION = 1;

export async function initDB() {
  const db = await openDB<MikroDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create CARI_HESAPLAR store
      if (!db.objectStoreNames.contains('CARI_HESAPLAR')) {
        const store = db.createObjectStore('CARI_HESAPLAR', { keyPath: 'cari_kod' });
        store.createIndex('by-lastup', 'cari_lastup_date');
        store.createIndex('by-unvan', 'cari_unvan1');
        store.createIndex('by-kod', 'cari_kod');
      }

      // Create CARI_HESAP_ADRESLERI store
      if (!db.objectStoreNames.contains('CARI_HESAP_ADRESLERI')) {
        const store = db.createObjectStore('CARI_HESAP_ADRESLERI', { 
          keyPath: ['adr_cari_kod', 'adr_adres_tip'] 
        });
        store.createIndex('by-lastup', 'adr_lastup_date');
        store.createIndex('by-cari-kod', 'adr_cari_kod');
      }

      // Create CARI_HESAP_YETKILILERI store
      if (!db.objectStoreNames.contains('CARI_HESAP_YETKILILERI')) {
        const store = db.createObjectStore('CARI_HESAP_YETKILILERI', { 
          keyPath: ['yet_cari_kod', 'yet_adi', 'yet_soyadi'] 
        });
        store.createIndex('by-lastup', 'yet_lastup_date');
        store.createIndex('by-cari-kod', 'yet_cari_kod');
      }

      // Create BARKOD_TANIMLARI store
      if (!db.objectStoreNames.contains('BARKOD_TANIMLARI')) {
        const store = db.createObjectStore('BARKOD_TANIMLARI', { 
          keyPath: ['bar_kodu', 'bar_stokkodu'] 
        });
        store.createIndex('by-lastup', 'bar_lastup_date');
        store.createIndex('by-stokkodu', 'bar_stokkodu');
        store.createIndex('by-barkod', 'bar_kodu');
      }

      // Create sync_status store
      if (!db.objectStoreNames.contains('sync_status')) {
        db.createObjectStore('sync_status', { keyPath: 'table_name' });
      }
    }
  });
  return db;
}

export async function getLastSyncTime(tableName: string) {
  const db = await initDB();
  const syncStatus = await db.get('sync_status', tableName);
  return syncStatus?.last_sync;
}

export async function updateLastSyncTime(tableName: string) {
  const db = await initDB();
  await db.put('sync_status', {
    table_name: tableName,
    last_sync: new Date().toISOString()
  });
}

export async function addCustomers(customers: any[]) {
  const db = await initDB();
  const tx = db.transaction('CARI_HESAPLAR', 'readwrite');
  await Promise.all(customers.map(customer => tx.store.put(customer)));
  await tx.done;
}

export async function getCustomers(query?: string) {
  const db = await initDB();
  if (!query) {
    return db.getAll('CARI_HESAPLAR');
  }

  const customers = await db.getAllFromIndex('CARI_HESAPLAR', 'by-unvan');
  return customers.filter(customer => 
    customer.cari_unvan1.toLowerCase().includes(query.toLowerCase()) ||
    customer.cari_kod.toLowerCase().includes(query.toLowerCase()) ||
    customer.cari_vdaire_no.includes(query)
  );
}

export async function getCustomerById(id: string) {
  const db = await initDB();
  return db.get('CARI_HESAPLAR', id);
}

export async function getCustomersUpdatedAfter(date: string) {
  const db = await initDB();
  const index = db.transaction('CARI_HESAPLAR').store.index('by-lastup');
  return index.getAll(IDBKeyRange.lowerBound(date));
}

// Barkod tanımları için fonksiyonlar
export async function addBarkodlar(barkodlar: any[]) {
  const db = await initDB();
  const tx = db.transaction('BARKOD_TANIMLARI', 'readwrite');
  await Promise.all(barkodlar.map(barkod => tx.store.put(barkod)));
  await tx.done;
}

export async function getBarkodlar(query?: string) {
  const db = await initDB();
  if (!query) {
    return db.getAll('BARKOD_TANIMLARI');
  }

  const barkodlar = await db.getAllFromIndex('BARKOD_TANIMLARI', 'by-barkod');
  return barkodlar.filter(barkod => 
    barkod.bar_kodu.toLowerCase().includes(query.toLowerCase()) ||
    barkod.bar_stokkodu.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getBarkodByStokKodu(stokKodu: string) {
  const db = await initDB();
  const index = db.transaction('BARKOD_TANIMLARI').store.index('by-stokkodu');
  return index.getAll(stokKodu);
}

export async function getBarkodlarUpdatedAfter(date: string) {
  const db = await initDB();
  const index = db.transaction('BARKOD_TANIMLARI').store.index('by-lastup');
  return index.getAll(IDBKeyRange.lowerBound(date));
}

// Cari hesaplar için fonksiyonlar
export async function addCariHesaplar(cariHesaplar: any[]) {
  const db = await initDB();
  const tx = db.transaction('CARI_HESAPLAR', 'readwrite');
  await Promise.all(cariHesaplar.map(cari => tx.store.put(cari)));
  await tx.done;
}

export async function getCariHesaplar(query?: string) {
  const db = await initDB();
  if (!query) {
    return db.getAll('CARI_HESAPLAR');
  }

  const cariHesaplar = await db.getAllFromIndex('CARI_HESAPLAR', 'by-unvan');
  return cariHesaplar.filter(cari => 
    cari.cari_unvan1.toLowerCase().includes(query.toLowerCase()) ||
    cari.cari_kod.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getCariHesapById(id: string) {
  const db = await initDB();
  return db.get('CARI_HESAPLAR', id);
}

export async function getCariHesaplarUpdatedAfter(date: string) {
  const db = await initDB();
  const index = db.transaction('CARI_HESAPLAR').store.index('by-lastup');
  return index.getAll(IDBKeyRange.lowerBound(date));
}