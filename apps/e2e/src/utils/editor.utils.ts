import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Editor utility functions for E2E tests
 */

/**
 * Navigate to a new editor instance via the Create button
 */
export async function createNewProject(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const createButton = page.getByRole("button", { name: "Create" });
  await expect(createButton).toBeVisible();
  await createButton.click();

  // Wait for editor to load with new ID
  await page.waitForURL(/\/editor\/.+/, { timeout: 10000 });
  await page.waitForSelector(".react-flow", { timeout: 10000 });
}

/**
 * Wait for the React Flow editor to be ready
 */
export async function waitForEditor(page: Page) {
  await page.waitForSelector(".react-flow", { timeout: 10000 });

  // Also verify essential elements are present
  const canvas = page.locator(".react-flow__viewport");
  await expect(canvas).toBeVisible();
}

/**
 * Open a template from the homepage
 */
export async function openTemplate(page: Page, index = 0) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const templateCards = page.locator('a[href^="/editor/"]');
  const cardCount = await templateCards.count();

  if (cardCount > index) {
    await templateCards.nth(index).click();
    await page.waitForURL(/\/editor\/.+/, { timeout: 10000 });
    await waitForEditor(page);
    return true;
  }

  return false;
}

/**
 * Navigate directly to editor with optional ID
 */
export async function navigateToEditor(page: Page, id?: string) {
  const url = id ? `/editor/${id}` : "/editor/new";
  await page.goto(url);
  await waitForEditor(page);
}

/**
 * Open the asset panel in the editor
 */
export async function openAssetPanel(page: Page) {
  const assetTab = page.getByRole("button", { name: "Asset" });
  await assetTab.click();
  await page.waitForSelector('[data-testid="node-palette"], .left-0.w-66', {
    timeout: 5000,
  });
}

/**
 * Add a node from the asset panel
 */
export async function addNodeFromAssetPanel(page: Page, nodeIndex = 0) {
  await openAssetPanel(page);

  const nodeButtons = page.locator(
    '[data-testid^="add-node-"], button[class*="node"]',
  );
  const nodeCount = await nodeButtons.count();

  if (nodeCount > nodeIndex) {
    await nodeButtons.nth(nodeIndex).click();
    await page.waitForTimeout(500); // Allow time for node to be added
    return true;
  }

  return false;
}

/**
 * Get all nodes in the editor
 */
export async function getNodes(page: Page) {
  return page.locator(".react-flow__node");
}

/**
 * Get all edges in the editor
 */
export async function getEdges(page: Page) {
  return page.locator(".react-flow__edge");
}

/**
 * Clear console errors tracking
 */
export async function clearConsoleErrors(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { consoleErrors: string[] }).consoleErrors = [];
  });
}

/**
 * Get console errors
 */
export async function getConsoleErrors(page: Page, filter?: string[]) {
  const errors = await page.evaluate(
    () =>
      (window as unknown as { consoleErrors?: string[] }).consoleErrors || [],
  );

  if (filter && filter.length > 0) {
    return errors.filter((error: string) =>
      filter.some((term) => error.includes(term)),
    );
  }

  return errors;
}

/**
 * Setup console error tracking
 */
export async function setupConsoleErrorTracking(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { consoleErrors: string[] }).consoleErrors = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      (window as unknown as { consoleErrors: string[] }).consoleErrors.push(
        args.join(" "),
      );
      originalError.apply(console, args);
    };
  });
}

/**
 * Verify no React Flow errors
 */
export async function verifyNoReactFlowErrors(page: Page) {
  const errors = await getConsoleErrors(page, [
    "React Flow",
    "handle",
    "edge",
    "source handle id",
    "connection",
  ]);

  // Check for React Flow errors silently

  expect(errors).toHaveLength(0);
}

/**
 * Select a node by clicking on it
 */
export async function selectNode(page: Page, nodeIndex = 0) {
  const nodes = await getNodes(page);
  const nodeCount = await nodes.count();

  if (nodeCount > nodeIndex) {
    await nodes.nth(nodeIndex).click();
    await page.waitForTimeout(300); // Allow time for selection
    return true;
  }

  return false;
}

/**
 * Pan the canvas by dragging
 */
export async function panCanvas(page: Page, deltaX: number, deltaY: number) {
  const canvas = page.locator(".react-flow__viewport");
  const box = await canvas.boundingBox();

  if (!box) return;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + deltaX, centerY + deltaY);
  await page.mouse.up();
  await page.waitForTimeout(200);
}

/**
 * Use zoom controls if available
 */
export async function zoomCanvas(page: Page, direction: "in" | "out") {
  const selector =
    direction === "in"
      ? '.react-flow__controls button[title*="zoom in"], button[aria-label*="zoom in"]'
      : '.react-flow__controls button[title*="zoom out"], button[aria-label*="zoom out"]';

  const button = page.locator(selector);
  if ((await button.count()) > 0) {
    await button.click();
    await page.waitForTimeout(200);
    return true;
  }

  return false;
}
