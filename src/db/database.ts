import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('panic_app.db');
  }
  return dbInstance;
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

  // Execute each statement separately to avoid issues with multi-statement execAsync
  await db.execAsync('PRAGMA journal_mode = WAL;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS panic_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      intensity INTEGER NOT NULL
    );
  `);

  await db.execAsync(`
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

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS breathing_session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      exit_destination TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS grounding_session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      breathing_session_id INTEGER,
      opened_at TEXT NOT NULL,
      item1_rec_start TEXT,
      item1_rec_end TEXT,
      item2_rec_start TEXT,
      item2_rec_end TEXT,
      item3_rec_start TEXT,
      item3_rec_end TEXT,
      item4_rec_start TEXT,
      item4_rec_end TEXT,
      item5_rec_start TEXT,
      item5_rec_end TEXT,
      exit_destination TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS relaxation_session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grounding_session_id INTEGER,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      exit_destination TEXT
    );
  `);

  // Safe migration for existing databases: add FK columns if missing
  try { await db.execAsync('ALTER TABLE grounding_session_logs ADD COLUMN breathing_session_id INTEGER;'); } catch (_) { /* column already exists */ }
  try { await db.execAsync('ALTER TABLE relaxation_session_logs ADD COLUMN grounding_session_id INTEGER;'); } catch (_) { /* column already exists */ }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rating_session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      breathing_session_id INTEGER,
      grounding_session_id INTEGER,
      relaxation_session_id INTEGER,
      opened_at TEXT NOT NULL,
      rating INTEGER,
      saved_at TEXT
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

// ─── Breathing Session Logs ───────────────────────────────────────────────────

export interface BreathingSessionLog {
  id: number;
  opened_at: string;
  closed_at: string | null;
  exit_destination: string | null;
}

/**
 * Inserts a new breathing session record when the user opens the screen.
 * Returns the row id so it can be updated later with close time and destination.
 */
export const insertBreathingSession = async (): Promise<number> => {
  const db = await getDb();
  const openedAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO breathing_session_logs (opened_at) VALUES (?)',
    [openedAt]
  );
  return result.lastInsertRowId;
};

/**
 * Updates an existing breathing session with the close timestamp and where
 * the user navigated to (e.g. 'Rating', 'Grounding', 'back').
 */
export const updateBreathingSession = async (
  sessionId: number,
  exitDestination: string
): Promise<void> => {
  const db = await getDb();
  const closedAt = new Date().toISOString();
  await db.runAsync(
    'UPDATE breathing_session_logs SET closed_at = ?, exit_destination = ? WHERE id = ?',
    [closedAt, exitDestination, sessionId]
  );
};

/**
 * Returns all breathing session logs ordered by most recent first.
 */
export const getBreathingSessions = async (): Promise<BreathingSessionLog[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<BreathingSessionLog>(
    'SELECT * FROM breathing_session_logs ORDER BY id DESC'
  );
  return rows;
};

// ─── Grounding Session Logs ──────────────────────────────────────────────────

export interface GroundingSessionLog {
  id: number;
  breathing_session_id: number | null;
  opened_at: string;
  item1_rec_start: string | null;
  item1_rec_end: string | null;
  item2_rec_start: string | null;
  item2_rec_end: string | null;
  item3_rec_start: string | null;
  item3_rec_end: string | null;
  item4_rec_start: string | null;
  item4_rec_end: string | null;
  item5_rec_start: string | null;
  item5_rec_end: string | null;
  exit_destination: string | null;
}

/**
 * Inserts a new grounding session when the user opens the screen.
 * Optionally links to the previous breathing session.
 * Returns the row id for later updates.
 */
export const insertGroundingSession = async (
  breathingSessionId?: number
): Promise<number> => {
  const db = await getDb();
  const openedAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO grounding_session_logs (opened_at, breathing_session_id) VALUES (?, ?)',
    [openedAt, breathingSessionId ?? null]
  );
  return result.lastInsertRowId;
};

/**
 * Records the start timestamp of a specific item's recording (1-5).
 */
export const updateGroundingRecStart = async (
  sessionId: number,
  itemNumber: number
): Promise<void> => {
  const db = await getDb();
  const now = new Date().toISOString();
  const column = `item${itemNumber}_rec_start`;
  await db.runAsync(
    `UPDATE grounding_session_logs SET ${column} = ? WHERE id = ?`,
    [now, sessionId]
  );
};

/**
 * Records the end timestamp of a specific item's recording (1-5).
 */
export const updateGroundingRecEnd = async (
  sessionId: number,
  itemNumber: number
): Promise<void> => {
  const db = await getDb();
  const now = new Date().toISOString();
  const column = `item${itemNumber}_rec_end`;
  await db.runAsync(
    `UPDATE grounding_session_logs SET ${column} = ? WHERE id = ?`,
    [now, sessionId]
  );
};

/**
 * Updates a grounding session with the exit destination.
 */
export const updateGroundingSessionExit = async (
  sessionId: number,
  exitDestination: string
): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE grounding_session_logs SET exit_destination = ? WHERE id = ?',
    [exitDestination, sessionId]
  );
};

/**
 * Returns all grounding session logs ordered by most recent first.
 */
export const getGroundingSessions = async (): Promise<GroundingSessionLog[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<GroundingSessionLog>(
    'SELECT * FROM grounding_session_logs ORDER BY id DESC'
  );
  return rows;
};

// ─── Relaxation Session Logs ─────────────────────────────────────────────────

export interface RelaxationSessionLog {
  id: number;
  grounding_session_id: number | null;
  opened_at: string;
  closed_at: string | null;
  exit_destination: string | null;
}

/**
 * Inserts a new relaxation session record when the user opens the screen.
 * Optionally links to the previous grounding session.
 * Returns the row id so it can be updated later with close time and destination.
 */
export const insertRelaxationSession = async (
  groundingSessionId?: number
): Promise<number> => {
  const db = await getDb();
  const openedAt = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO relaxation_session_logs (opened_at, grounding_session_id) VALUES (?, ?)',
    [openedAt, groundingSessionId ?? null]
  );
  return result.lastInsertRowId;
};

/**
 * Updates an existing relaxation session with the close timestamp and where
 * the user navigated to (e.g. 'Rating', 'back').
 */
export const updateRelaxationSession = async (
  sessionId: number,
  exitDestination: string
): Promise<void> => {
  const db = await getDb();
  const closedAt = new Date().toISOString();
  await db.runAsync(
    'UPDATE relaxation_session_logs SET closed_at = ?, exit_destination = ? WHERE id = ?',
    [closedAt, exitDestination, sessionId]
  );
};

/**
 * Returns all relaxation session logs ordered by most recent first.
 */
export const getRelaxationSessions = async (): Promise<RelaxationSessionLog[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<RelaxationSessionLog>(
    'SELECT * FROM relaxation_session_logs ORDER BY id DESC'
  );
  return rows;
};

// ─── Rating Session Logs ────────────────────────────────────────────────────

export interface RatingSessionLog {
  id: number;
  breathing_session_id: number | null;
  grounding_session_id: number | null;
  relaxation_session_id: number | null;
  opened_at: string;
  rating: number | null;
  saved_at: string | null;
}

/**
 * Inserts a new rating session when the user opens the screen.
 * Exactly one of the three FK params should be provided, depending on
 * which screen the user came from. The others stay null.
 */
export const insertRatingSession = async (params?: {
  breathingSessionId?: number;
  groundingSessionId?: number;
  relaxationSessionId?: number;
}): Promise<number> => {
  const db = await getDb();
  const openedAt = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO rating_session_logs
       (opened_at, breathing_session_id, grounding_session_id, relaxation_session_id)
     VALUES (?, ?, ?, ?)`,
    [
      openedAt,
      params?.breathingSessionId ?? null,
      params?.groundingSessionId ?? null,
      params?.relaxationSessionId ?? null,
    ]
  );
  return result.lastInsertRowId;
};

/**
 * Updates a rating session with the chosen rating value and save timestamp.
 */
export const updateRatingSession = async (
  sessionId: number,
  rating: number
): Promise<void> => {
  const db = await getDb();
  const savedAt = new Date().toISOString();
  await db.runAsync(
    'UPDATE rating_session_logs SET rating = ?, saved_at = ? WHERE id = ?',
    [rating, savedAt, sessionId]
  );
};

/**
 * Returns all rating session logs ordered by most recent first.
 */
export const getRatingSessions = async (): Promise<RatingSessionLog[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<RatingSessionLog>(
    'SELECT * FROM rating_session_logs ORDER BY id DESC'
  );
  return rows;
};

// ─── Usage Report Data ──────────────────────────────────────────────────────

export interface UsageReportData {
  /** Period covered */
  firstSessionDate: string | null;
  lastSessionDate: string | null;
  /** Overall counts */
  totalBreathingSessions: number;
  totalGroundingSessions: number;
  totalRelaxationSessions: number;
  totalRatingSessions: number;
  /** Average session durations in seconds */
  avgBreathingDurationSec: number | null;
  avgRelaxationDurationSec: number | null;
  /** Rating statistics */
  avgRating: number | null;
  minRating: number | null;
  maxRating: number | null;
  ratingDistribution: { rating: number; count: number }[];
  /** Grounding item completion rate (how many of 5 items were used on average) */
  avgGroundingItemsCompleted: number | null;
  /** Usage frequency – sessions per day of the week (0=Sun…6=Sat) */
  sessionsPerDayOfWeek: { day: number; count: number }[];
  /** Recent timeline (last 20 events across all tables) */
  recentTimeline: { type: string; date: string; detail: string }[];
}

/**
 * Gathers aggregated, synthetic usage data for the therapist report.
 */
export const getUsageReportData = async (): Promise<UsageReportData> => {
  const db = await getDb();

  // ── Counts ──
  const breathingCount = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM breathing_session_logs'
  );
  const groundingCount = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM grounding_session_logs'
  );
  const relaxationCount = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM relaxation_session_logs'
  );
  const ratingCount = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM rating_session_logs WHERE rating IS NOT NULL'
  );

  // ── Date range ──
  const dateRange = await db.getFirstAsync<{ minDate: string | null; maxDate: string | null }>(
    `SELECT MIN(d) as minDate, MAX(d) as maxDate FROM (
       SELECT opened_at as d FROM breathing_session_logs
       UNION ALL SELECT opened_at FROM grounding_session_logs
       UNION ALL SELECT opened_at FROM relaxation_session_logs
     )`
  );

  // ── Average durations ──
  const avgBreathing = await db.getFirstAsync<{ avg_sec: number | null }>(
    `SELECT AVG(
       (julianday(closed_at) - julianday(opened_at)) * 86400
     ) as avg_sec FROM breathing_session_logs WHERE closed_at IS NOT NULL`
  );
  const avgRelaxation = await db.getFirstAsync<{ avg_sec: number | null }>(
    `SELECT AVG(
       (julianday(closed_at) - julianday(opened_at)) * 86400
     ) as avg_sec FROM relaxation_session_logs WHERE closed_at IS NOT NULL`
  );

  // ── Rating stats ──
  const ratingStats = await db.getFirstAsync<{
    avg_r: number | null;
    min_r: number | null;
    max_r: number | null;
  }>(
    'SELECT AVG(rating) as avg_r, MIN(rating) as min_r, MAX(rating) as max_r FROM rating_session_logs WHERE rating IS NOT NULL'
  );

  const ratingDistRows = await db.getAllAsync<{ rating: number; count: number }>(
    'SELECT rating, COUNT(*) as count FROM rating_session_logs WHERE rating IS NOT NULL GROUP BY rating ORDER BY rating'
  );

  // ── Grounding completion ──
  const groundingCompletion = await db.getFirstAsync<{ avg_items: number | null }>(
    `SELECT AVG(
       (CASE WHEN item1_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
       (CASE WHEN item2_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
       (CASE WHEN item3_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
       (CASE WHEN item4_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
       (CASE WHEN item5_rec_end IS NOT NULL THEN 1 ELSE 0 END)
     ) as avg_items FROM grounding_session_logs`
  );

  // ── Sessions per day of week ──
  const dayOfWeekRows = await db.getAllAsync<{ day: number; count: number }>(
    `SELECT day, SUM(c) as count FROM (
       SELECT CAST(strftime('%w', opened_at) AS INTEGER) as day, COUNT(*) as c FROM breathing_session_logs GROUP BY day
       UNION ALL
       SELECT CAST(strftime('%w', opened_at) AS INTEGER) as day, COUNT(*) as c FROM grounding_session_logs GROUP BY day
       UNION ALL
       SELECT CAST(strftime('%w', opened_at) AS INTEGER) as day, COUNT(*) as c FROM relaxation_session_logs GROUP BY day
     ) GROUP BY day ORDER BY day`
  );

  // ── Recent timeline (last 20) ──
  const timelineRows = await db.getAllAsync<{ type: string; date: string; detail: string }>(
    `SELECT type, date, detail FROM (
       SELECT 'Respiração' as type, opened_at as date,
         CASE WHEN closed_at IS NOT NULL
           THEN 'Duração: ' || CAST(ROUND((julianday(closed_at) - julianday(opened_at)) * 86400) AS INTEGER) || 's'
           ELSE 'Sessão não finalizada'
         END as detail
       FROM breathing_session_logs
       UNION ALL
       SELECT 'Grounding' as type, opened_at as date,
         'Itens completados: ' || (
           (CASE WHEN item1_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN item2_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN item3_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN item4_rec_end IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN item5_rec_end IS NOT NULL THEN 1 ELSE 0 END)
         ) || '/5' as detail
       FROM grounding_session_logs
       UNION ALL
       SELECT 'Relaxamento' as type, opened_at as date,
         CASE WHEN closed_at IS NOT NULL
           THEN 'Duração: ' || CAST(ROUND((julianday(closed_at) - julianday(opened_at)) * 86400) AS INTEGER) || 's'
           ELSE 'Sessão não finalizada'
         END as detail
       FROM relaxation_session_logs
       UNION ALL
       SELECT 'Avaliação' as type, opened_at as date,
         CASE WHEN rating IS NOT NULL
           THEN 'Nota: ' || rating || '/10'
           ELSE 'Sem avaliação registrada'
         END as detail
       FROM rating_session_logs
     ) ORDER BY date DESC LIMIT 20`
  );

  return {
    firstSessionDate: dateRange?.minDate ?? null,
    lastSessionDate: dateRange?.maxDate ?? null,
    totalBreathingSessions: breathingCount?.c ?? 0,
    totalGroundingSessions: groundingCount?.c ?? 0,
    totalRelaxationSessions: relaxationCount?.c ?? 0,
    totalRatingSessions: ratingCount?.c ?? 0,
    avgBreathingDurationSec: avgBreathing?.avg_sec ?? null,
    avgRelaxationDurationSec: avgRelaxation?.avg_sec ?? null,
    avgRating: ratingStats?.avg_r ?? null,
    minRating: ratingStats?.min_r ?? null,
    maxRating: ratingStats?.max_r ?? null,
    ratingDistribution: ratingDistRows,
    avgGroundingItemsCompleted: groundingCompletion?.avg_items ?? null,
    sessionsPerDayOfWeek: dayOfWeekRows,
    recentTimeline: timelineRows,
  };
};
