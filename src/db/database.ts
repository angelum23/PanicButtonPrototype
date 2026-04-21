import * as SQLite from 'expo-sqlite';

export const getDb = async () => {
  const db = await SQLite.openDatabaseAsync('panic_app.db');
  return db;
};

export const initDb = async () => {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS panic_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      intensity INTEGER NOT NULL
    );
  `);
};

export const insertLog = async (intensity: number) => {
  const db = await getDb();
  const timestamp = new Date().toISOString();
  await db.runAsync('INSERT INTO panic_logs (timestamp, intensity) VALUES (?, ?)', [
    timestamp,
    intensity,
  ]);
};

export const getLogs = async () => {
  const db = await getDb();
  const allRows = await db.getAllAsync('SELECT * FROM panic_logs ORDER BY id DESC');
  return allRows;
};
