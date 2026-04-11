# Rezumer

> **Archived — no longer maintained.**
> This project was built as a learning exercise to explore modern full-stack technologies. The live site at **rezumer.com has been shut down**, and the repository is preserved here as a portfolio piece.

Free, open-source job application tracking and single-page resume generation.

## Features

- **Application tracker** — CRUD, sorting, filtering, favorites, stage pipeline
- **Resume editor** — form-based editor with drag-and-drop skill ordering
- **PDF export** — generate a clean single-page resume PDF

## Tech stack & what I learned

| Layer    | Tech                                                            | What I explored                                                    |
| -------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5                 | App Router patterns, Server Components, RSC data flow              |
| UI       | Tailwind CSS v4, Radix UI, shadcn/ui                            | Accessible component design, utility-first styling                 |
| Auth     | Clerk 6 (`@clerk/nextjs`)                                       | Third-party auth integration, middleware-based route protection   |
| Backend  | Convex 1                                                        | Reactive BaaS, real-time data sync, schema design                  |
| Testing  | Vitest 4, React Testing Library, Playwright 1                   | Unit and end-to-end testing strategies                             |
| Deploy   | Vercel                                                          | CI/CD pipeline, preview deployments                                |

## Project Structure

```
convex/          # Schema & server functions
src/app/         # Next.js routes (App Router)
src/components/  # UI components
src/lib/         # Utilities, types, constants
```

## Running locally

> **Note:** The hosted backend services (Clerk, Convex) for this project have been deactivated. To run it locally you will need to provision your own Clerk and Convex accounts and supply your own credentials.

Requirements: Node 18+, pnpm, a Clerk account, the Convex CLI.

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

## Testing

Unit tests (Vitest + React Testing Library):

```bash
pnpm test:run
```

E2E tests (Playwright — requires a running dev server and Clerk test credentials):

```bash
pnpm test:e2e
```

## Why archived?

Rezumer served its purpose as a learning exercise — it was a way to get hands-on experience with Next.js App Router, React Server Components, Convex, and Clerk on a real end-to-end product. Since then, the problem space of job tracking and resume generation has become well-covered by general-purpose AI tools, so there is little reason to keep the hosted service running. The repository stays up as a reference and portfolio piece.

## License

[MIT](LICENSE) — free to use, modify, and distribute.
