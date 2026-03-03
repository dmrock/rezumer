/**
 * Playwright test fixtures.
 *
 * convex   – a ConvexHttpClient authenticated with the signed-in user's JWT,
 *            obtained from the browser after Clerk initialises.  Use it to
 *            seed or clean up test data directly via the Convex API without
 *            going through the UI.
 *
 * All page-object fixtures (applicationsPage, resumesPage, …) extend convex
 * so the Convex client is always available alongside the POM helper.
 */
import { test as base } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { LandingPage } from "../pages/landing.page";
import { ApplicationsPage } from "../pages/applications.page";
import { ResumesPage } from "../pages/resumes.page";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://localhost:3210";

/** Retrieve the Convex JWT from the Clerk session already loaded in the page. */
async function getConvexToken(page: import("@playwright/test").Page): Promise<string | null> {
  return page.evaluate(async () => {
    // window.Clerk is available after the @clerk/nextjs provider initialises.
    // Poll for up to ~5 s in case hydration is still in progress.
    for (let i = 0; i < 50; i++) {
      type ClerkWindow = {
        Clerk?: {
          session?: { getToken: (o: { template: string }) => Promise<string | null> };
        };
      };
      const session = (window as ClerkWindow).Clerk?.session;
      if (session) {
        return session.getToken({ template: "convex" });
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    return null;
  });
}

type Fixtures = {
  /** Authenticated Convex HTTP client for direct API calls in tests. */
  convex: ConvexHttpClient;
  landingPage: LandingPage;
  applicationsPage: ApplicationsPage;
  resumesPage: ResumesPage;
};

export const test = base.extend<Fixtures>({
  // ── Convex client ─────────────────────────────────────────────────────────
  convex: async ({ page }, use) => {
    // Navigate to the app so Clerk initialises and issues a JWT.
    await page.goto("/applications");
    await page.waitForLoadState("networkidle");

    const token = await getConvexToken(page);
    const client = new ConvexHttpClient(CONVEX_URL);
    if (token) client.setAuth(token);

    await use(client);
  },

  // ── Page-object fixtures ───────────────────────────────────────────────────
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  applicationsPage: async ({ page, convex: _ }, use) => {
    await page.goto("/applications");
    // Wait for the table to appear (skeleton resolves once Convex query returns).
    await page.waitForSelector("table", { timeout: 15_000 });
    await use(new ApplicationsPage(page));
  },

  resumesPage: async ({ page, convex: _ }, use) => {
    await page.goto("/resumes");
    // Page is ready when either the grid or the empty-state banner is visible.
    await page
      .locator("text=No resumes yet, text=Add Resume, .grid")
      .first()
      .waitFor({ timeout: 15_000 })
      .catch(() => {});
    await use(new ResumesPage(page));
  },
});

export { expect } from "@playwright/test";
export { api };
