import { openDB, DBSchema } from 'idb';

interface CustomerDB extends DBSchema {
  customers: {
    key: string;
    value: {
      cari_kod: string;
      cari_unvan1: string;
      cari_unvan2: string;
      cari_vdaire_no: string;
      cari_EMail: string;
      cari_CepTel: string;
      cari_create_date: string;
      cari_lastup_date: string;
      cari_hareket_tipi: number;
      cari_baglanti_tipi: number;
      cari_vdaire_adi: string;
      cari_sicil_no: string;
      cari_VergiKimlikNo: string;
      region?: string;
      latitude?: string;
      longitude?: string;
      lastSync?: string;
    };
    indexes: { 'by-unvan': string; 'by-kod': string; 'by-sync': string };
  };
  sync_status: {
    key: string;
    value: {
      table_name: string;
      last_sync: string;
    };
  };
}

const DB_NAME = 'customer-db';
const DB_VERSION = 2;

export async function initCustomerDB() {
  return openDB<CustomerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Müşteriler store'u
      if (!db.objectStoreNames.contains('customers')) {
        const store = db.createObjectStore('customers', { keyPath: 'cari_kod' });
        store.createIndex('by-unvan', 'cari_unvan1');
        store.createIndex('by-kod', 'cari_kod');
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
  const db = await initCustomerDB();
  const syncStatus = await db.get('sync_status', tableName);
  return syncStatus?.last_sync;
}

export async function updateLastSyncTime(tableName: string) {
  const db = await initCustomerDB();
  await db.put('sync_status', {
    table_name: tableName,
    last_sync: new Date().toISOString()
  });
}

export async function addCustomers(customers: any[]) {
  const db = await initCustomerDB();
  const tx = db.transaction('customers', 'readwrite');
  
  // Ensure each customer has cari_kod as the key
  const processedCustomers = customers.map(customer => ({
    ...customer,
    lastSync: new Date().toISOString(),
    cari_kod: customer.cari_kod || customer.id // Fallback to id if cari_kod missing
  }));
  
  await Promise.all(processedCustomers.map(customer => tx.store.put(customer)));
  await tx.done;
}

export async function getCustomers(search?: string) {
  const db = await initCustomerDB();
  const store = db.transaction('customers', 'readonly').store;
  let customers = await store.getAll();

  if (search) {
    const searchLower = search.toLowerCase();
    customers = customers.filter(customer =>
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.cari_kod && customer.cari_kod.includes(search)) ||
      (customer.cari_vdaire_no && customer.cari_vdaire_no.includes(search))
    );
  }

  return customers;
}

export async function getCustomerById(id: string) {
  const db = await initCustomerDB();
  const customer = await db.get('customers', id);
  
  if (!customer) return null;
  
  // Adres bilgisini oluştur
  const addressParts = [
    customer.adr_cadde,
    customer.adr_mahalle,
    customer.adr_sokak,
    customer.adr_Semt,
    customer.adr_ilce,
    customer.adr_il
  ].filter(Boolean);

  return customer;
}

export async function getCustomersUpdatedAfter(date: string) {
  const db = await initCustomerDB();
  const index = db.transaction('customers').store.index('by-sync');
  return index.getAll(IDBKeyRange.lowerBound(date));
}

export async function updateCustomer(id: string, updates: Partial<CustomerDB['customers']['value']>) {
  const db = await initCustomerDB();
  const customer = await db.get('customers', id);
  if (!customer) return;

  await db.put('customers', {
    ...customer,
    ...updates,
    lastSync: new Date().toISOString()
  });
}