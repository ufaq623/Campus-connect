// SQLite connection + schema. The database file is created automatically on first run.
import Database from 'better-sqlite3'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const file = process.env.DB_PATH || path.join(here, 'data', 'campus.db')
fs.mkdirSync(path.dirname(file), { recursive: true })

const db = new Database(file)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin','Moderator','Student')),
  title TEXT DEFAULT '',            -- e.g. HOD, Head CR, Head GR (admins)
  joined_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE, emoji TEXT DEFAULT '🌟',
  description TEXT NOT NULL, base_members INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS memberships (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, club_id)
);
CREATE TABLE IF NOT EXISTS moderators (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, club_id)
);
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, text TEXT DEFAULT '', link TEXT DEFAULT '',
  attachment_name TEXT, attachment_url TEXT, attachment_type TEXT,
  pinned INTEGER DEFAULT 0, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS votes (            -- no FK on user_id so demo data can have anonymous voters
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, value INTEGER NOT NULL CHECK (value IN (-1,1)),
  PRIMARY KEY (post_id, user_id)
);
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,   -- deleting a comment deletes its replies
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL, label TEXT DEFAULT '', link TEXT DEFAULT '',
  attachment_name TEXT, attachment_url TEXT, attachment_type TEXT, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
  date TEXT NOT NULL, time TEXT NOT NULL, venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled','Cancelled'))
);
CREATE TABLE IF NOT EXISTS club_requests (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, reason TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at INTEGER NOT NULL
);
`)

export const uid = (prefix) => prefix + crypto.randomBytes(5).toString('hex')
export default db
