import { test, expect } from "../fixtures";

test("has title", async ({ page, landingPage }) => {
  await landingPage.goto();
  await expect(page).toHaveTitle(/Rezumer/);
});

test("sign in options", async ({ page, landingPage }) => {
  await landingPage.goto();
  await expect(landingPage.signInBtn).toBeVisible();
  await expect(landingPage.signInLink).toBeVisible();
});
