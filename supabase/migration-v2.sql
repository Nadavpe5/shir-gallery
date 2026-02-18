-- V2 Migration: Add status column to galleries
-- Run this in Supabase SQL Editor

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN ('draft', 'published'));

-- Update existing galleries to published
UPDATE galleries SET status = 'published' WHERE status = 'draft';
