-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) to create tables and storage.

-- Projects table (shared curations)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled project',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Assets table (files belonging to a project)
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  size bigint not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists assets_project_id_idx on public.assets(project_id);

-- Allow anonymous read/write so anyone with the link can view and upload (no auth required).
-- You can tighten with RLS later (e.g. require auth or a secret link token).
alter table public.projects enable row level security;
alter table public.assets enable row level security;

create policy "Allow all for projects"
  on public.projects for all
  using (true)
  with check (true);

create policy "Allow all for assets"
  on public.assets for all
  using (true)
  with check (true);

-- Storage: create bucket "curation-assets" in Dashboard → Storage → New bucket (set Public).
-- In bucket Settings, set "Allowed MIME types" to allow image/* and video/* (or leave empty to allow all).
-- Then run the following to allow anyone to read/upload/delete (for shared curations without auth):

create policy "curation-assets select"
  on storage.objects for select
  using (bucket_id = 'curation-assets');

create policy "curation-assets insert"
  on storage.objects for insert
  with check (bucket_id = 'curation-assets');

create policy "curation-assets delete"
  on storage.objects for delete
  using (bucket_id = 'curation-assets');
