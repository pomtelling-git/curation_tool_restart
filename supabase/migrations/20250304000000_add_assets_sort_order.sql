-- Add sort_order to assets for existing databases.
-- Run in Supabase SQL Editor if your assets table was created before this column existed.

alter table public.assets
  add column if not exists sort_order integer not null default 0;

comment on column public.assets.sort_order is 'Display order within the project (0-based).';
