import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Profile page object model
 */
export class ProfilePage extends BasePage {
  readonly profileContainer: Locator;
  readonly userInfo: Locator;
  readonly settingsButton: Locator;
  readonly creationsGrid: Locator;
  readonly likesSection: Locator;

  constructor(page: Page) {
    super(page);
    this.profileContainer = page
      .locator('[data-testid="profile"], .profile-page, main')
      .first();
    this.userInfo = page
      .locator('[data-testid="user-info"], .user-info')
      .first();
    this.settingsButton = page
      .locator('[data-testid="settings"], button:has-text("Settings")')
      .first();
    this.creationsGrid = page
      .locator('[data-testid="creations"], .creations, .grid')
      .first();
    this.likesSection = page
      .locator('[data-testid="likes"], .likes-section')
      .first();
  }

  /**
   * Navigate to the profile page
   */
  async visit() {
    await this.goto("/profile");
  }

  /**
   * Check if profile page is loaded
   */
  async isProfileLoaded(): Promise<boolean> {
    try {
      await this.profileContainer.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user content sections are present
   */
  async hasUserContent(): Promise<boolean> {
    try {
      const hasCreations = await this.creationsGrid
        .isVisible()
        .catch(() => false);
      const hasLikes = await this.likesSection.isVisible().catch(() => false);
      return hasCreations || hasLikes;
    } catch {
      return false;
    }
  }
}
