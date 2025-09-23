import type { Page, Locator } from "@playwright/test";
import { BasePage } from "#pages/base-page";
import { waitFor3DContent } from "#utils/test-helpers";

/**
 * Create page object model
 */
export class CreatePage extends BasePage {
  readonly canvas: Locator;
  readonly toolsPanel: Locator;
  readonly saveButton: Locator;
  readonly previewButton: Locator;
  readonly createContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.createContainer = page
      .locator('[data-testid="create-container"], .create-page, main')
      .first();
    this.canvas = page.locator("canvas").first();
    this.toolsPanel = page
      .locator('[data-testid="tools"], .tools, .sidebar')
      .first();
    this.saveButton = page
      .locator('[data-testid="save"], button:has-text("Save")')
      .first();
    this.previewButton = page
      .locator('[data-testid="preview"], button:has-text("Preview")')
      .first();
  }

  /**
   * Navigate to the create page
   */
  async visit() {
    await this.goto("/create");
    await waitFor3DContent(this.page);
  }

  /**
   * Check if create interface is loaded
   */
  async isCreateInterfaceLoaded(): Promise<boolean> {
    try {
      await this.createContainer.waitFor({ state: "visible", timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for 3D content to be ready
   */
  async waitFor3DReady() {
    await waitFor3DContent(this.page);

    // Additional check for WebGL context if canvas is present
    if (await this.canvas.isVisible()) {
      await this.page
        .evaluate(() => {
          const canvas = document.querySelector("canvas") as HTMLCanvasElement;
          if (canvas) {
            const gl =
              canvas.getContext("webgl") ||
              (canvas.getContext(
                "experimental-webgl",
              ) as WebGLRenderingContext | null);
            return new Promise<void>((resolve) => {
              if (gl) {
                const checkGL = () => {
                  if (gl.getError() === gl.NO_ERROR) {
                    resolve();
                  } else {
                    setTimeout(checkGL, 100);
                  }
                };
                checkGL();
              } else {
                resolve();
              }
            });
          }
        })
        .catch(() => {
          // WebGL might not be available in test environment, that's okay
        });
    }
  }
}
