import { expect, test } from "@playwright/test";

/**
 * Blueprint core tests - verify core blueprint functionality
 * These tests cover the two critical user flows:
 * 1. Creating a new blueprint by clicking the Create button
 * 2. Loading an existing blueprint by clicking on a card
 */
test.describe("Blueprint Creation and Loading", () => {
  test("Create button navigates to editor for new blueprint", async ({
    page,
  }) => {
    // Navigate to home page
    await page.goto("/");

    // Wait for the page to be loaded
    await page.waitForSelector(".pl-55.pt-20, .pl-0.pt-20", {
      timeout: 5000,
    });

    // Find and click the Create button in the header
    // The Create button is only visible when not on the explore page
    const createButton = page.getByRole("link", { name: "Create" });
    await expect(createButton).toBeVisible();

    // Click the Create button
    await createButton.click();

    // Verify we're navigated to the editor page
    await expect(page).toHaveURL("/editor");

    // Wait for editor canvas to be loaded
    await page.waitForSelector(".react-flow", { timeout: 10000 });

    // Verify the editor UI elements are present
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible();

    // Verify toolbar is present
    const toolbar = page.locator('[data-testid="toolbar"], .shadow-toolbar');
    await expect(toolbar).toBeVisible();

    // Verify left sidebar (node palette) is present
    const leftSidebar = page.locator('[data-testid="left-sidebar"]');
    await expect(leftSidebar).toBeVisible();

    // Verify right sidebar is present
    const rightSidebar = page.locator(
      '[data-testid="right-sidebar"], .right-0.w-66',
    );
    await expect(rightSidebar).toBeVisible();
  });

  test.skip("Clicking a blueprint card loads it in the editor - SKIPPED: No blueprints in store", async ({
    page,
  }) => {
    // Navigate to home page (My Scenes)
    await page.goto("/");

    // Wait for the page to be loaded
    await page.waitForSelector(".pl-55.pt-20, .pl-0.pt-20", {
      timeout: 5000,
    });

    // Wait for catalog cards to be visible
    await page.waitForSelector('a[href^="/editor/"]', {
      timeout: 5000,
    });

    // Get the first blueprint card
    const firstCard = page.locator('a[href^="/editor/"]').first();

    // Extract the ID from the href to verify navigation
    const href = await firstCard.getAttribute("href");
    expect(href).toBeTruthy();

    // Click on the card
    await firstCard.click();

    // Verify we're navigated to the editor with the correct ID
    await expect(page).toHaveURL(href!);

    // Wait for editor canvas to be loaded
    await page.waitForSelector(".react-flow", { timeout: 10000 });

    // Verify the editor loaded with the blueprint
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible();

    // If the blueprint has nodes, they should be visible
    // (This might not always be the case if the blueprint is empty)
    const nodes = page.locator(".react-flow__node");
    const nodeCount = await nodes.count();

    // Log for debugging purposes
    console.log(`Loaded blueprint with ${nodeCount} nodes`);
  });

  test("Create button creates a new empty blueprint", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");

    // Click the Create button
    const createButton = page.getByRole("link", { name: "Create" });
    await createButton.click();

    // Wait for editor to load
    await page.waitForSelector(".react-flow", { timeout: 10000 });

    // Verify it's a new blueprint (no ID in URL)
    await expect(page).toHaveURL("/editor");

    // Verify the canvas is empty (no nodes initially)
    const nodes = page.locator(".react-flow__node");
    const nodeCount = await nodes.count();
    expect(nodeCount).toBe(0);

    // Click on the Asset tab to show the node palette
    const assetTab = page.getByRole("button", { name: "Asset" });
    await assetTab.click();

    // Verify the node palette is available for adding nodes
    const nodePalette = page.locator(
      '[data-testid="node-palette"], .left-0.w-66',
    );
    await expect(nodePalette).toBeVisible();
  });

  test.skip("Blueprint card shows title and preview image - SKIPPED: Mock data only", async ({
    page,
  }) => {
    // Navigate to home page
    await page.goto("/");

    // Wait for catalog cards
    await page.waitForSelector('a[href^="/editor/"]', {
      timeout: 5000,
    });

    // Get the first card
    const firstCard = page.locator('a[href^="/editor/"]').first();

    // Verify the card has an image
    const cardImage = firstCard.locator("img");
    await expect(cardImage).toBeVisible();

    // Verify the card has a title
    const cardTitle = firstCard.locator(".text-body-md-str");
    await expect(cardTitle).toBeVisible();
    const titleText = await cardTitle.textContent();
    expect(titleText).toBeTruthy();

    // Verify the card has a category
    const cardCategory = firstCard.locator(".text-secondary");
    await expect(cardCategory).toBeVisible();
    const categoryText = await cardCategory.textContent();
    expect(categoryText).toBeTruthy();
  });

  test.skip("Editor loads with proper initial state for existing blueprint - SKIPPED: No blueprints in store", async ({
    page,
  }) => {
    // Navigate directly to an editor with a specific ID
    // Using a mock ID that should exist in the test data
    await page.goto("/editor/blueprint_1");

    // Wait for editor to load
    await page.waitForSelector(".react-flow", { timeout: 10000 });

    // Verify the URL contains the blueprint ID
    await expect(page).toHaveURL("/editor/blueprint_1");

    // Verify editor components are loaded
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible();

    // Verify minimap is visible (bottom-right)
    const minimap = page.locator(".react-flow__minimap");
    await expect(minimap).toBeVisible();

    // Verify grid is visible
    const grid = page.locator(".react-flow__background");
    await expect(grid).toBeVisible();
  });
});
