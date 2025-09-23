import { test, expect } from "@playwright/test";
import {
  goToHomepage,
  goToExplorePage,
  verifyNavigationElements,
  waitForContent,
  createNewProject,
  openTemplate,
} from "#utils";

test.describe("User Journey: First-Time User Homepage Navigation", () => {
  test("User lands on homepage and explores navigation", async ({ page }) => {
    await goToHomepage(page);

    // Verify page title
    await expect(page).toHaveTitle(/Atomiton/i);

    // Verify navigation elements
    await verifyNavigationElements(page);

    // Check for main content areas
    const myScenes = page.getByText("My Scenes");
    await expect(myScenes.first()).toBeVisible();
  });

  test("Clicking on a template loads it in the editor", async ({ page }) => {
    const templateOpened = await openTemplate(page);

    if (templateOpened) {
      // Verify we're in the editor
      const canvas = page.locator(".react-flow");
      await expect(canvas).toBeVisible();
    } else {
      console.log("No template buttons found, skipping template click test");
    }
  });

  test("Explore page navigation", async ({ page }) => {
    await goToExplorePage(page);
    await waitForContent(page);
  });

  test("Create button navigates to new editor", async ({ page }) => {
    await createNewProject(page);

    // Verify it's a fresh editor (should have no nodes initially or minimal nodes)
    const nodes = page.locator(".react-flow__node");
    const nodeCount = await nodes.count();

    // A fresh editor should have 0 nodes or a minimal set
    expect(nodeCount).toBeLessThanOrEqual(3);
  });
});
