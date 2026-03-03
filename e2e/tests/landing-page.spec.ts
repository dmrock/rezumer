/**
 * Landing page tests — run without authentication (no storageState).
 * Matched by the "setup" Playwright project via the filename pattern.
 */
import { test, expect } from "../fixtures";

test.use({ storageState: { cookies: [], origins: [] } });

test("renders the landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Rezumer/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rezumer");
  await expect(page.getByRole("img", { name: /applications/i })).toBeVisible();
});

test("GitHub CTA points to the repository", async ({ page, landingPage }) => {
  await page.goto("/");
  await expect(landingPage.githubCta).toBeVisible();
  await expect(landingPage.githubCta).toHaveAttribute("href", "https://github.com/dmrock/rezumer");
  await expect(landingPage.githubCta).toHaveAttribute("target", "_blank");
});

test("sign-in CTA navigates to /sign-in", async ({ page, landingPage }) => {
  await page.goto("/");
  await expect(landingPage.signInCta).toBeVisible();
  await landingPage.signInCta.click();
  await expect(page).toHaveURL(/\/sign-in/);
});
