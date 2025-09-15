import { expect, test } from "@playwright/test";
import { EditorPage, MyScenesPage } from "../pages";

/**
 * Blueprint functionality tests using Page Object Model
 * Covers the critical user flows for blueprint creation and management
 */
test.describe("Blueprint Core Functionality", () => {
  test("Create new blueprint via Create button", async ({ page }) => {
    const myScenes = new MyScenesPage(page);
    const editor = new EditorPage(page);

    // Navigate to My Scenes
    await myScenes.visit();
    await myScenes.waitForReady();

    // Verify Create button is visible
    expect(await myScenes.isCreateButtonVisible()).toBeTruthy();

    // Click Create button
    await myScenes.clickCreateButton();

    // Verify navigation to editor
    await expect(page).toHaveURL("/editor");

    // Verify editor is loaded
    expect(await editor.isEditorLoaded()).toBeTruthy();

    // Verify canvas is empty (new blueprint)
    expect(await editor.isCanvasEmpty()).toBeTruthy();

    // Verify all UI elements are present
    expect(await editor.isUIElementVisible("toolbar")).toBeTruthy();
    expect(await editor.isUIElementVisible("leftSidebar")).toBeTruthy();
    expect(await editor.isUIElementVisible("rightSidebar")).toBeTruthy();
    expect(await editor.isUIElementVisible("minimap")).toBeTruthy();
    expect(await editor.isUIElementVisible("grid")).toBeTruthy();
  });

  test.skip("Load existing blueprint from My Scenes card", async ({ page }) => {
    const myScenes = new MyScenesPage(page);
    const editor = new EditorPage(page);

    // Navigate to My Scenes
    await myScenes.visit();
    await myScenes.waitForReady();

    // Check if there are any blueprints
    const hasCards = await myScenes.hasBlueprintCards();

    if (!hasCards) {
      test.skip();
      return;
    }

    // Get the first card's details
    const cardDetails = await myScenes.getBlueprintCardDetails(0);
    expect(cardDetails.title).toBeTruthy();
    expect(cardDetails.category).toBeTruthy();
    expect(cardDetails.image).toBeTruthy();

    // Get the expected navigation URL
    const expectedHref = await myScenes.getBlueprintCardHref(0);
    expect(expectedHref).toBeTruthy();

    // Click the first blueprint card
    await myScenes.clickBlueprintCard(0);

    // Verify navigation to editor with blueprint ID
    await expect(page).toHaveURL(expectedHref!);

    // Verify editor is loaded
    expect(await editor.isEditorLoaded()).toBeTruthy();

    // Wait for editor to be ready
    await editor.waitForReady();

    // Log node count for debugging
    const nodeCount = await editor.getNodeCount();
    console.log(`Loaded blueprint with ${nodeCount} nodes`);
  });

  test.skip("Blueprint cards display correct information", async ({ page }) => {
    const myScenes = new MyScenesPage(page);

    // Navigate to My Scenes
    await myScenes.visit();
    await myScenes.waitForReady();

    // Check if there are any blueprints
    const blueprintCount = await myScenes.getBlueprintCount();

    if (blueprintCount === 0) {
      test.skip();
      return;
    }

    // Check up to 3 blueprint cards
    const cardsToCheck = Math.min(3, blueprintCount);

    for (let i = 0; i < cardsToCheck; i++) {
      const details = await myScenes.getBlueprintCardDetails(i);

      // Verify each card has required information
      expect(details.title, `Card ${i} should have a title`).toBeTruthy();
      expect(details.category, `Card ${i} should have a category`).toBeTruthy();
      expect(details.image, `Card ${i} should have an image`).toBeTruthy();

      // Verify the href is properly formed
      const href = await myScenes.getBlueprintCardHref(i);
      expect(href, `Card ${i} should have a valid href`).toMatch(
        /^\/editor\/.+$/,
      );
    }
  });

  test("Editor loads with correct state for new vs existing blueprints", async ({
    page,
  }) => {
    const myScenes = new MyScenesPage(page);
    const editor = new EditorPage(page);

    // Test 1: New blueprint (via Create button)
    await myScenes.visit();
    await myScenes.waitForReady();
    await myScenes.clickCreateButton();

    // New blueprint should have no ID in URL
    await expect(page).toHaveURL("/editor");

    // Wait for editor to load
    await editor.waitForReady();

    // New blueprint should have empty canvas
    const newBlueprintNodeCount = await editor.getNodeCount();
    expect(newBlueprintNodeCount).toBe(0);

    // Skip Test 2 for now - blueprints don't exist in store yet
  });
});

test.describe("Editor UI Elements", () => {
  test("All editor UI components are present and visible", async ({ page }) => {
    const editor = new EditorPage(page);

    // Navigate directly to editor
    await editor.visit();
    await editor.waitForReady();

    // Check all major UI components
    const uiElements = [
      { name: "toolbar", element: editor.toolbar },
      { name: "leftSidebar", element: editor.leftSidebar },
      { name: "rightSidebar", element: editor.rightSidebar },
      { name: "canvas", element: editor.canvas },
      { name: "minimap", element: editor.minimap },
      { name: "grid", element: editor.grid },
    ];

    for (const { name, element } of uiElements) {
      await expect(element, `${name} should be visible`).toBeVisible();
    }

    // Check toolbar buttons
    await expect(editor.undoButton).toBeVisible();
    await expect(editor.redoButton).toBeVisible();
  });
});
