# Production build & deploy (Next.js + Vercel + Clerk + Convex)

This guide configures production for this repo. You'll set environment variables, connect Vercel, configure Clerk, and deploy Convex.

## Prereqs

- Vercel account (Owner/Member)
- Clerk account with an application created
- Convex account and CLI installed (`npm i -g convex` or use `npx convex`)
- Node 18+ (Vercel uses 18/20 LTS; this app runs on Next 15 + React 19)

## 1) Environment variables

Copy `.env.example` to `.env.local` and fill values for local dev. The same keys must be added in Vercel → Project → Settings → Environment Variables for Production and Preview.

Required keys:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `CLERK_FRONTEND_API_URL`
- (optional) `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

Notes:

- `NEXT_PUBLIC_CONVEX_URL` is the public URL of your Convex deployment (browser uses it).
- `CLERK_FRONTEND_API_URL` is Clerk issuer domain and is referenced by `convex/auth.config.js`.

Recommended environment mapping:

- Local development (`.env.local`): point `NEXT_PUBLIC_CONVEX_URL` to your Dev Convex deployment (e.g., `https://calm-mandrill-806.convex.cloud`).
- Vercel Production environment: point `NEXT_PUBLIC_CONVEX_URL` to your Prod Convex deployment (e.g., `https://tremendous-gnu-746.convex.cloud`).
- Vercel Preview environment: either reuse the Dev Convex deployment or create a dedicated Staging Convex project for isolation.

Important: `NEXT_PUBLIC_*` variables are inlined at build time in Next.js. After changing them in Vercel, trigger a new deployment.

## 2) Convex: create deployment and get URL

If you haven't created a Convex project yet:

1. Run: `npx convex dev` and follow prompts to create/link a project.
2. Sync schema/functions to your dev deployment: start the dev watcher `pnpm convex:dev` (or `npx convex dev`). It links the project and uploads the schema/functions; you can stop it after the initial sync.
3. Create a production deployment: `npx convex deploy` (first time). This returns a production URL like `https://<slug>-<hash>.convex.cloud`.
4. Set that URL as `NEXT_PUBLIC_CONVEX_URL` in Vercel Production environment (do not overwrite your local `.env.local` Dev URL).

Deploy key (optional CI usage):

- In Convex dashboard → Settings → Deploy key. Save as Vercel secret `CONVEX_DEPLOY_KEY` if you plan to run `npx convex deploy` during builds. For most Vercel flows, you only need the client to point to the already-deployed Convex URL.

## 3) Clerk configuration

From Clerk Dashboard:

- Copy the Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Copy the Secret Key → `CLERK_SECRET_KEY`
- Copy the Frontend API URL → `CLERK_FRONTEND_API_URL` (issuer domain for Convex)
- Add your production domain to Allowed Origins if needed.

Custom domain (recommended):

- Frontend API: create a CNAME `clerk` → `frontend-api.clerk.services` (i.e., `clerk.<your-domain>`)
- Account portal: create a CNAME `accounts` → `accounts.clerk.services` (optional)
- SSL issuance note: if your zone already has restrictive CAA records (e.g., only `0 issue "letsencrypt.org"` on apex), you must also allow Clerk/Cloudflare issuers at the apex of your zone because CNAME names cannot have other records:
  - Add CAA on apex (Name blank): `0 issue "pki.goog"`
  - Optionally also add: `0 issue "digicert.com"`
  - Keep existing `0 issue "letsencrypt.org"` if present
  - Then in Clerk → Custom domain click Verify/Retry and wait (typically 5–30 minutes; in rare cases up to 24–48h) until certificates are issued

Why apex CAA? DNS forbids adding CAA alongside CNAME for the same name (`clerk`). Apex CAA applies to all subdomains unless they set their own CAA, so placing the issuer allowance at apex unblocks certificate issuance for `clerk.<your-domain>`.

JWT template for Convex:

- Convex's Clerk provider expects a Clerk JWT template named `convex`.
- In Clerk Dashboard → JWT Templates → New template:
  - Template name: `convex`
  - Algorithm: RS256
  - Include standard claims (default). No custom claims required.
- The Convex React Clerk provider will request `getToken({ template: 'convex' })` under the hood.

Optional: custom sign-in path

- We use `/sign-in` route. Set these public envs (already in `.env.example`):
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/applications`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/applications`

## 4) Vercel project

1. Push code to GitHub.
2. Import repo in Vercel.
3. Set environment variables for Production and Preview to match `.env.local`.
4. Build settings: default is good for Next.js 15.
   - Build command: `pnpm build` (or `next build`)
   - Install command: `pnpm install --frozen-lockfile`
   - Output: managed by Vercel for Next.js apps

Note on Node version:

- Vercel uses a stable Node LTS. If you need to pin, add an `engines` field in `package.json` (optional).

## 5) Middleware/auth sanity check

This repo already has:

- `src/middleware.ts` using Clerk middleware with public routes for `/` and `/sign-in`. All others require auth.
- `app/layout.tsx` wraps app with `<ClerkProvider>` and Convex provider, consistent with Clerk docs.
- `convex/auth.config.js` points to `CLERK_FRONTEND_API_URL` for issuer domain.

## 6) First deployment

After env vars are set in Vercel:

- Trigger a deployment by pushing to `main`.
- Verify the app builds and renders the landing page `/`.
- Visit `/sign-in` and complete the flow.
- After sign-in you should land on `/applications` (primary app page). Other protected routes require auth.

After verifying Clerk custom domain:

- Update Convex (Production deployment) environment variable `CLERK_FRONTEND_API_URL` to the custom domain, e.g. `https://clerk.<your-domain>`
- Redeploy the frontend on Vercel to pick up any `NEXT_PUBLIC_*` changes

## 7) Troubleshooting

- 401 on Convex calls: Ensure `NEXT_PUBLIC_CONVEX_URL` points to a live Convex deployment. Confirm Clerk session exists and Convex has access to JWT via `ConvexProviderWithClerk`.
- Clerk auth errors: Confirm middleware is active (protected routes redirect), keys are set in Vercel, and your production domain is added in Clerk.
- Next build errors: Check TypeScript and ESLint. You can temporarily pass `--no-lint` to `next build` to isolate issues, but fix lint/type errors for production.

TLS/SSL for Clerk custom domain:

- Symptom: Browser console shows `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` or TLS handshake failures when loading Clerk JS from `https://clerk.<your-domain>/npm/@clerk/clerk-js@5/dist/clerk.browser.js`.
- Cause: Your DNS has an apex CAA that only allows Let’s Encrypt, while Clerk (via Cloudflare) typically issues certs via Google Trust Services (`pki.goog`) and/or DigiCert.
- Fix: Add apex CAA issuers in your DNS (Vercel → rezumer.com → DNS):
  - `CAA 0 issue "pki.goog"`
  - Optionally also `CAA 0 issue "digicert.com"`
  - Keep existing `CAA 0 issue "letsencrypt.org"`
  - Do not attempt to add CAA at the `clerk` name because a CNAME already exists there (DNS forbids mixing).
- Re-verify in Clerk after DNS change. Wait 5–30 minutes (occasionally up to 48h) for issuance.

Quick verification commands:

- HTTP HEAD:
  - `curl -I https://clerk.<your-domain>/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
- Certificate peek via SNI:
  - `echo | openssl s_client -connect clerk.<your-domain>:443 -servername clerk.<your-domain> 2>/dev/null | openssl x509 -noout -issuer -subject -dates`

## 8) Useful commands (local)

- Start app: `pnpm dev`
- Start Convex dev: `pnpm convex:dev`
- Deploy Convex: `pnpm convex:deploy` (or `npx convex deploy`)
- Link Vercel & pull envs: `npx vercel link` then `npx vercel env pull .env.local`

---

If you want, we can run the Vercel linking and env pull steps for you once your Vercel project exists.
