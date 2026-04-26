import * as SQLite from 'expo-sqlite';

export const getDb = async () => {
  const db = await SQLite.openDatabaseAsync('panic_app.db');
  return db;
};

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  therapistPhone: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export const initDb = async () => {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS panic_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      intensity INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      therapist_phone TEXT NOT NULL DEFAULT '',
      emergency_contact TEXT NOT NULL DEFAULT '',
      emergency_phone TEXT NOT NULL DEFAULT ''
    );
  `);
};

export const saveUserProfile = async (profile: UserProfile) => {
  const existingProfile = await getUserProfile();
  if (existingProfile) {
    profile.id = existingProfile.id;
    await updateUserProfile(profile);
  } else {
    await insertUserProfile(profile);
  }
};

export const insertUserProfile = async (profile: UserProfile) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO user_profile (id, name, email, phone, therapist_phone, emergency_contact, emergency_phone)
     VALUES (1, ?, ?, ?, ?, ?, ?)`,
    [profile.name, profile.email, profile.phone, profile.therapistPhone, profile.emergencyContact, profile.emergencyPhone]
  );
};

export const updateUserProfile = async (profile: UserProfile) => {
  const db = await getDb();
  await db.runAsync(
    `UPDATE user_profile SET name = ?, email = ?, phone = ?, therapist_phone = ?, emergency_contact = ?, emergency_phone = ? WHERE id = 1`,
    [profile.name, profile.email, profile.phone, profile.therapistPhone, profile.emergencyContact, profile.emergencyPhone]
  );
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    email: string;
    phone: string;
    therapist_phone: string;
    emergency_contact: string;
    emergency_phone: string;
  }>('SELECT id, name, email, phone, therapist_phone, emergency_contact, emergency_phone FROM user_profile WHERE id = 1');

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    therapistPhone: row.therapist_phone,
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
  };
};

export const insertLog = async (intensity: number | null) => {
  const db = await getDb();
  if (intensity === null) return;
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
