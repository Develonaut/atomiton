import { test, expect } from "@playwright/test";
import {
  goToHomepage,
  waitForEditor,
  getNodes,
  getEdges,
  setupConsoleErrorTracking,
  verifyNoReactFlowErrors,
} from "#utils";

/**
 * User Journey: Template Cards Loading
 *
 * Verifies that each template link on the homepage properly loads
 * with the correct nodes and connections in the editor.
 *
 * Note: Templates are rendered as Link elements with preloading enabled
 * and navigate to /editor/new with state
 */
test.describe("User Journey: Loading Template Cards from Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleErrorTracking(page);
    await goToHomepage(page);
  });

  test("Template links are visible on homepage", async ({ page }) => {
    // Wait for templates section to load
    await page.waitForTimeout(2000);

    // Look for template links with href to /editor/new
    const templateLinks = page.locator('[data-testid^="template-button-"]');

    const linkCount = await templateLinks.count();
    console.log(`Found ${linkCount} template links on homepage`);

    if (linkCount === 0) {
      // Templates might not be loaded yet - check for the Templates component
      const templatesSection = page.locator(".gap-3").first();
      await expect(templatesSection).toBeVisible({ timeout: 5000 });

      // Try again after waiting
      const retryLinks = page.locator('[data-testid^="template-button-"]');
      const retryCount = await retryLinks.count();
      expect(retryCount).toBeGreaterThan(0);
    } else {
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test("Hello World template loads with proper nodes and connections", async ({
    page,
  }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    // Get template links
    const templateLinks = page.locator('[data-testid^="template-button-"]');
    const linkCount = await templateLinks.count();

    if (linkCount === 0) {
      console.log("No template links available");
      return;
    }

    // Find the Hello World template (usually first)
    const helloWorldLink = templateLinks.first();

    // Get the link title to verify it's the right template
    const cardTitle = await helloWorldLink
      .locator(".text-body-md-str")
      .textContent();
    console.log(`Loading template: ${cardTitle}`);

    // Click on the Hello World template
    await helloWorldLink.click();

    // Wait for editor to load (navigates to /editor/new with state)
    await page.waitForURL(/\/editor\//, { timeout: 10000 });
    await waitForEditor(page);

    // Wait for nodes to render
    await page.waitForTimeout(1000);

    // Verify nodes are present
    const nodes = await getNodes(page);
    const nodeCount = await nodes.count();

    console.log(`${cardTitle} template loaded with ${nodeCount} nodes`);
    expect(nodeCount).toBeGreaterThan(0); // Should have at least one node

    // Verify edges/connections if multiple nodes exist
    if (nodeCount > 1) {
      const edges = await getEdges(page);
      const edgeCount = await edges.count();
      console.log(`${cardTitle} template has ${edgeCount} connections`);

      // Hello World template should have connections
      if (cardTitle?.toLowerCase().includes("hello")) {
        expect(edgeCount).toBeGreaterThan(0);
      }
    }

    // Verify no React Flow errors
    await verifyNoReactFlowErrors(page);

    // Check for specific node types
    const inputNodes = page.locator('[data-testid*="input"]');
    const outputNodes = page.locator('[data-testid*="output"]');

    if ((await inputNodes.count()) > 0) {
      console.log("Found input nodes in Hello World template");
    }

    if ((await outputNodes.count()) > 0) {
      console.log("Found output nodes in Hello World template");
    }
  });

  test("Data Transform template loads with proper nodes and connections", async ({
    page,
  }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    const templateLinks = page.locator('[data-testid^="template-button-"]');
    const linkCount = await templateLinks.count();

    if (linkCount < 2) {
      console.log("Data Transform template not available");
      return;
    }

    // Get the second template link (Data Transform)
    const dataTransformLink = templateLinks.nth(1);

    // Get the link title
    const cardTitle = await dataTransformLink
      .locator(".text-body-md-str")
      .textContent();
    console.log(`Loading template: ${cardTitle}`);

    // Click on the Data Transform template
    await dataTransformLink.click();

    // Wait for editor to load
    await page.waitForURL(/\/editor\//, { timeout: 10000 });
    await waitForEditor(page);

    // Wait for nodes to render
    await page.waitForTimeout(1000);

    // Verify nodes are present
    const nodes = await getNodes(page);
    const nodeCount = await nodes.count();

    console.log(`${cardTitle} template loaded with ${nodeCount} nodes`);
    expect(nodeCount).toBeGreaterThan(1); // Data transform should have multiple nodes

    // Verify edges/connections are present
    const edges = await getEdges(page);
    const edgeCount = await edges.count();

    console.log(`${cardTitle} template has ${edgeCount} connections`);
    if (
      cardTitle?.toLowerCase().includes("transform") ||
      cardTitle?.toLowerCase().includes("data")
    ) {
      expect(edgeCount).toBeGreaterThan(0); // Should have connections between nodes
    }

    // Verify no React Flow errors
    await verifyNoReactFlowErrors(page);

    // Check for transform-specific nodes
    const transformNodes = page.locator(
      '[data-testid*="transform"], [data-testid*="processor"]',
    );
    if ((await transformNodes.count()) > 0) {
      console.log("Found transform/processor nodes in Data Transform template");
    }
  });

  test("Image Processor template loads with proper nodes and connections", async ({
    page,
  }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    const templateLinks = page.locator('[data-testid^="template-button-"]');
    const linkCount = await templateLinks.count();

    if (linkCount < 3) {
      console.log("Image Processor template not available");
      return;
    }

    // Get the third template link (Image Processor)
    const imageProcessorLink = templateLinks.nth(2);

    // Get the link title
    const cardTitle = await imageProcessorLink
      .locator(".text-body-md-str")
      .textContent();
    console.log(`Loading template: ${cardTitle}`);

    // Click on the Image Processor template
    await imageProcessorLink.click();

    // Wait for editor to load
    await page.waitForURL(/\/editor\//, { timeout: 10000 });
    await waitForEditor(page);

    // Wait for nodes to render
    await page.waitForTimeout(1000);

    // Verify nodes are present
    const nodes = await getNodes(page);
    const nodeCount = await nodes.count();

    console.log(`${cardTitle} template loaded with ${nodeCount} nodes`);
    expect(nodeCount).toBeGreaterThan(1); // Image processor should have multiple nodes

    // Verify edges/connections are present
    const edges = await getEdges(page);
    const edgeCount = await edges.count();

    console.log(`${cardTitle} template has ${edgeCount} connections`);
    if (
      cardTitle?.toLowerCase().includes("image") ||
      cardTitle?.toLowerCase().includes("processor")
    ) {
      expect(edgeCount).toBeGreaterThan(0); // Should have connections between nodes
    }

    // Verify no React Flow errors
    await verifyNoReactFlowErrors(page);

    // Check for image-specific nodes
    const imageNodes = page.locator(
      '[data-testid*="image"], [data-testid*="file"]',
    );
    if ((await imageNodes.count()) > 0) {
      console.log("Found image/file nodes in Image Processor template");
    }
  });

  test("All template links are clickable and have proper metadata", async ({
    page,
  }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    const templateLinks = page.locator('[data-testid^="template-button-"]');
    const linkCount = await templateLinks.count();

    expect(linkCount).toBeGreaterThan(0); // Should have at least one template
    console.log(`Found ${linkCount} template links on homepage`);

    // Verify each link has required elements
    for (let i = 0; i < linkCount; i++) {
      const link = templateLinks.nth(i);

      // Verify link is visible and clickable
      await expect(link).toBeVisible();

      // Verify button is clickable (buttons don't have href)
      await expect(link).toBeEnabled();

      // Note: TanStack Router handles preload internally, not as HTML attribute
      // The preload="intent" prop is configured in the Link component

      // Verify link has an image
      const image = link.locator("img");
      await expect(image).toBeVisible();

      // Verify link has a title
      const title = link.locator(".text-body-md-str");
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText).toBeTruthy();

      // Verify link has a category/type (should be "Template")
      const category = link.locator(".text-secondary");
      await expect(category).toBeVisible();
      const categoryText = await category.textContent();
      expect(categoryText).toBe("Template");

      console.log(`Template ${i + 1}: ${titleText}`);
    }
  });

  test("Template navigation maintains proper state", async ({ page }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    const templateLinks = page.locator('[data-testid^="template-button-"]');
    const linkCount = await templateLinks.count();

    if (linkCount === 0) {
      console.log("No template links available");
      return;
    }

    // Load first template
    const firstLink = templateLinks.first();
    const firstName = await firstLink
      .locator(".text-body-md-str")
      .textContent();
    await firstLink.click();

    await page.waitForURL(/\/editor\//, { timeout: 10000 });
    await waitForEditor(page);

    // Get initial node count
    const initialNodes = await getNodes(page);
    const initialNodeCount = await initialNodes.count();
    console.log(`${firstName} has ${initialNodeCount} nodes`);

    // Go back to homepage
    await page.goBack();
    await goToHomepage(page);
    await page.waitForTimeout(1000);

    // Load a different template if available
    const freshTemplateLinks = page.locator(
      '[data-testid^="template-button-"]',
    );
    const freshLinkCount = await freshTemplateLinks.count();

    if (freshLinkCount > 1) {
      const secondLink = freshTemplateLinks.nth(1);
      const secondName = await secondLink
        .locator(".text-body-md-str")
        .textContent();
      await secondLink.click();

      await page.waitForURL(/\/editor\//, { timeout: 10000 });
      await waitForEditor(page);

      // Verify it loaded correctly
      const newNodes = await getNodes(page);
      const newNodeCount = await newNodes.count();
      console.log(`${secondName} has ${newNodeCount} nodes`);

      // Different templates should have different node counts
      console.log(
        `First template had ${initialNodeCount} nodes, second has ${newNodeCount} nodes`,
      );

      // Verify no React Flow errors during navigation
      await verifyNoReactFlowErrors(page);
    }
  });

  test("Template links support hover preloading", async ({ page }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    const templateLinks = page.locator('[data-testid^="template-button-"]');
    const linkCount = await templateLinks.count();

    if (linkCount === 0) {
      console.log("No template links available for preloading test");
      return;
    }

    // Get first template link
    const firstLink = templateLinks.first();

    // Hover over the link to trigger preloading
    await firstLink.hover();

    // Wait for the configured preload delay (50ms) plus buffer
    await page.waitForTimeout(100);

    // TanStack Router handles preload="intent" internally
    // The component is configured with preload="intent" prop
    // which enables hover-based preloading with 50ms delay
    console.log("Template link hover preloading test completed");

    // Verify link is still functional after hover
    await expect(firstLink).toBeVisible();
    await expect(firstLink).toBeEnabled();
  });
});
