import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Sign-in page object model
 */
export class SignInPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly createAccountLink: Locator;
  readonly resetPasswordLink: Locator;
  readonly formContainer: Locator;

  constructor(page: Page) {
    super(page);
    // The Login component doesn't use a form element, just input fields
    this.formContainer = page.locator('text="Sign in to Brainwave"').first();
    this.emailInput = page.locator('input[type="email"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.signInButton = page.locator('a:has-text("Sign in")').first();
    this.createAccountLink = page.locator('a[href="/create-account"]').first();
    this.resetPasswordLink = page
      .locator('a[href="/reset-password"], text="Forgot Password?"')
      .first();
  }

  /**
   * Navigate to the sign-in page
   */
  async visit() {
    await this.goto("/sign-in");
  }

  /**
   * Check if sign-in form is visible
   */
  async isSignInFormVisible(): Promise<boolean> {
    try {
      await this.formContainer.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fill in the sign-in form (for testing form presence, not actual auth)
   */
  async fillForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }
}
