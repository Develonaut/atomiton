import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * My Scenes page object model (Home page with user's blueprints)
 */
export class MyScenesPage extends BasePage {
  readonly createButton: Locator;
  readonly catalogCards: Locator;
  readonly firstCard: Locator;
  readonly pageTitle: Locator;
  readonly filters: Locator;

  constructor(page: Page) {
    super(page);

    // Create button in header
    this.createButton = page.getByRole("link", { name: "Create" });

    // Blueprint cards in catalog
    this.catalogCards = page.locator('a[href^="/editor/"]');
    this.firstCard = this.catalogCards.first();

    // Page elements
    this.pageTitle = page.locator('text="My Scenes"').first();
    this.filters = page.locator('[data-testid="filters"]').first();
  }

  /**
   * Navigate to My Scenes page
   */
  async visit() {
    await this.goto("/");
  }

  /**
   * Click the Create button to create a new blueprint
   */
  async clickCreateButton() {
    await this.createButton.click();
  }

  /**
   * Get the count of blueprint cards displayed
   */
  async getBlueprintCount(): Promise<number> {
    await this.catalogCards
      .first()
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => {});
    return await this.catalogCards.count();
  }

  /**
   * Click on a blueprint card by index
   */
  async clickBlueprintCard(index: number = 0) {
    const card = this.catalogCards.nth(index);
    await card.click();
  }

  /**
   * Get the href of a blueprint card
   */
  async getBlueprintCardHref(index: number = 0): Promise<string | null> {
    const card = this.catalogCards.nth(index);
    return await card.getAttribute("href");
  }

  /**
   * Get blueprint card details
   */
  async getBlueprintCardDetails(index: number = 0) {
    const card = this.catalogCards.nth(index);

    const title = await card.locator(".text-body-md-str").textContent();
    const category = await card.locator(".text-secondary").textContent();
    const image = await card.locator("img").getAttribute("src");

    return {
      title: title?.trim() || "",
      category: category?.trim() || "",
      image: image || "",
    };
  }

  /**
   * Check if the Create button is visible
   */
  async isCreateButtonVisible(): Promise<boolean> {
    try {
      await this.createButton.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if any blueprint cards are displayed
   */
  async hasBlueprintCards(): Promise<boolean> {
    const count = await this.getBlueprintCount();
    return count > 0;
  }

  /**
   * Wait for the page to be ready
   */
  async waitForReady() {
    // Wait for the Layout wrapper and Catalog to be present
    await this.page.waitForSelector(".pl-55.pt-20, .pl-0.pt-20", {
      timeout: 5000,
    });
    // Wait for the catalog title "My Scenes" to be visible
    await this.page.waitForSelector('text="My Scenes"', {
      timeout: 5000,
    });
  }

  /**
   * Filter blueprints by a specific filter option
   */
  async applyFilter(filterName: string) {
    await this.filters.click();
    await this.page.locator(`text="${filterName}"`).click();
  }
}
