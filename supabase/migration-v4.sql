-- V4 Migration: Add ZIP tracking metadata
-- Run this in Supabase SQL Editor

ALTER TABLE galleries 
  ADD COLUMN IF NOT EXISTS zip_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zip_asset_count INTEGER,
  ADD COLUMN IF NOT EXISTS zip_size_bytes BIGINT;

COMMENT ON COLUMN galleries.zip_generated_at IS 'When the ZIP was last generated';
COMMENT ON COLUMN galleries.zip_asset_count IS 'Number of assets included in the ZIP';
COMMENT ON COLUMN galleries.zip_size_bytes IS 'Size of the ZIP file in bytes';
