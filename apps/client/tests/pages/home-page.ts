import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Home page object model
 */
export class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly ctaButton: Locator;
  readonly featuresSection: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('[data-testid="hero"], .hero').first();
    this.ctaButton = page.locator('[data-testid="cta"], .cta, button').first();
    this.featuresSection = page
      .locator('[data-testid="features"], .features')
      .first();
  }

  /**
   * Navigate to the home page
   */
  async visit() {
    await this.goto("/");
  }

  /**
   * Check if main elements are visible
   */
  async isHomePageLoaded(): Promise<boolean> {
    try {
      await this.page.waitForSelector('main, [data-testid="main-content"]', {
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }
}
