/**
 * Resumes page — authenticated e2e tests.
 *
 * PDF generation is skipped where possible because jsPDF runs in the browser
 * and Convex storage uploads add meaningful latency.  Create-resume tests
 * therefore verify form UX (navigation, validation, field rendering) rather
 * than the full submit flow.  Delete and list tests run against real data.
 *
 * global-setup wipes ALL data for the test account before any worker starts,
 * ensuring the test account never hits resource limits.
 * afterEach deletes E2E_-prefixed resumes so cleanup runs even when a test
 * fails mid-way.
 */
import { test, expect, api } from "../fixtures";

/** With fullyParallel: false each spec file runs on its own worker, so workerIndex scopes cleanup correctly. */
function uid() {
  return `E2E_w${test.info().workerIndex}_${Date.now()}`;
}

test.afterEach(async ({ convex }, testInfo) => {
  const prefix = `E2E_w${testInfo.workerIndex}_`;
  const resumes = await convex.query(api.resumes.listResumes, {});
  for (const resume of resumes) {
    if ((resume.title as string).startsWith(prefix)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await convex.mutation(api.resumes.deleteResume, { resumeId: resume._id as any });
    }
  }
});

test("renders the resumes page", async ({ resumesPage }) => {
  await expect(resumesPage.heading).toBeVisible();
  await expect(resumesPage.addResumeBtn).toBeVisible();
  await resumesPage.addResumeBtn.click();
  await expect(resumesPage.page).toHaveURL(/\/resumes\/new/);
});

test("new resume form — renders all sections, validates required title, and navigates back", async ({
  page,
}) => {
  await page.goto("/resumes/new");
  // Wait for the isLoading hydration spinner to clear before asserting form elements.
  await expect(page.getByRole("heading", { name: "Create New Resume" })).toBeVisible();

  await expect(page.getByPlaceholder(/senior developer resume/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /personal info/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /experience/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /education/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /skills/i })).toBeVisible();

  // Submit without a title — required attribute keeps us on the page.
  await page.getByRole("button", { name: "Create Resume" }).click();
  await expect(page).toHaveURL(/\/resumes\/new/);

  // Back button navigates to the resumes list.
  await page.getByRole("button", { name: /back to resumes/i }).click();
  await expect(page).toHaveURL(/\/resumes$/);
});

test("can add and remove experience, education, and skill entries", async ({ page }) => {
  await page.goto("/resumes/new");
  // Wait for the isLoading hydration spinner to clear.
  await expect(page.getByRole("heading", { name: "Create New Resume" })).toBeVisible();

  // Experience: use CSS :has(> child) to target the flex row that directly contains
  // the section heading — avoids traversing up the tree.
  // Remove buttons are icon-only; scoped the same way via the entry label's flex row.
  await page.locator('div:has(> h3:text("Work Experience"))').getByRole("button", { name: "Add" }).click();
  const jobTitleFields = page.locator('[placeholder="Job Title"]');
  await expect(jobTitleFields).toHaveCount(2);
  await page.locator('div:has(> span:text("Experience 2"))').getByRole("button").click();
  await expect(jobTitleFields).toHaveCount(1);

  // Education: same pattern.
  await page.locator('div:has(> h3:text("Education"))').getByRole("button", { name: "Add" }).click();
  const degreeFields = page.locator('[placeholder*="Degree"]');
  await expect(degreeFields).toHaveCount(2);
  await page.locator('div:has(> span:text("Education 2"))').getByRole("button").click();
  await expect(degreeFields).toHaveCount(1);

  // Skills: input accepts text.
  const skillInput = page.locator('input[placeholder*="kill"]').first();
  if (await skillInput.isVisible()) {
    await skillInput.fill("TypeScript");
    await expect(skillInput).toHaveValue("TypeScript");
  }
});

test("deletes a resume — cancel keeps card, confirm removes it", async ({
  resumesPage,
  convex,
}) => {
  const title = `${uid()}_TestResume`;

  await convex.mutation(api.resumes.createResume, {
    title,
    designTemplate: "modern",
    fields: {
      fullName: "Test User",
      email: "test@example.com",
      phone: "",
      experience: [],
      education: [],
      skills: [],
    },
  });

  await resumesPage.page.reload();
  await resumesPage.page.waitForSelector(`text=${title}`, { timeout: 10_000 });

  // Cancel — card still visible.
  await resumesPage.clickDelete(title);
  await expect(resumesPage.page.getByRole("dialog")).toBeVisible();
  await resumesPage.page.getByRole("button", { name: "Cancel" }).last().click();
  await expect(resumesPage.page.locator(`text=${title}`)).toBeVisible();

  // Confirm — card gone.
  await resumesPage.clickDelete(title);
  await resumesPage.confirmDelete();
  await expect(resumesPage.page.locator(`text=${title}`)).not.toBeVisible({ timeout: 10_000 });
});

test("edit button on resume card navigates to the edit page", async ({ resumesPage, convex }) => {
  const title = `${uid()}_EditNav`;

  const resumeId = await convex.mutation(api.resumes.createResume, {
    title,
    designTemplate: "modern",
    fields: {
      fullName: "Edit Nav User",
      email: "editnav@example.com",
      phone: "",
      experience: [],
      education: [],
      skills: [],
    },
  });

  await resumesPage.page.reload();
  await resumesPage.page.waitForSelector(`text=${title}`, { timeout: 10_000 });

  await resumesPage.clickEdit(title);
  await expect(resumesPage.page).toHaveURL(new RegExp(`/resumes/${String(resumeId)}/edit`));
});
