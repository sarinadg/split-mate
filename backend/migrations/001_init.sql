-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

-- Users profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  initials   TEXT NOT NULL,
  color      TEXT NOT NULL,
  handle     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Houses
CREATE TABLE IF NOT EXISTS public.houses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- House members (many-to-many)
CREATE TABLE IF NOT EXISTS public.house_members (
  house_id  UUID REFERENCES public.houses(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (house_id, user_id)
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id       UUID REFERENCES public.houses(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  amount         NUMERIC(10,2) NOT NULL,
  category       TEXT NOT NULL,
  paid_by_id     UUID REFERENCES public.users(id),
  split_between  UUID[] NOT NULL,
  date           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settlements
CREATE TABLE IF NOT EXISTS public.settlements (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE,
  from_id  UUID REFERENCES public.users(id),
  to_id    UUID REFERENCES public.users(id),
  amount   NUMERIC(10,2) NOT NULL,
  date     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS for service-role access (assignment context)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements DISABLE ROW LEVEL SECURITY;
