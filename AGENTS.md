# AGENTS.md

Instructions for AI coding agents working with this codebase.

## Project Overview

Visual Curator is a visual curation tool for DixonBaxi being migrated from vanilla JavaScript to Next.js 16 (App Router), TypeScript, SCSS Modules, Zustand, and Prisma + Supabase. The app allows users to manage creative projects and their media assets (images, videos) with drag-and-drop reordering, upload, and sharing.

## Migration Strategy

This is a full rewrite from vanilla JS to React/Next.js. Do NOT attempt to incrementally convert the existing JS files. Instead, build the new Next.js app from scratch following the target architecture, using the existing code as a **behavioural reference** for features, UI, and interactions.

### Migration Phases

#### Phase 1: Project Scaffolding
1. Initialise Next.js 16 with TypeScript, App Router, SCSS Modules
2. Install dependencies: `zustand`, `prisma`, `@prisma/client`, `@supabase/supabase-js`, `@supabase/ssr`, `sass`, `zod`, `lucide-react`
3. Configure `tsconfig.json` with path aliases (`@/*` -> `./src/*`)
4. Configure `next.config.ts` with security headers and image domains
5. Set up ESLint and Prettier configs
6. Create `.env.example` with all required variables
7. Set up global styles (`globals.scss`, `_variables.scss`, `_animations.scss`)

#### Phase 2: Database & Backend
1. Create Prisma schema (`Project`, `Asset` models) based on existing `supabase/schema.sql`
2. Add `sort_order` integer field to Asset model (not in original schema)
3. Set up Prisma client singleton (`src/lib/prisma/index.ts`)
4. Create Supabase client utilities (`src/lib/supabase/server.ts`, `client.ts`, `admin.ts`)
5. Build repository layer (`src/lib/repositories/projects/`, `src/lib/repositories/assets/`)
6. Build service layer (`src/lib/services/projects/`, `src/lib/services/assets/`)
7. Create API routes:
   - `GET/POST /api/projects` - List and create projects
   - `GET/PATCH/DELETE /api/projects/[id]` - Single project operations
   - `GET/POST /api/projects/[id]/assets` - List and upload assets
   - `PATCH /api/projects/[id]/assets/reorder` - Reorder assets
   - `DELETE /api/assets/[id]` - Delete single asset
8. Run initial Prisma migration

#### Phase 3: State Management
1. Create Zustand store (`src/store/useStore.ts`) with:
   - `projects: Project[]` - All projects
   - `currentProject: Project | null` - Active project
   - `assets: Asset[]` - Assets for current project
   - `isUploading: boolean` - Upload state
   - `dragState: DragState | null` - Drag-and-drop state
   - `toast: ToastState | null` - Toast notification
   - Actions for all CRUD operations and UI state

#### Phase 4: Shared Components & Hooks
1. Build UI primitives (`Button`, `EditableTitle`)
2. Build `Toast` component and `useToast` hook
3. Build `DropZone` component for file uploads
4. Build `useDragAndDrop` hook with FLIP animation logic
5. Build `useProjects` hook (fetches, creates, updates, deletes)
6. Build `useAssets` hook (fetches, uploads, deletes, reorders)

#### Phase 5: Pages & Features
1. Root layout (`src/app/layout.tsx`) - fonts, global styles, metadata
2. Projects listing page (`src/app/page.tsx`):
   - Render `ProjectList` component
   - Create new project button
   - Each row: project name (editable), share link copy, delete
   - Sorted by `updated_at` descending
3. Project curation page (`src/app/projects/[id]/page.tsx`):
   - Back navigation to listing
   - Editable project title
   - `DropZone` for file upload (images + videos)
   - `Gallery` masonry grid with `GalleryItem` components
   - Drag-to-reorder with FLIP animations
   - Item count display
   - Per-item: remove button, download button, metadata display

#### Phase 6: Polish & Testing
1. Error boundaries and loading states
2. Responsive breakpoints (3 -> 2 -> 1 columns)
3. Toast notifications for all actions
4. Video handling (auto-play muted loop, click to play/pause, duration display)
5. Write tests for services and utilities
6. Accessibility (ARIA labels, keyboard navigation, semantic HTML)

## Code Style

- No emojis in code or UI
- Use SCSS Modules for component styling (`.module.scss`)
- TypeScript strict mode - no `any` types
- Prefer `interface` over `type` for object definitions
- Use path aliases (`@/lib`, `@/components`, `@/hooks`, etc.)
- Keep files under 200-300 lines; refactor if exceeding
- Use existing patterns before introducing new ones

## Workflow

- Run `npm run lint` after making changes
- Run `npm run test:run` after modifying `src/lib` to verify tests pass
- Run `npx tsc --noEmit` to check types without building

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (runs `prisma generate` first) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npx prisma migrate dev --name <name>` | Create and apply database migration |
| `npx prisma generate` | Regenerate Prisma client |

## Database

- **ORM:** Prisma with PostgreSQL via Supabase
- **Schema:** `prisma/schema.prisma`
- **Models:** Project, Asset
- **Storage:** Supabase Storage bucket `curation-assets`
- **Migrations:** `npx prisma migrate dev --name <migration_name>`
- **Generate client:** `npx prisma generate`
- Uses pgbouncer connection pooling (`DATABASE_URL`) and direct connection for migrations (`DIRECT_URL`)

## Architecture

### Key Patterns

- **Repository Pattern**: All database queries through `src/lib/repositories/`
- **Service Layer**: Business logic in `src/lib/services/`
- **Zustand Store**: Single store for client state (`src/store/useStore.ts`)
- **API Routes**: Next.js App Router route handlers with Zod validation
- **SCSS Modules**: Co-located with components, using shared `_variables.scss`

### Component Structure

```
ComponentName/
├── ComponentName.tsx
├── styles.module.scss
└── index.ts
```

### Data Flow

```
User Action → Hook → API Route → Service → Repository → Prisma → Supabase DB
                                          → Supabase Storage (for file uploads)
           ← Hook updates Zustand store ← API Response
           ← Component re-renders from store
```

## Feature Reference (from vanilla JS source)

### Projects Page Behaviour
- Projects sorted by `updatedAt` descending
- Click project name to navigate to curation page
- Inline edit project name (contentEditable, Enter to save)
- Copy share link button (clipboard API)
- Delete with confirmation prompt
- "New project" creates with default name "Untitled project"

### Curation Page Behaviour
- Drop zone accepts images and videos only (`image/*`, `video/*`)
- Click drop zone opens native file picker
- Multiple file upload supported
- Gallery uses CSS `column-count` for masonry layout
- Drag-and-drop reorder with FLIP animation:
  1. Capture current element positions
  2. Perform DOM reorder
  3. Calculate position delta
  4. Animate from old position to new position using transforms
- Each gallery item shows:
  - Media preview (image or auto-playing muted video)
  - File name and formatted size (e.g., "1.2 MB")
  - Video duration if applicable (e.g., "2m 15s")
  - Remove button (with toast confirmation)
  - Download button
- Item count displayed in header
- Editable project title in header
- Back button to projects listing

### Toast Notifications
- Fixed position bottom-centre
- Auto-dismiss after timeout
- Types: success (default), error
- Slide-up entrance, fade-out exit

### Utility Functions to Preserve
- `formatBytes(bytes)` - Human-readable file size
- `formatDuration(seconds)` - Human-readable video duration
- FLIP animation calculation (captureRects, runFlipAnimation)

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin operations
- `DATABASE_URL` - Pooled Postgres connection (pgbouncer)
- `DIRECT_URL` - Direct Postgres connection (migrations)

## Testing

- **Framework:** Vitest with jsdom environment
- **Location:** Co-located as `*.test.ts`
- **Coverage targets:** 80%+ for services, 100% for utilities
- Mock external dependencies (Prisma, Supabase)

## Important Notes

- Never mock data for dev/prod - mocking is only for tests
- Do not modify `.env` without explicit confirmation
- Use existing patterns before introducing new ones
- Focus changes on the specific task; avoid unrelated modifications
- Preserve the minimal B&W aesthetic (12px base, 1px borders, sharp corners, system fonts)
- All media storage uses Supabase Storage - no IndexedDB or localStorage in the migrated version
- Asset ordering persists via `sort_order` column in the database
- Videos auto-play muted in loop; click toggles play/pause
- Gallery is masonry layout via CSS columns (not CSS Grid)
