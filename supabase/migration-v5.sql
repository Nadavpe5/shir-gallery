-- V5 Migration: Add section ZIP tracking
-- Run this in Supabase SQL Editor

ALTER TABLE galleries 
  ADD COLUMN IF NOT EXISTS zip_highlights_url TEXT,
  ADD COLUMN IF NOT EXISTS zip_gallery_url TEXT,
  ADD COLUMN IF NOT EXISTS zip_originals_url TEXT,
  ADD COLUMN IF NOT EXISTS zip_highlights_count INTEGER,
  ADD COLUMN IF NOT EXISTS zip_gallery_count INTEGER,
  ADD COLUMN IF NOT EXISTS zip_originals_count INTEGER,
  ADD COLUMN IF NOT EXISTS zip_highlights_size BIGINT,
  ADD COLUMN IF NOT EXISTS zip_gallery_size BIGINT,
  ADD COLUMN IF NOT EXISTS zip_originals_size BIGINT;

COMMENT ON COLUMN galleries.zip_highlights_url IS 'URL of highlights section ZIP';
COMMENT ON COLUMN galleries.zip_gallery_url IS 'URL of gallery section ZIP';
COMMENT ON COLUMN galleries.zip_originals_url IS 'URL of originals section ZIP';
COMMENT ON COLUMN galleries.zip_highlights_count IS 'Number of photos in highlights ZIP';
COMMENT ON COLUMN galleries.zip_gallery_count IS 'Number of photos in gallery ZIP';
COMMENT ON COLUMN galleries.zip_originals_count IS 'Number of photos in originals ZIP';
COMMENT ON COLUMN galleries.zip_highlights_size IS 'Size of highlights ZIP in bytes';
COMMENT ON COLUMN galleries.zip_gallery_size IS 'Size of gallery ZIP in bytes';
COMMENT ON COLUMN galleries.zip_originals_size IS 'Size of originals ZIP in bytes';

-- Keep existing zip_url, zip_generated_at, zip_asset_count, zip_size_bytes
-- These will be deprecated but kept for backward compatibility during transition
