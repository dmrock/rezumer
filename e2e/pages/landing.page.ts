import { BasePage } from "./base.page";

export class LandingPage extends BasePage {
  readonly signInBtn = this.page.getByRole("button", { name: "Sign in" });
  readonly signInLink = this.page.getByRole("link", { name: "Sign in" });

  async goto() {
    await this.page.goto("/");
  }
}
