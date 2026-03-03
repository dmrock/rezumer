/**
 * Playwright global setup.
 *
 * Signs in the e2e test user WITHOUT any UI interaction — no OAuth redirect,
 * no email/password form — by:
 *   1. Creating a short-lived sign-in token via the Clerk REST API.
 *   2. Injecting it into the browser via window.Clerk (ticket strategy).
 *   3. Saving the resulting browser storage state for all tests to reuse.
 *
 * Required env vars (add to .env.local or CI secrets):
 *   CLERK_SECRET_KEY    – already present for the app
 *   E2E_CLERK_USER_ID   – Clerk User ID of your test account, e.g. user_2abc…
 *                         Find it in Clerk Dashboard → Users → click the user
 */
import { clerkSetup } from "@clerk/testing/playwright";
import { chromium, type FullConfig } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import path from "path";
import { api } from "../convex/_generated/api";

export const STORAGE_STATE = path.join(__dirname, ".auth/user.json");

export default async function globalSetup(config: FullConfig) {
  await clerkSetup();

  const userId = process.env.E2E_CLERK_USER_ID;
  if (!userId) throw new Error("E2E_CLERK_USER_ID env var is required for e2e tests.");

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("CLERK_SECRET_KEY env var is required for e2e tests.");

  // Create a sign-in token for the test user via the Clerk REST API.
  // This works regardless of which auth methods (Google, GitHub, etc.) are
  // enabled — it bypasses the sign-in UI entirely.
  const res = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 3600 }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create Clerk sign-in token: ${await res.text()}`);
  }

  const { token } = (await res.json()) as { token: string };

  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the landing page so Clerk's JS SDK initialises in the browser.
  await page.goto(baseURL!);
  await page.waitForLoadState("networkidle");

  // Authenticate via the ticket strategy — sets the session cookie directly.
  await page.evaluate(async (ticket: string) => {
    type ClerkWindow = {
      Clerk?: {
        loaded: boolean;
        client: {
          signIn: {
            create: (p: {
              strategy: string;
              ticket: string;
            }) => Promise<{ createdSessionId: string }>;
          };
        };
        setActive: (p: { session: string }) => Promise<void>;
      };
    };

    const w = window as ClerkWindow;
    for (let i = 0; i < 100; i++) {
      if (w.Clerk?.loaded) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    const signIn = await w.Clerk!.client.signIn.create({ strategy: "ticket", ticket });
    await w.Clerk!.setActive({ session: signIn.createdSessionId });
  }, token);

  // After setActive, Clerk sets the session cookie. Navigate to confirm auth.
  await page.goto(`${baseURL}/applications`);
  await page.waitForURL("**/applications", { timeout: 15_000 });

  await page.context().storageState({ path: STORAGE_STATE });

  // Wipe ALL data for the dedicated test account so resource limits are never
  // hit.  E2E_CLERK_USER_ID must be a throwaway test user — not a personal
  // account.  Runs once here (before any worker starts) so there are no
  // parallel-safety concerns.
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (convexUrl) {
    const convexToken = await page.evaluate(async () => {
      type ClerkWindow = {
        Clerk?: { session?: { getToken: (o: { template: string }) => Promise<string | null> } };
      };
      for (let i = 0; i < 50; i++) {
        const session = (window as ClerkWindow).Clerk?.session;
        if (session) return session.getToken({ template: "convex" });
        await new Promise((r) => setTimeout(r, 100));
      }
      return null;
    });

    if (!convexToken)
      throw new Error(
        "global-setup: could not retrieve Convex token — cleanup skipped and tests will likely fail",
      );

    if (convexToken) {
      const convex = new ConvexHttpClient(convexUrl);
      convex.setAuth(convexToken);

      const [apps, resumes] = await Promise.all([
        convex.query(api.applications.listApplications, {}),
        convex.query(api.resumes.listResumes, {}),
      ]);

      await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...apps.map((a: any) => convex.mutation(api.applications.deleteApplication, { id: a._id })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...resumes.map((r: any) => convex.mutation(api.resumes.deleteResume, { resumeId: r._id })),
      ]);
    }
  }

  await browser.close();
}
