import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

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
    this.formContainer = page.locator('form, [data-testid="signin-form"]').first();
    this.emailInput = page.locator('input[type="email"], input[name="email"], #email').first();
    this.passwordInput = page.locator('input[type="password"], input[name="password"], #password').first();
    this.signInButton = page.locator('button[type="submit"], [data-testid="signin-button"]').first();
    this.createAccountLink = page.locator('a[href*="create-account"], text="Create Account"').first();
    this.resetPasswordLink = page.locator('a[href*="reset-password"], text="Reset Password"').first();
  }

  /**
   * Navigate to the sign-in page
   */
  async visit() {
    await this.goto('/sign-in');
  }

  /**
   * Check if sign-in form is visible
   */
  async isSignInFormVisible(): Promise<boolean> {
    try {
      await this.formContainer.waitFor({ state: 'visible', timeout: 5000 });
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