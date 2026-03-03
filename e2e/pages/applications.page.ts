import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class ApplicationsPage extends BasePage {
  // ── Header ────────────────────────────────────────────────────────────────
  readonly addApplicationBtn: Locator;

  // ── Stats ─────────────────────────────────────────────────────────────────
  readonly allTimeRadio: Locator;
  readonly thisMonthRadio: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly allFilterRadio: Locator;
  readonly favoritesFilterRadio: Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table: Locator;
  readonly dateColumnSortBtn: Locator;

  // ── Modal ─────────────────────────────────────────────────────────────────
  readonly modal: Locator;
  readonly companyInput: Locator;
  readonly jobTitleInput: Locator;
  readonly salaryInput: Locator;
  readonly currencySelect: Locator;
  readonly stageSelect: Locator;
  readonly dateInput: Locator;
  readonly notesTextarea: Locator;
  readonly addBtn: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.addApplicationBtn = page.getByRole("button", { name: "Add Application" });

    this.allTimeRadio = page.getByRole("radio", { name: "All time" });
    this.thisMonthRadio = page.getByRole("radio", { name: "This month" });
    this.allFilterRadio = page.getByRole("radio", { name: "All", exact: true });
    this.favoritesFilterRadio = page.getByRole("radio", { name: "Favorites" });

    this.table = page.locator("table");
    this.dateColumnSortBtn = page.getByRole("button", {
      name: /sort by date/i,
    });

    this.modal = page.getByRole("dialog");
    this.companyInput = page.getByPlaceholder("Company name");
    this.jobTitleInput = page.getByPlaceholder(/software engineer/i);
    this.salaryInput = page.getByPlaceholder("150000");
    this.currencySelect = page.getByRole("combobox", { name: "Currency" });
    this.stageSelect = this.modal.locator("select").nth(1);
    this.dateInput = this.modal.locator('input[type="date"]');
    this.notesTextarea = page.getByPlaceholder("Any context or links");
    this.addBtn = page.getByRole("button", { name: "Add" });
    this.saveBtn = page.getByRole("button", { name: "Save" });
    this.cancelBtn = page.getByRole("button", { name: "Cancel" });
  }

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
    await this.rowFor(company).getByRole("button", { name: /favorite/i }).click();
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
