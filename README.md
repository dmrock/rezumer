# Rezumer

Free, open-source job application tracking and single-page resume generation.

Manage your job search without paywalls or lock-in. Self-host or use as-is.

## Features

- **Application tracker** — CRUD, sorting, filtering, favorites, stage pipeline
- **Resume editor** — form-based editor with drag-and-drop skill ordering
- **PDF export** — generate a clean single-page resume PDF

### Planned

- Public shareable resume link
- Data export (CSV / JSON)
- Import (LinkedIn / CSV)
- Follow-up reminders

## Tech Stack

| Layer    | Tech                                                             |
| -------- | ---------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript                    |
| UI       | Tailwind CSS v4, Radix UI, class-variance-authority, lucide-react |
| Auth     | Clerk (`@clerk/nextjs`)                                          |
| Backend  | Convex (reactive BaaS)                                           |
| Deploy   | Vercel (or self-host)                                            |

## Quick Start

Requirements: Node 18+, pnpm, Clerk account, Convex CLI.

```bash
git clone https://github.com/<your-username>/rezumer.git
cd rezumer
pnpm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CONVEX_DEPLOYMENT=dev:...   # created after running convex dev
```

Start Convex (separate terminal):

```bash
pnpm convex:dev
```

Start the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). After sign-in you land on `/applications`.

## Project Structure

```
convex/          # Schema & server functions
src/app/         # Next.js routes (App Router)
src/components/  # UI components
src/lib/         # Utilities, types, constants
```

## Testing

Unit tests (Vitest + React Testing Library):

```bash
pnpm test:run
```

E2E tests (Playwright — requires a running dev server and Clerk test credentials):

```bash
pnpm test:e2e
```

## Contributing

1. Open an issue to discuss scope first (optional but helpful)
2. Fork and branch: `feat/<topic>`
3. Follow conventional commits (`feat:`, `fix:`, `docs:`, …)
4. Run `pnpm lint && pnpm build` before submitting a PR
5. Submit a PR with a clear description

## License

[MIT](LICENSE) — free to use, modify, and distribute.
