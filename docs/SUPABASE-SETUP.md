# Supabase Setup for Visual Curator

Follow these steps once per Supabase project. After this, your app will store projects and uploads in Supabase so everyone with the link sees the same curation.

---

## Step 1: Get your credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to **Settings > API**.
3. Copy the following values into your `.env` file (see `.env.example`):

| `.env` variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` `secret` key |

4. Navigate to **Settings > Database**.
5. Copy the connection strings into your `.env` file:

| `.env` variable | Connection type |
|---|---|
| `DATABASE_URL` | Connection pooling URI (port 6543, append `?pgbouncer=true`) |
| `DIRECT_URL` | Direct connection URI (port 5432) |

---

## Step 2: Run Prisma migrations

Prisma manages the database tables (`projects`, `assets`). Run the following from the project root:

```bash
npx prisma migrate dev --name init
```

This creates the tables, indexes, and the `sort_order` column automatically. You do not need to run any SQL for table creation.

---

## Step 3: Create the storage bucket

1. In the Supabase dashboard sidebar, click **Storage**.
2. Click **New bucket**.
3. **Name:** type exactly: `curation-assets`
4. Turn **Public bucket** ON (so the app can serve images and videos).
5. Click **Create bucket**.

---

## Step 4: Add storage policies

1. In the sidebar, click **SQL Editor**.
2. Click **New query** and paste the SQL below.
3. Click **Run**.

```sql
create policy "curation-assets select"
  on storage.objects for select
  using (bucket_id = 'curation-assets');

create policy "curation-assets insert"
  on storage.objects for insert
  with check (bucket_id = 'curation-assets');

create policy "curation-assets delete"
  on storage.objects for delete
  using (bucket_id = 'curation-assets');
```

If you see "policy already exists", you can ignore it and continue.

---

## Done

Start the dev server with `npm run dev` and open [http://localhost:3000](http://localhost:3000). Create a project, upload files, and share the project URL.
