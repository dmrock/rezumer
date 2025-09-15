import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://rezumer.com/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Rezumer/);
});

test.skip("sign in link", async ({ page }) => {
  await page.goto("https://rezumer.com/");

  // Click the sign in link.
  await page.getByRole("link", { name: "Sign in" }).click();

  // Expects page to have a heading with the name of Continue to rezumer.
  await expect(page.getByRole("heading", { name: "Continue to rezumer" })).toBeVisible();
});
