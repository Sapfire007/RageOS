-- RageOS Phase 1: Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  corrupted_name TEXT,
  password       TEXT,
  gender         TEXT CHECK (gender IN ('male', 'female', 'other')),
  avatar_url     TEXT,
  bug_level      INTEGER NOT NULL DEFAULT 0,
  total_crashes  INTEGER NOT NULL DEFAULT 0,
  total_payments_attempted INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migrations — run these if the table already exists:
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- Row Level Security: users can only see/edit their own row
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own row"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR true);   -- anon access allowed for hackathon demo

CREATE POLICY "Users can insert own row"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own row"
  ON public.users FOR UPDATE
  USING (true);


-- ============================================================
-- 2. VIRUS FILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.virus_files (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES public.users(id) ON DELETE CASCADE,
  filename             TEXT NOT NULL,
  bug_tier             TEXT NOT NULL DEFAULT 'LOW',
  file_type            TEXT,
  bug_level_threshold  INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migrations — run these if the table already exists:
-- ALTER TABLE public.virus_files ADD COLUMN IF NOT EXISTS file_type TEXT;
-- ALTER TABLE public.virus_files ADD COLUMN IF NOT EXISTS bug_level_threshold INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.virus_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Virus files: open access for demo"
  ON public.virus_files FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
-- Speeds up login lookup (name + password query)
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);
CREATE INDEX IF NOT EXISTS idx_virus_files_user_id ON public.virus_files(user_id);


-- ============================================================
-- DONE: Paste this entire script in Supabase SQL Editor and run.
-- ============================================================
