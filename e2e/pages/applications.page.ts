import { type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class ApplicationsPage extends BasePage {
  // ── Header ────────────────────────────────────────────────────────────────
  readonly addApplicationBtn = this.page.getByRole("button", { name: "Add Application" });

  // ── Stats ─────────────────────────────────────────────────────────────────
  readonly allTimeRadio = this.page.getByRole("radio", { name: "All time" });
  readonly thisMonthRadio = this.page.getByRole("radio", { name: "This month" });

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly allFilterRadio = this.page.getByRole("radio", { name: "All", exact: true });
  readonly favoritesFilterRadio = this.page.getByRole("radio", { name: "Favorites" });

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table = this.page.locator("table");
  readonly dateColumnSortBtn = this.page.getByRole("button", { name: /sort by date/i });

  // ── Modal ─────────────────────────────────────────────────────────────────
  readonly modal = this.page.getByRole("dialog");
  readonly companyInput = this.page.getByPlaceholder("Company name");
  readonly jobTitleInput = this.page.getByPlaceholder(/software engineer/i);
  readonly salaryInput = this.page.getByPlaceholder("150000");
  readonly currencySelect = this.page.getByRole("combobox", { name: "Currency" });
  readonly stageSelect = this.modal.locator("select").nth(1);
  readonly dateInput = this.modal.locator('input[type="date"]');
  readonly notesTextarea = this.page.getByPlaceholder("Any context or links");
  readonly addBtn = this.page.getByRole("button", { name: "Add" });
  readonly saveBtn = this.page.getByRole("button", { name: "Save" });
  readonly cancelBtn = this.page.getByRole("button", { name: "Cancel" });

  async openAddModal() {
    await this.addApplicationBtn.click();
    await this.modal.waitFor({ state: "visible" });
  }

  async fillForm({
    company,
    jobTitle,
    salary,
    notes,
    stage,
  }: {
    company: string;
    jobTitle: string;
    salary?: string;
    notes?: string;
    stage?: string;
  }) {
    await this.companyInput.fill(company);
    await this.jobTitleInput.fill(jobTitle);
    if (salary) await this.salaryInput.fill(salary);
    if (notes) await this.notesTextarea.fill(notes);
    if (stage) await this.stageSelect.selectOption(stage);
  }

  async submitAddForm() {
    await this.addBtn.click();
    await this.modal.waitFor({ state: "hidden" });
  }

  async submitEditForm() {
    await this.saveBtn.click();
    await this.modal.waitFor({ state: "hidden" });
  }

  /** Returns the table row that contains `company` text. */
  rowFor(company: string): Locator {
    return this.page.locator("tr").filter({ hasText: company });
  }

  /** Clicks the favourite star for the row matching `company`. */
  async toggleFavorite(company: string) {
    await this.rowFor(company)
      .getByRole("button", { name: /favorite/i })
      .click();
  }

  /** Clicks the edit (pencil) button for the row matching `company`. */
  async clickEdit(company: string) {
    await this.rowFor(company).getByRole("button", { name: "Edit" }).click();
    await this.modal.waitFor({ state: "visible" });
  }

  /** Clicks the delete (trash) button for the row matching `company`. */
  async clickDelete(company: string) {
    await this.rowFor(company).getByRole("button", { name: "Delete" }).click();
  }

  /** Confirms the delete dialog. */
  async confirmDelete() {
    await this.page.getByRole("button", { name: "Delete" }).last().click();
  }
}
