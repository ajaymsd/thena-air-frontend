import { openDB } from 'idb';

const DB_NAME = 'thenaair-db';
const DB_VERSION = 1;
const STORE_NAME = 'flights';

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function saveFlightsToCache(flights: any[]) {
  const db = await dbPromise;
  await db.put(STORE_NAME, flights, 'all');
}

export async function getFlightsFromCache() {
  const db = await dbPromise;
  return db.get(STORE_NAME, 'all');
} 