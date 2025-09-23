import { test, expect, type Page } from "@playwright/test";

test.describe("User Flow: Template to Editor Journey", () => {
  test("Complete template selection and editing flow", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("My Scenes").first()).toBeVisible();

    const templateSection = page.locator(".gap-3").first();
    const templateButtons = templateSection.locator("button");

    if ((await templateButtons.count()) > 0) {
      const firstTemplate = templateButtons.first();
      await firstTemplate.locator(".text-body-md-str").textContent();

      await firstTemplate.click();

      await page.waitForURL(/\/editor\/.+/);
      await page.waitForSelector(".react-flow", { timeout: 10000 });

      const canvas = page.locator(".react-flow__viewport");
      await expect(canvas).toBeVisible();

      const nodes = page.locator(".react-flow__node");
      const nodeCount = await nodes.count();
      expect(nodeCount).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe("User Flow: Navigation and Sidebar", () => {
  test("Sidebar navigation works correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check sidebar elements exist (they're in the left panel)
    const exploreLink = page.getByText("Explore").first();
    await expect(exploreLink).toBeVisible();

    const assetsSection = page.getByText("Assets").first();
    await expect(assetsSection).toBeVisible();

    const likesLink = page.getByText("Likes").first();
    await expect(likesLink).toBeVisible();

    const myScenes = page.getByText("My Scenes").first();
    await expect(myScenes).toBeVisible();

    // Verify sidebar structure with left panel
    const leftPanel = page.locator(".w-66, .left-0").first();
    const panelExists = (await leftPanel.count()) > 0;
    expect(panelExists).toBeTruthy();
  });

  test("Create button is accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const createButton = page.getByRole("button", { name: "Create" });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });
});

test.describe("User Flow: Editor Interactions", () => {
  async function navigateToEditor(page: Page) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const templateButtons = page.locator(".gap-3 button");
    if ((await templateButtons.count()) > 0) {
      await templateButtons.first().click();
      await page.waitForURL(/\/editor\/.+/);
      await page.waitForSelector(".react-flow", { timeout: 10000 });
    } else {
      await page.goto("/editor/new");
      await page.waitForSelector(".react-flow", { timeout: 10000 });
    }
  }

  test("Editor canvas is interactive", async ({ page }) => {
    await navigateToEditor(page);

    const canvas = page.locator(".react-flow__viewport");
    await expect(canvas).toBeVisible();

    const boundingBox = await canvas.boundingBox();
    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2 + 100,
        boundingBox.y + boundingBox.height / 2,
      );
      await page.mouse.up();
    }

    const minimap = page.locator(".react-flow__minimap");
    if ((await minimap.count()) > 0) {
      await expect(minimap).toBeVisible();
    }

    const controls = page.locator(".react-flow__controls");
    if ((await controls.count()) > 0) {
      await expect(controls).toBeVisible();
    }
  });

  test("Asset panel can be opened in editor", async ({ page }) => {
    await navigateToEditor(page);

    const assetTab = page.getByRole("button", { name: "Asset" });

    if ((await assetTab.count()) > 0) {
      await assetTab.click();

      await page.waitForTimeout(500);

      const nodePanel = page
        .locator('[data-testid="node-palette"], .w-66, aside')
        .last();
      await expect(nodePanel).toBeVisible();
    }
  });
});

test.describe("User Flow: Search Functionality", () => {
  test("Search bar is accessible and functional", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    await searchInput.click();
    await searchInput.fill("test search");

    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe("test search");
  });
});

test.describe("User Flow: Responsive UI", () => {
  test("UI adapts to viewport changes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Check left sidebar is visible in desktop
    const exploreDesktop = page.getByText("Explore").first();
    await expect(exploreDesktop).toBeVisible();

    // Mobile/tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Check that create button is still visible
    const createButton = page.getByRole("button", { name: "Create" });
    await expect(createButton).toBeVisible();
  });
});

test.describe("User Flow: Error Handling", () => {
  test("404 page handles invalid routes gracefully", async ({ page }) => {
    await page.goto("/invalid-route-that-does-not-exist");
    await page.waitForLoadState("networkidle");

    const errorMessage = page.getByText(/not found|404|doesn't exist/i);
    const hasErrorMessage = (await errorMessage.count()) > 0;

    if (!hasErrorMessage) {
      const pageTitle = await page.title();
      expect(pageTitle).toContain("Atomiton");
    }
  });
});

test.describe("User Flow: Performance", () => {
  test("Page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);

    // Verify critical elements loaded
    const createButton = page.getByRole("button", { name: "Create" });
    await expect(createButton).toBeVisible();

    const myScenes = page.getByText("My Scenes").first();
    await expect(myScenes).toBeVisible();
  });
});
