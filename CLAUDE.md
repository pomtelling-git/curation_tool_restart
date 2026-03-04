# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Curator is a visual curation tool for DixonBaxi that allows users to manage creative projects and their assets (images, videos). Users can create projects, upload and organise media via drag-and-drop, reorder assets with FLIP animations, and share curated collections. This project is being **migrated from vanilla JavaScript to a Next.js/TypeScript stack** following the conventions established in the DixonBaxi Superfutures project.

## Migration Context

**Source:** Vanilla JS app with HTML files, plain CSS, IndexedDB + localStorage, optional Supabase
**Target:** Next.js 16 (App Router), TypeScript (strict), SCSS Modules, Zustand, Prisma + Supabase, following Superfutures conventions

### Current State (Pre-Migration)

The app currently consists of:
- `index.html` / `listing.js` - Projects listing page (create, rename, delete projects)
- `curation.html` / `curation.js` - Asset curation page (upload, reorder, delete media)
- `styles.css` - Single monolithic CSS file (502 lines)
- `supabase-client.js` / `config.js` - Optional Supabase initialisation
- `script.js` - Legacy alternative implementation (not in main flow)
- `supabase/schema.sql` - Database schema with RLS policies

### Target Architecture

```
src/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── projects/           # Project CRUD endpoints
│   │   └── assets/             # Asset upload/delete/reorder endpoints
│   ├── projects/
│   │   └── [id]/               # Dynamic project curation page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Projects listing page
│   └── error.tsx               # Error boundary
├── components/
│   ├── ProjectList/            # Project listing with create/rename/delete
│   │   ├── ProjectList.tsx
│   │   ├── ProjectRow.tsx
│   │   └── styles.module.scss
│   ├── Gallery/                # Masonry gallery with drag-and-drop
│   │   ├── Gallery.tsx
│   │   ├── GalleryItem.tsx
│   │   └── styles.module.scss
│   ├── DropZone/               # File upload drop zone
│   │   ├── DropZone.tsx
│   │   └── styles.module.scss
│   ├── Toast/                  # Toast notification system
│   │   ├── Toast.tsx
│   │   └── styles.module.scss
│   └── ui/                     # Shared UI primitives
│       ├── Button/
│       └── EditableTitle/
├── hooks/
│   ├── useProjects.ts          # Project CRUD operations
│   ├── useAssets.ts            # Asset management (upload, delete, reorder)
│   ├── useDragAndDrop.ts       # Drag-and-drop with FLIP animations
│   └── useToast.ts             # Toast notification hook
├── lib/
│   ├── prisma/                 # Prisma client singleton
│   ├── repositories/           # Database access layer
│   │   ├── projects/           # Project queries
│   │   └── assets/             # Asset queries
│   ├── services/               # Business logic
│   │   ├── projects/           # Project service (CRUD, validation)
│   │   └── assets/             # Asset service (upload, storage, reorder)
│   ├── supabase/               # Supabase clients (server, client, admin)
│   ├── storage/                # Supabase Storage helpers
│   └── utils/                  # Shared utilities (formatBytes, formatDuration)
├── store/
│   └── useStore.ts             # Zustand store (projects, assets, UI state)
├── styles/
│   ├── globals.scss            # Global styles, CSS variables, resets
│   ├── _variables.scss         # SCSS variables and design tokens
│   └── _animations.scss        # Shared animation definitions
└── types/
    └── index.ts                # Shared TypeScript types
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at localhost:3000 |
| `npm run build` | Build for production (runs `prisma generate` first) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npx tsc --noEmit` | Type-check without building |
| `npx prisma migrate dev --name <name>` | Create and apply database migration |
| `npx prisma generate` | Regenerate Prisma client |

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS Modules (`.module.scss`)
- **Database:** PostgreSQL via Supabase with Prisma ORM
- **Storage:** Supabase Storage (for uploaded media assets)
- **State:** Zustand
- **Testing:** Vitest with jsdom

## Code Style

- No emojis in code or UI
- SCSS Modules for all component styling (`.module.scss` co-located with components)
- TypeScript strict mode - no `any` types
- Prefer `interface` over `type` for object definitions
- Use path aliases (`@/lib`, `@/components`, `@/hooks`, etc.)
- Keep files under 200-300 lines; refactor if exceeding
- Use existing patterns before introducing new ones
- camelCase for variables and functions, PascalCase for components and types
- kebab-case for CSS class names within SCSS modules

## Key Patterns

### Repository Pattern
All database queries go through `src/lib/repositories/`. Each repository module exports functions, not classes. Example:

```typescript
// src/lib/repositories/projects/index.ts
export async function getProjects(): Promise<Project[]> { ... }
export async function getProjectById(id: string): Promise<Project | null> { ... }
export async function createProject(name: string): Promise<Project> { ... }
```

### Service Layer
Business logic in `src/lib/services/`. Services orchestrate repositories, validation, and external APIs:

```typescript
// src/lib/services/projects/index.ts
export async function createProject(name: string): Promise<Project> {
  // Validate, call repository, handle storage bucket creation
}
```

### Zustand Store
Single store file following this pattern:

```typescript
interface StoreState {
  projects: Project[]
  currentProject: Project | null
  assets: Asset[]
  // Actions
  setProjects: (projects: Project[]) => void
  addAsset: (asset: Asset) => void
  reorderAssets: (fromIndex: number, toIndex: number) => void
}
```

### API Routes
Next.js App Router route handlers in `src/app/api/`. Use Zod for request validation:

```typescript
// src/app/api/projects/route.ts
export async function GET() { ... }
export async function POST(request: Request) { ... }
```

### Component Structure
Each component gets its own directory with co-located SCSS module:

```
ComponentName/
├── ComponentName.tsx
├── styles.module.scss
└── index.ts          # Re-export (optional)
```

## Database

### Prisma Schema
Location: `prisma/schema.prisma`

**Models:**
- **Project** - Creative projects (`id`, `name`, `created_at`, `updated_at`)
- **Asset** - Media files (`id`, `project_id`, `file_name`, `storage_path`, `mime_type`, `size`, `sort_order`, `created_at`)

### Supabase Storage
- Bucket: `curation-assets`
- Path pattern: `{project_id}/{file_name}`
- Public URLs via Supabase Storage CDN

### Connection Pooling
- `DATABASE_URL` - Pooled connection via pgbouncer (port 6543) for application queries
- `DIRECT_URL` - Direct connection (port 5432) for Prisma migrations

## Design Tokens (from existing CSS)

Preserve the existing minimal B&W aesthetic:

```scss
// Colours
$bg: #ffffff;
$text-main: #000000;
$border: #000000;
$text-muted: #555555;

// Typography
$font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-size-base: 12px;
$font-size-header: 18px;
$font-size-label: 11px;
$font-size-meta: 10px;

// Layout
$border-radius: 0;
$border-width: 1px;
$gallery-columns: 3;        // Desktop
$gallery-columns-tablet: 2; // <= 768px
$gallery-columns-mobile: 1; // <= 480px

// Animation
$transition-fast: 0.16s ease-out;
$transition-medium: 0.22s ease-out;
$transition-reorder: 0.26s ease-out;
```

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin operations
- `DATABASE_URL` - Pooled Postgres connection (pgbouncer)
- `DIRECT_URL` - Direct Postgres connection (migrations)

## Important Notes

- Never mock data for dev/prod - mocking is only for tests
- Do not modify `.env` without explicit confirmation
- Focus changes on the specific task; avoid unrelated modifications
- Preserve the existing minimal, dense UI aesthetic (12px text, 1px borders, sharp corners, B&W)
- Drag-and-drop reordering must use FLIP animation technique for smooth transitions
- Support both image and video assets (auto-play muted loop for videos)
- The masonry gallery uses CSS columns, not CSS Grid
- All uploads go to Supabase Storage; no local IndexedDB in the migrated version
- Asset `sort_order` must be maintained in the database for persistent ordering
