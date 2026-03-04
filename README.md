## Visual Curator

A visual curation tool for DixonBaxi. Create projects, upload and organise media assets (images and videos) via drag-and-drop, reorder with FLIP animations, and share curated collections.

### Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict)
- **Styling:** SCSS Modules
- **Database:** PostgreSQL via Supabase with Prisma ORM
- **Storage:** Supabase Storage (uploaded media assets)
- **State:** Zustand
- **Testing:** Vitest

### Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `DATABASE_URL` — Pooled Postgres connection (pgbouncer, port 6543)
- `DIRECT_URL` — Direct Postgres connection (port 5432, for migrations)

3. **Set up the database:**

Run the Prisma migration to create tables:

```bash
npx prisma migrate dev --name init
```

4. **Set up Supabase Storage:**

In the Supabase dashboard, create a **public** bucket named `curation-assets`. In the bucket's configuration, set **Allowed MIME types** to allow `image/*` and `video/*` (or leave empty to allow all). Then run the storage policies from `supabase/schema.sql` in the SQL Editor.

5. **If the `assets` table already existed without `sort_order`:**

Run the migration in Supabase SQL Editor: `supabase/migrations/20250304000000_add_assets_sort_order.sql`

6. **Start the dev server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npx tsc --noEmit` | Type-check without building |
| `npx prisma migrate dev --name <name>` | Create and apply a migration |
| `npx prisma generate` | Regenerate Prisma client |

### Project Structure

```
src/
├── app/                  # Next.js App Router (pages + API routes)
│   ├── api/              # REST endpoints (projects, assets)
│   ├── projects/[id]/    # Project curation page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Projects listing
├── components/           # React components (co-located SCSS Modules)
│   ├── DropZone/         # File upload drop zone
│   ├── Gallery/          # Masonry gallery with drag-and-drop
│   ├── ProjectList/      # Project listing with CRUD
│   ├── Toast/            # Toast notifications
│   └── ui/               # Shared primitives (Button, EditableTitle)
├── hooks/                # Custom hooks (useProjects, useAssets, useDragAndDrop)
├── lib/
│   ├── prisma/           # Prisma client singleton
│   ├── repositories/     # Database access layer
│   ├── services/         # Business logic
│   ├── storage/          # Supabase Storage helpers
│   ├── supabase/         # Supabase client utilities
│   └── utils/            # Shared utilities (formatBytes, formatDuration)
├── store/                # Zustand store
├── styles/               # Global SCSS and design tokens
└── types/                # Shared TypeScript types
```
