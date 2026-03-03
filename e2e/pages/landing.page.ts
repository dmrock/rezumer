import { BasePage } from "./base.page";

export class LandingPage extends BasePage {
  // The primary CTA in the page body — navigates to /sign-in.
  readonly signInCta = this.page.getByRole("link", { name: "Sign in" });
  // GitHub star CTA in the header.
  readonly githubCta = this.page.getByRole("link", { name: /github/i });

  async goto() {
    await this.page.goto("/");
  }
}
