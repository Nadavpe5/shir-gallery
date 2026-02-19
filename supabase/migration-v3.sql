-- V3 Migration: Add design_settings JSONB column to galleries
-- Run this in Supabase SQL Editor
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS design_settings JSONB DEFAULT '{}';
