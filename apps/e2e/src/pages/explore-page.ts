import type { Page, Locator } from "@playwright/test";
import { BasePage } from "#pages/base-page";

/**
 * Explore page object model (Gallery of blueprint templates)
 */
export class ExplorePage extends BasePage {
  readonly galleryItems: Locator;
  readonly firstItem: Locator;
  readonly createButton: Locator;
  readonly filters: Locator;
  readonly projects: Locator;

  constructor(page: Page) {
    super(page);

    // Gallery items (template blueprints)
    this.galleryItems = page.locator('a[href="/explore/details"]');
    this.firstItem = this.galleryItems.first();

    // Create button (should not be visible on explore page)
    this.createButton = page.getByRole("link", { name: "Create" });

    // Page elements
    this.filters = page.locator('[data-testid="filters"]').first();
    this.projects = page.locator('[data-testid="projects"]').first();
  }

  /**
   * Navigate to Explore page
   */
  async visit() {
    await this.goto("/explore");
  }

  /**
   * Get the count of gallery items displayed
   */
  async getGalleryItemCount(): Promise<number> {
    await this.galleryItems
      .first()
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => {});
    return await this.galleryItems.count();
  }

  /**
   * Click on a gallery item by index
   */
  async clickGalleryItem(index: number = 0) {
    const item = this.galleryItems.nth(index);
    await item.click();
  }

  /**
   * Get gallery item details
   */
  async getGalleryItemDetails(index: number = 0) {
    const item = this.galleryItems.nth(index);
    const parent = item.locator("..");

    const title = await parent.locator(".text-shade-01").textContent();
    const image = await item.locator("img").getAttribute("src");

    return {
      title: title?.trim() || "",
      image: image || "",
    };
  }

  /**
   * Check if the Create button is visible (it should not be on explore page)
   */
  async isCreateButtonVisible(): Promise<boolean> {
    try {
      await this.createButton.waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Hover over a gallery item to reveal actions
   */
  async hoverOverItem(index: number = 0) {
    const item = this.galleryItems.nth(index);
    await item.hover();
  }

  /**
   * Click an action button on a hovered item
   */
  async clickItemAction(itemIndex: number, action: "edit" | "remix" | "like") {
    await this.hoverOverItem(itemIndex);

    const actionTooltips = {
      edit: "Edit",
      remix: "Remix",
      like: "Like",
    };

    const actionButton = this.page
      .locator(`button[data-tooltip-content="${actionTooltips[action]}"]`)
      .first();
    await actionButton.click();
  }

  /**
   * Wait for the page to be ready
   */
  async waitForReady() {
    // Wait for the Layout wrapper to be present
    await this.page.waitForSelector(".pl-55.pt-20, .pl-0.pt-20", {
      timeout: 5000,
    });
    // Wait for gallery items or projects to be present
    await this.page
      .waitForSelector('a[href="/explore/details"], [data-testid="projects"]', {
        timeout: 5000,
      })
      .catch(() => {});
  }

  /**
   * Check if any gallery items are displayed
   */
  async hasGalleryItems(): Promise<boolean> {
    const count = await this.getGalleryItemCount();
    return count > 0;
  }
}
