# Rezumer

Fast, free, open-source job application tracking and single‑page resume generation.

Rezumer aims to give candidates a clean, transparent tool to manage their job search without paywalls or lock‑in.

## Goals

1. Help users systematically track positions, applications, statuses and outcomes.
2. Enable quick generation of a concise single‑page resume.
3. Speed up job search workflows with a focused UI.
4. Remain fully open so anyone can self‑host or extend.

## Feature Status

- [x] Base Next.js App Router foundation
- [x] Authentication (Clerk)
- [x] Data layer on Convex (reactive backend)
- [x] Applications list: sorting, filtering
- [ ] Single‑page resume generator (template + editor)
- [ ] Public shareable resume link
- [ ] Data export (CSV / JSON)
- [ ] Import (LinkedIn / CSV / other) – research
- [ ] Follow‑up reminders / notifications

## Tech Stack

| Layer          | Tech                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| Frontend       | Next.js 15 (App Router), React 19                                           |
| UI             | Tailwind CSS 4, Radix UI primitives, class-variance-authority, lucide-react |
| Theming        | Dark-only via Tailwind CSS v4 tokens (no theme toggle)                      |
| Auth           | Clerk (`@clerk/nextjs`)                                                     |
| Backend (BaaS) | Convex (functions + reactive queries)                                       |
| Language       | TypeScript                                                                  |
| Infra / Deploy | Vercel (or self-host)                                                       |
| Code Quality   | ESLint, Prettier, prettier-plugin-tailwindcss                               |

## Quick Start (Local)

Requirements: Node 18+, PNPM (recommended), Clerk keys (dev or production), Convex CLI.

1. Clone:

```bash
git clone https://github.com/<your-username>/rezumer.git
cd rezumer
```

2. Install deps:

```bash
pnpm install
```

3. Create `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CONVEX_DEPLOYMENT=dev:... # created after starting convex dev
```

4. Start Convex (separate terminal):

```bash
pnpm convex:dev
```

5. Start app:

```bash
pnpm dev
```

6. Open http://localhost:3000

Notes:

- After signing in, authenticated users are redirected to `/applications` (the primary app page).

## Project Structure

```
convex/          # Convex schema & server functions
src/app/         # Next.js routes (App Router)
src/components/  # UI & functional components
src/lib/         # Utilities
public/          # Static assets
```

## Roadmap (High-Level)

- MVP application tracking (CRUD, sorting, filters)
- Kanban / pipeline visualization
- Resume generator (editor + PDF/share link)
- Data export / import
- Follow‑up reminders
- Public API & integrations

## Contributing

Contributions welcome.

1. Open an issue to discuss scope first (optional but helpful)
2. Fork and create a branch: `feat/<topic>`
3. Follow conventional commit style (`feat: ...`, `fix: ...`, `docs: ...`)
4. Run lint & build before PR
5. Submit PR with clear description (motivation + changes)

### Quality Checks

```bash
pnpm lint
pnpm build
```

## Testing

Currently: basic end‑to‑end smoke tests with Playwright (landing page) are set up.

### E2E (Playwright)

First-time setup (installs Playwright browsers):

```bash
pnpm exec playwright install
```

Run locally (auto starts dev server if not already running):

```bash
pnpm test:e2e
```

Key config: `playwright.config.ts`

- `use.baseURL` set to `http://localhost:3000` so tests can `page.goto('/')`.
- `webServer` section:
  - Local: runs `pnpm dev` and `reuseExistingServer: true` (so you can keep a dev server running for faster iterations).
  - CI: runs `pnpm build && pnpm start` with `reuseExistingServer: false` for a production build.
- Artifacts (trace, screenshot, video) retained only on failures in CI.

Add new tests under `e2e/tests/`. Example pattern:

```ts
import { test, expect } from "../fixtures";

test.beforeEach(async ({ page }) => {
  // Go to the starting url before each test.
  await page.goto("/");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/Rezumer/i);
});
```

Future: add component/unit tests (React Testing Library + Vitest or Jest) and extend e2e coverage (auth flows, applications CRUD, dark UI, errors, etc.).

## Privacy

Self‑hosting gives you full data ownership. If a hosted SaaS version appears later, a transparent policy will accompany it.

## License

Planned: permissive OSS license (likely MIT). Until finalized: "All rights reserved" during early stage. Feedback via issues is welcome.

## Acknowledgements

- Next.js & Vercel ecosystem
- Convex for reactive backend simplicity
- Radix UI & Tailwind for rapid UI development

---

If this project helps you, consider starring it and sharing feedback.
