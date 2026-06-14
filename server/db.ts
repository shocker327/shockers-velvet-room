import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = process.env.NODE_ENV === 'production' ? '/data' : path.join(process.cwd(), 'data');

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'velvet-suite.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    memory_key TEXT NOT NULL,
    memory_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS relationship_progress (
    user_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, companion_id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_user_companion 
    ON messages(user_id, companion_id);

  CREATE TABLE IF NOT EXISTS generated_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_memories_user_companion
    ON memories(user_id, companion_id);

  CREATE TABLE IF NOT EXISTS daily_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    message TEXT NOT NULL,
    generated_date TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_generated_images_user_companion
    ON generated_images(user_id, companion_id);

  CREATE INDEX IF NOT EXISTS idx_daily_messages_user_date
    ON daily_messages(user_id, companion_id, generated_date);

  CREATE TABLE IF NOT EXISTS custom_companions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    age_type TEXT NOT NULL,
    ethnicity TEXT NOT NULL,
    body_type TEXT NOT NULL,
    bust_size TEXT NOT NULL,
    butt_size TEXT NOT NULL,
    hair_color TEXT NOT NULL,
    hair_style TEXT NOT NULL,
    eye_color TEXT NOT NULL,
    voice_id TEXT NOT NULL,
    voice_name TEXT NOT NULL,
    occupation TEXT NOT NULL,
    hobbies TEXT NOT NULL,
    personality_traits TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    outfit TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    visual_description TEXT NOT NULL,
    avatar_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Add avatar_image_url column if it doesn't exist (migration for existing DBs)
  -- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we handle this in code

  CREATE INDEX IF NOT EXISTS idx_custom_companions_user
    ON custom_companions(user_id);

  CREATE TABLE IF NOT EXISTS voice_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    text_content TEXT NOT NULL,
    audio_base64 TEXT NOT NULL,
    duration_seconds REAL DEFAULT 0,
    played INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_voice_messages_user_companion
    ON voice_messages(user_id, companion_id, created_at);

  CREATE TABLE IF NOT EXISTS date_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    scene_image_url TEXT,
    choices_made TEXT DEFAULT '[]',
    message_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME
  );

  CREATE INDEX IF NOT EXISTS idx_date_sessions_user_companion
    ON date_sessions(user_id, companion_id, status);

  CREATE TABLE IF NOT EXISTS user_tiers (
    user_id TEXT PRIMARY KEY,
    tier TEXT NOT NULL DEFAULT 'paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: add avatar_image_url column if it doesn't exist
try {
  db.prepare('SELECT avatar_image_url FROM custom_companions LIMIT 1').get();
} catch {
  db.exec('ALTER TABLE custom_companions ADD COLUMN avatar_image_url TEXT');
}

export default db;
