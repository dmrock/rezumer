import { test as base, Page } from "@playwright/test";
import { LandingPage } from "../pages/landing.page";

type Fixtures = {
  landingPage: LandingPage;
};

export const test = base.extend<Fixtures>({
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await use(landingPage);
  },
});

export { expect } from "@playwright/test";
