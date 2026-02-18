-- Shir Gallery MVP - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- GALLERIES
-- ============================================
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  shoot_title TEXT NOT NULL,
  subtitle TEXT,
  location TEXT,
  shoot_date DATE,
  password_hash TEXT NOT NULL,
  cover_image_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  zip_url TEXT,
  edited_count INT DEFAULT 0,
  originals_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'))
);

CREATE INDEX idx_galleries_slug ON galleries(slug);

-- ============================================
-- GALLERY ASSETS
-- ============================================
CREATE TABLE gallery_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  web_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('highlight', 'gallery', 'original')),
  sort_order INT DEFAULT 0,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gallery_assets_gallery_id ON gallery_assets(gallery_id);
CREATE INDEX idx_gallery_assets_type ON gallery_assets(gallery_id, type);

-- ============================================
-- GALLERY SESSIONS
-- ============================================
CREATE TABLE gallery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_gallery_sessions_gallery_id ON gallery_sessions(gallery_id);

-- ============================================
-- EVENTS (optional analytics)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  session_id UUID REFERENCES gallery_sessions(id),
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_gallery_id ON events(gallery_id);
