import { openDB, DBSchema } from 'idb';

interface CalendarDB extends DBSchema {
  notes: {
    key: string;
    value: {
      id: string;
      date: string;
      title: string;
      content: string;
      amount?: number;
      type?: 'note' | 'payment' | 'expense';
      paymentType?: 'cash' | 'check' | 'promissory';
      createdAt: string;
    };
    indexes: { 'by-date': string };
  };
  cargoDeliveries: {
    key: string;
    value: {
      id: string;
      barcode: string;
      userId: string;
      userName: string;
      createdAt: string;
    };
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'calendar-db';
const DB_VERSION = 2;

export async function initDB() {
  const db = await openDB<CalendarDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // Eğer notes store yoksa oluştur
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', {
          keyPath: 'id'
        });
        store.createIndex('by-date', 'date');
      }
      
      if (!db.objectStoreNames.contains('cargoDeliveries')) {
        const store = db.createObjectStore('cargoDeliveries', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
      }
    }
  });
  return db;
}

export async function addNote(note: CalendarDB['notes']['value']) {
  const db = await initDB();
  await db.add('notes', note);
}

export async function updateNote(note: CalendarDB['notes']['value']) {
  const db = await initDB();
  await db.put('notes', note);
}

export async function deleteNote(id: string) {
  const db = await initDB();
  await db.delete('notes', id);
}

export async function getNotesByDate(date: string) {
  const db = await initDB();
  return db.getAllFromIndex('notes', 'by-date', date);
}

export async function getAllNotes() {
  const db = await initDB();
  return db.getAll('notes');
}

export async function addCargoDelivery(delivery: Omit<CalendarDB['cargoDeliveries']['value'], 'id'>) {
  const db = await initDB();
  const id = `DEL${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  await db.add('cargoDeliveries', { ...delivery, id });
  return id;
}

export async function getAllCargoDeliveries() {
  const db = await initDB();
  return db.getAll('cargoDeliveries');
}