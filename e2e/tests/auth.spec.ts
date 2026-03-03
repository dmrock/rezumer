/**
 * Auth-guard tests — verify that protected routes redirect unauthenticated
 * visitors to /sign-in.  Run without storageState (no logged-in user).
 */
import { test, expect } from "../fixtures";

test.use({ storageState: { cookies: [], origins: [] } });

const PROTECTED_ROUTES = ["/applications", "/resumes", "/resumes/new"];

for (const route of PROTECTED_ROUTES) {
  test(`unauthenticated visit to ${route} redirects to /sign-in`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });
  });
}
