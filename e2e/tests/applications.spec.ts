/**
 * Applications page — authenticated e2e tests.
 *
 * Each test that mutates data creates uniquely prefixed entries (E2E_…).
 * afterEach deletes all E2E_-prefixed applications so cleanup runs even when
 * a test fails mid-way.
 */
import { test, expect, api } from "../fixtures";

/** Prefix scoped to the Playwright worker so parallel workers don't clean up each other's data. */
function uid() {
  return `E2E_w${test.info().workerIndex}_${Date.now()}`;
}

test.afterEach(async ({ convex }, testInfo) => {
  const prefix = `E2E_w${testInfo.workerIndex}_`;
  const apps = await convex.query(api.applications.listApplications, {});
  for (const app of apps) {
    if ((app.company as string).startsWith(prefix)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await convex.mutation(api.applications.deleteApplication, { id: app._id as any });
    }
  }
});

test("renders the applications page", async ({ applicationsPage }) => {
  const { page } = applicationsPage;
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();
  await expect(applicationsPage.addApplicationBtn).toBeVisible();
  await expect(page.getByText("Total")).toBeVisible();
  await expect(page.getByText("HR Call")).toBeVisible();
  await expect(page.getByText("Interview")).toBeVisible();
  await expect(page.getByText("Offer")).toBeVisible();
  await expect(applicationsPage.allFilterRadio).toBeVisible();
  await expect(applicationsPage.favoritesFilterRadio).toBeVisible();
  await expect(applicationsPage.allTimeRadio).toBeVisible();
  await expect(applicationsPage.thisMonthRadio).toBeVisible();
});

test("add application modal — cancel and submit with all fields", async ({ applicationsPage }) => {
  const company = `${uid()}_Google`;

  // Open and cancel — modal closes.
  await applicationsPage.openAddModal();
  await expect(applicationsPage.modal).toBeVisible();
  await applicationsPage.cancelBtn.click();
  await expect(applicationsPage.modal).not.toBeVisible();

  // Reopen and submit with all optional fields.
  await applicationsPage.openAddModal();
  await applicationsPage.fillForm({
    company,
    jobTitle: "Software Engineer",
    salary: "150000",
    notes: "Applied via LinkedIn referral",
  });
  await applicationsPage.submitAddForm();

  const row = applicationsPage.rowFor(company);
  await expect(row).toBeVisible();
  await expect(row).toContainText("150,000");
  await expect(row).toContainText("Applied via LinkedIn referral");
});

test("rejects invalid salary in the add modal", async ({ applicationsPage }) => {
  await applicationsPage.openAddModal();
  await applicationsPage.fillForm({ company: "TestCo", jobTitle: "Engineer", salary: "-500" });
  await applicationsPage.addBtn.click();
  // Browser min=0 constraint prevents submit — modal stays open.
  await expect(applicationsPage.modal).toBeVisible();
});

test("edits an existing application", async ({ applicationsPage }) => {
  const company = `${uid()}_Meta`;
  const updatedTitle = "Senior Software Engineer";

  await applicationsPage.openAddModal();
  await applicationsPage.fillForm({ company, jobTitle: "Software Engineer" });
  await applicationsPage.submitAddForm();

  await applicationsPage.clickEdit(company);
  await expect(
    applicationsPage.page.getByRole("heading", { name: "Edit application" }),
  ).toBeVisible();
  await applicationsPage.jobTitleInput.clear();
  await applicationsPage.jobTitleInput.fill(updatedTitle);
  await applicationsPage.submitEditForm();

  await expect(applicationsPage.rowFor(company)).toContainText(updatedTitle);
});

test("deletes an application — cancel keeps row, confirm removes it", async ({
  applicationsPage,
}) => {
  const company = `${uid()}_Dropbox`;

  await applicationsPage.openAddModal();
  await applicationsPage.fillForm({ company, jobTitle: "Engineer" });
  await applicationsPage.submitAddForm();
  await expect(applicationsPage.rowFor(company)).toBeVisible();

  // Cancel — row still there.
  await applicationsPage.clickDelete(company);
  await applicationsPage.page.getByRole("button", { name: "Cancel" }).last().click();
  await expect(applicationsPage.rowFor(company)).toBeVisible();

  // Confirm — row gone.
  await applicationsPage.clickDelete(company);
  await expect(applicationsPage.page.getByRole("dialog")).toBeVisible();
  await applicationsPage.confirmDelete();
  await expect(applicationsPage.rowFor(company)).not.toBeVisible();
});

test("toggles favorite on and off", async ({ applicationsPage }) => {
  const company = `${uid()}_Uber`;

  await applicationsPage.openAddModal();
  await applicationsPage.fillForm({ company, jobTitle: "Engineer" });
  await applicationsPage.submitAddForm();

  const row = applicationsPage.rowFor(company);
  await row.getByRole("button", { name: "Favorite" }).click();
  await expect(row.getByRole("button", { name: "Unfavorite" })).toBeVisible();

  await row.getByRole("button", { name: "Unfavorite" }).click();
  await expect(row.getByRole("button", { name: "Favorite" })).toBeVisible();
});

test("Favorites filter only shows starred applications", async ({ applicationsPage }) => {
  const starred = `${uid()}_FavCo`;
  const plain = `${uid()}_PlainCo`;

  await applicationsPage.openAddModal();
  await applicationsPage.fillForm({ company: starred, jobTitle: "Engineer" });
  await applicationsPage.submitAddForm();

  await applicationsPage.openAddModal();
  await applicationsPage.fillForm({ company: plain, jobTitle: "Engineer" });
  await applicationsPage.submitAddForm();

  await applicationsPage.toggleFavorite(starred);
  await expect(
    applicationsPage.rowFor(starred).getByRole("button", { name: "Unfavorite" }),
  ).toBeVisible();

  await applicationsPage.favoritesFilterRadio.click();
  await expect(applicationsPage.rowFor(starred)).toBeVisible();
  await expect(applicationsPage.rowFor(plain)).not.toBeVisible();

  await applicationsPage.allFilterRadio.click();
});

test("date sort toggles direction and month filter updates URL", async ({ applicationsPage }) => {
  const { page } = applicationsPage;

  const sortBtn = applicationsPage.dateColumnSortBtn;
  await expect(sortBtn).toBeVisible();
  const labelBefore = await sortBtn.getAttribute("aria-label");
  await sortBtn.click();
  const labelAfter = await sortBtn.getAttribute("aria-label");
  expect(labelBefore).not.toEqual(labelAfter);

  await applicationsPage.thisMonthRadio.click();
  await expect(page).toHaveURL(/month=1/);
  await applicationsPage.allTimeRadio.click();
  await expect(page).not.toHaveURL(/month=1/);
});

test("authenticated user visiting / is redirected to /applications", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/applications/, { timeout: 10_000 });
});
