# AI Coding Assistant Instructions (Rezumer)

Goal: Let an AI contributor make correct, minimal, idiomatic changes fast. Reference real files; copy existing patterns; avoid speculative abstractions.

## Architecture

Frontend: Next.js 15 App Router (`src/app/*`), React 19. Global shell & providers in `src/app/layout.tsx` (order matters: `ClerkProvider` → `ConvexClientProvider` → `<html>`).
Backend: Convex functions in `convex/` with schema + indexes in `convex/schema.ts`.
Auth: Clerk via `src/middleware.ts` (public routes: `/`, `/sign-in`). Convex auth: `ctx.auth.getUserIdentity()`.
Data access: Only through Convex generated API (`convex/_generated`). No ad‑hoc fetch calls.

## Data Model

`users` (indexed by `clerkId`). `applications` (indexed by `userId`). `resumes` (indexed by `userId`). Stages enumerated in `convex/applications.ts` (`STAGES`). Design templates in `convex/resumes.ts` (`DESIGN_TEMPLATES`). Per-user caps: 200 applications (`APPLICATION_LIMIT_REACHED`), 5 resumes (`RESUME_LIMIT_REACHED`).

## Backend Patterns

Always: get identity → look up user via `by_clerkId` → enforce ownership (`Forbidden`). Validate stage against `STAGES` (applications) or template against `DESIGN_TEMPLATES` (resumes). Limit queries with `.take()` when enforcing caps. For optional numeric removal use a `clearX` flag (see `updateApplication`). File storage: use Convex built-in storage (`_storage` table) with server-side validation (magic numbers, size, Content-Type) in `savePdfToResume` action (note: validation requires `fetch()`, so must be an action, not mutation).

## Frontend Patterns

Routes: folder with `page.tsx` under `src/app`. Default server components; add `"use client"` only when hooks/state used. Use Convex hooks/imports for queries & mutations. Do not reorder provider stack. Theme: dark-only via Tailwind v4 tokens in `src/app/globals.css` (no theme toggling/provider; `:root { color-scheme: dark }`).

## Styling

Tailwind 4 + `cn` util (`src/lib/utils.ts`). Variants via `class-variance-authority` (see `src/components/ui/button.tsx`). Place new primitives in `src/components/ui/`.

## Typical Workflow

Install: `pnpm install`. Dev: run both `pnpm convex:dev` and `pnpm dev`. Build: `pnpm build`. Lint: `pnpm lint`. Format: `pnpm format`. Deploy Convex: `pnpm convex:deploy`.

## Adding a Field / Feature

1. Update `convex/schema.ts` (add field + index if filtering). 2) Run `pnpm convex:dev` (auto upload). 3) Add/extend query or mutation with validators + auth + ownership. 4) Consume via generated API in component. 5) Handle unauthenticated query returning `[]` gracefully.

## Error Handling

Unauthed query: return `[]`. Unauthed mutation: throw `Not authenticated`. Ownership violation: `Forbidden`. Limit hit: `APPLICATION_LIMIT_REACHED` or `RESUME_LIMIT_REACHED` (frontend branches on `error.message`). File validation failure: delete file immediately, throw descriptive error.

## Performance

Never scan unindexed fields. Always create an index before adding a filter pattern. Use `.take(MAX+1)` to enforce caps.

## Out of Scope Now

Testing infra, large state managers—keep stubs lightweight and clearly labeled.

## When Unsure

Imitate closest existing function (e.g., partial updates → `updateApplication`; single field toggle → `toggleFavorite`). Provide focused diffs; keep PR-sized changes.

Return only necessary edits; avoid refactors outside the requested change.
