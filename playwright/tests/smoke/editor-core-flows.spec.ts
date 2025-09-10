import { test, expect } from "@playwright/test";

/**
 * Smoke Tests - Critical Editor User Flows
 *
 * These tests verify the core functionality that users need to work.
 * No visual snapshots for performance - just functional verification.
 */

test.describe("Editor Core Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the editor
    await page.goto("/create");

    // Wait for editor to be ready
    await page.waitForSelector("[data-canvas-root]", { timeout: 5000 });
  });

  test("user can see and interact with the editor layout", async ({ page }) => {
    // Verify main editor components are visible
    await expect(page.locator("[data-canvas-root]")).toBeVisible();
    await expect(page.locator(".sidebar.left-3")).toBeVisible(); // Left sidebar
    await expect(page.locator(".sidebar.right-3")).toBeVisible(); // Right sidebar

    // Verify tabs in left sidebar
    const sceneTab = page.locator(".sidebar.left-3 >> text=Scene");
    const assetsTab = page.locator(".sidebar.left-3 >> text=Assets");
    await expect(sceneTab).toBeVisible();
    await expect(assetsTab).toBeVisible();

    // Verify canvas is interactive
    const canvas = page.locator("[data-canvas-root]");
    await expect(canvas).toHaveAttribute("tabindex", "0");
  });

  test("user can add a node from the palette to canvas", async ({ page }) => {
    // Click on Assets tab to see available nodes
    await page.click(".sidebar.left-3 >> text=Assets");

    // Wait for node categories to load
    await page.waitForSelector("text=/Input\/Output|Data Processing/", {
      timeout: 5000,
    });

    // Find and click on a node to add (e.g., HTTP Request)
    const nodeButton = page.locator('button:has-text("HTTP Request")').first();
    await expect(nodeButton).toBeVisible();
    await nodeButton.click();

    // Verify node appears on canvas
    // React Flow adds nodes with class .react-flow__node
    await expect(page.locator(".react-flow__node")).toHaveCount(1);

    // Verify node appears in Scene list
    await page.click(".sidebar.left-3 >> text=Scene");
    const sceneItem = page.locator(".sidebar.left-3 >> text=HTTP Request");
    await expect(sceneItem).toBeVisible();
  });

  test("user can select a node and see its properties", async ({ page }) => {
    // Add a node first
    await page.click(".sidebar.left-3 >> text=Assets");
    await page.waitForSelector("text=/Input\/Output|Data Processing/");

    const nodeButton = page.locator('button:has-text("File System")').first();
    await nodeButton.click();

    // Wait for node to appear
    await page.waitForSelector(".react-flow__node");

    // Click on the node to select it
    const node = page.locator(".react-flow__node").first();
    await node.click();

    // Verify properties appear in right sidebar
    const propertiesTitle = page.locator(
      ".sidebar.right-3 >> text=/File System Properties|Node Properties/",
    );
    await expect(propertiesTitle).toBeVisible();

    // Verify that properties section is shown
    // File System node may not have configurable properties
    // Just check that the properties panel appears
    const propertiesPanel = page.locator(".sidebar.right-3");
    await expect(propertiesPanel).toBeVisible();
  });

  test("user can select nodes from the scene list", async ({ page }) => {
    // Add multiple nodes
    await page.click(".sidebar.left-3 >> text=Assets");
    await page.waitForSelector("text=/Input\/Output|Data Processing/");

    // Add first node
    await page.locator('button:has-text("CSV Reader")').first().click();
    await page.waitForTimeout(500);

    // Add second node
    await page.locator('button:has-text("Transform")').first().click();
    await page.waitForTimeout(500);

    // Go to Scene tab
    await page.click(".sidebar.left-3 >> text=Scene");

    // Click on first node in scene list
    const firstNode = page.locator(".sidebar.left-3 >> text=CSV Reader");
    await firstNode.click();

    // Verify it shows CSV Reader properties
    await expect(
      page.locator(".sidebar.right-3 >> text=CSV Reader Properties"),
    ).toBeVisible();

    // Click on second node in scene list
    const secondNode = page.locator(".sidebar.left-3 >> text=Transform");
    await secondNode.click();

    // Verify it shows Transform properties
    await expect(
      page.locator(".sidebar.right-3 >> text=Transform Properties"),
    ).toBeVisible();
  });

  test("user can delete nodes with keyboard", async ({ page }) => {
    // Add a node
    await page.click(".sidebar.left-3 >> text=Assets");
    await page.waitForSelector("text=/Input\/Output|Data Processing/");
    await page.locator('button:has-text("Code")').first().click();

    // Wait for node to appear and select it
    await page.waitForSelector(".react-flow__node");
    const node = page.locator(".react-flow__node").first();
    await node.click();

    // Press Delete key
    await page.keyboard.press("Delete");

    // Verify node is removed
    await expect(page.locator(".react-flow__node")).toHaveCount(0);

    // Verify it's also removed from Scene list
    await page.click(".sidebar.left-3 >> text=Scene");
    const sceneItems = page.locator(".sidebar.left-3 >> text=Code");
    await expect(sceneItems).toHaveCount(0);
  });

  test("user can pan and zoom the canvas", async ({ page }) => {
    // Get canvas element
    const canvas = page.locator("[data-canvas-root]");

    // Test panning - drag on empty canvas
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.mouse.up();

    // Test zoom - use mouse wheel
    await canvas.hover();
    await page.mouse.wheel(0, -100); // Zoom in
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, 100); // Zoom out

    // Verify canvas is still interactive (no errors)
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute("tabindex", "0");
  });

  test("canvas maintains state across navigation", async ({ page }) => {
    // Add some nodes
    await page.click(".sidebar.left-3 >> text=Assets");
    await page.waitForSelector("text=/Input\/Output|Data Processing/");

    await page.locator('button:has-text("HTTP Request")').first().click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Transform")').first().click();

    // Verify we have 2 nodes
    await expect(page.locator(".react-flow__node")).toHaveCount(2);

    // Navigate away and back (simulate tab switch or similar)
    await page.click(".sidebar.left-3 >> text=Scene");
    await page.click(".sidebar.left-3 >> text=Assets");

    // Verify nodes are still there
    await expect(page.locator(".react-flow__node")).toHaveCount(2);
  });
});

test.describe("Editor Performance", () => {
  test("editor loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/create");
    await page.waitForSelector("[data-canvas-root]");
    await page.waitForSelector(".sidebar.left-3 >> text=Assets");

    const loadTime = Date.now() - startTime;

    // Editor should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("adding nodes is responsive", async ({ page }) => {
    await page.goto("/create");
    await page.waitForSelector("[data-canvas-root]");

    // Click on Assets tab
    await page.click(".sidebar.left-3 >> text=Assets");
    await page.waitForSelector("text=/Input\/Output|Data Processing/");

    // Measure time to add a node
    const startTime = Date.now();

    await page.locator('button:has-text("HTTP Request")').first().click();
    await page.waitForSelector(".react-flow__node");

    const addTime = Date.now() - startTime;

    // Adding a node should be under 500ms
    expect(addTime).toBeLessThan(500);
  });
});
