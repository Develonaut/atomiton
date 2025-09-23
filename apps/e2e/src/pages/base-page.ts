import type { Page, Locator } from "@playwright/test";
import { waitForPageLoad, checkNoErrors } from "#utils/test-helpers";

/**
 * Base page class with common functionality
 */
export class BasePage {
  readonly page: Page;
  readonly navigation: Locator;
  readonly header: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = page.locator('nav, [data-testid="navigation"]').first();
    this.header = page.locator('header, [data-testid="header"]').first();
    this.footer = page.locator('footer, [data-testid="footer"]').first();
  }

  /**
   * Navigate to a specific URL and wait for it to load
   */
  async goto(url: string) {
    await this.page.goto(url);
    await waitForPageLoad(this.page);
    await checkNoErrors(this.page);
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if the page has loaded successfully
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.page.waitForLoadState("domcontentloaded", { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for any loading states to complete
   */
  async waitForNoLoading() {
    const loadingElements = this.page
      .locator('[data-testid="loading"], .loading, .spinner')
      .first();
    await loadingElements
      .waitFor({ state: "hidden", timeout: 10000 })
      .catch(() => {
        // Loading elements might not be present, that's okay
      });
  }
}
