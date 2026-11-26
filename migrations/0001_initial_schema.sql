-- Master 15 Kampus Mitra ETOS ID
CREATE TABLE IF NOT EXISTS campuses (
  id TEXT PRIMARY KEY,
  short_name TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 1. Media Showcase (3D Media Globe)
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  timestamp_label TEXT NOT NULL,
  alt TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1600,
  height INTEGER NOT NULL DEFAULT 900,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_items_published_order
  ON media_items (is_published, sort_order, created_at);

-- 2. Profil Etoser
CREATE TABLE IF NOT EXISTS etosers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campus_id TEXT NOT NULL REFERENCES campuses(id),
  major TEXT NOT NULL,
  batch TEXT NOT NULL,
  photo_r2_key TEXT NOT NULL,
  interest TEXT NOT NULL,
  project_title TEXT NOT NULL,
  bio TEXT NOT NULL,
  achievements_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_etosers_published_order
  ON etosers (is_published, sort_order, created_at);

-- 3. Berita & Artikel
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Prestasi', 'Aktivitas & Monev', 'Program')),
  date_label TEXT NOT NULL,
  published_at TEXT NOT NULL,
  location TEXT,
  cover_r2_key TEXT,
  excerpt TEXT NOT NULL,
  content_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_status_published
  ON news (status, published_at DESC);

-- 4. Testimoni Alumni
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campus TEXT NOT NULL,
  batch TEXT NOT NULL,
  photo_r2_key TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  impact TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_testimonials_published_order
  ON testimonials (is_published, sort_order, created_at);

-- 5. Tim Kami (Ketua Departemen, Tim Inti, Fasilitator Daerah)
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  group_type TEXT NOT NULL CHECK (group_type IN ('department_head', 'core_program', 'regional_facilitator')),
  campus_id TEXT REFERENCES campuses(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_r2_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_team_members_group_order
  ON team_members (is_published, group_type, sort_order);

-- Auth: Akun Admin & Session
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('superadmin', 'editor')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires
  ON admin_sessions (expires_at);
