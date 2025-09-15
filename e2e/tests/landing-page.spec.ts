import { test, expect } from "../fixtures";

test.beforeEach(async ({ page }) => {
  // Go to the starting url before each test.
  await page.goto("/");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/Rezumer/i);
});

test("sign in options", async ({ landingPage }) => {
  await expect(landingPage.signInBtn).toBeVisible();
  await expect(landingPage.signInLink).toBeVisible();
});
