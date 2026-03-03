import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class ResumesPage extends BasePage {
  readonly heading: Locator;
  readonly addResumeBtn: Locator;
  readonly emptyStateText: Locator;
  readonly maxResumesWarning: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Resumes", exact: true });
    this.addResumeBtn = page.getByRole("button", { name: "Add Resume" });
    this.emptyStateText = page.getByText("No resumes yet");
    this.maxResumesWarning = page.getByText(/reached the maximum/i);
  }

  /** Returns the resume card that contains the given title. */
  cardFor(title: string): Locator {
    return this.page.locator(".grid > div").filter({ hasText: title });
  }

  /** Clicks the edit (pencil) button on the card with the given title. */
  async clickEdit(title: string) {
    await this.cardFor(title).getByRole("button", { name: /edit/i }).click();
  }

  /** Clicks the trash button on the card with the given title. */
  async clickDelete(title: string) {
    await this.cardFor(title).getByRole("button", { name: /delete/i }).click();
  }

  /** Confirms the delete dialog. */
  async confirmDelete() {
    await this.page.getByRole("button", { name: "Delete" }).last().click();
  }
}
