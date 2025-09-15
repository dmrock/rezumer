import { BasePage } from "./base.page";

export class LandingPage extends BasePage {
  signInBtn = this.page.getByRole("button", { name: "Sign in" });
  signInLink = this.page.getByRole("link", { name: "Sign in" });

  async goto() {
    await this.page.goto("/");
  }
}
