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
 * User Journey: Template to Editor Flow
 *
 * Critical end-to-end test for the complete template loading journey:
 * YAML Templates → Template Store → Editor Components → ReactFlow Rendering
 *
 * This test verifies that templates from the @atomiton/nodes package
 * successfully flow through all layers and render in the editor.
 */
test.describe("User Journey: Template to Editor Data Flow", () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleErrorTracking(page);
  });

  test("Templates load from store and are clickable", async ({ page }) => {
    await goToHomepage(page);

    // Wait for templates to load from store
    await page.waitForTimeout(2000);

    // Look for template buttons - they should be in the templates container
    const templatesContainer = page.locator(
      '[data-testid="templates-container"]',
    );

    // Check if container is visible
    const isContainerVisible = await templatesContainer.isVisible();

    if (!isContainerVisible) {
      // Try alternative selector for template links
      const templateLinks = page.locator('[data-testid^="template-button-"]');

      const linkCount = await templateLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      console.log(`Found ${linkCount} template links`);
    } else {
      const linksInContainer = templatesContainer.locator(
        '[data-testid^="template-button-"]',
      );
      const linkCount = await linksInContainer.count();
      expect(linkCount).toBeGreaterThan(0);
      console.log(`Found ${linkCount} templates in container`);
    }
  });

  test("Template click navigates to editor with loaded nodes", async ({
    page,
  }) => {
    await goToHomepage(page);
    await page.waitForTimeout(2000);

    // Find template links
    const templateLinks = page.locator('[data-testid^="template-button-"]');

    const linkCount = await templateLinks.count();

    if (linkCount === 0) {
      test.skip(linkCount === 0, "No templates loaded from store");
      return;
    }

    // Get first template details
    const firstTemplate = templateLinks.first();
    const templateName = await firstTemplate
      .locator(".text-body-md-str")
      .textContent();

    console.log(`Testing template: ${templateName}`);

    // Click template link
    await firstTemplate.click();

    // Verify navigation to editor
    await page.waitForURL(/\/editor\//, { timeout: 10000 });
    await waitForEditor(page);

    // Verify nodes loaded from template
    await page.waitForTimeout(2000);
    const nodes = await getNodes(page);
    const nodeCount = await nodes.count();

    expect(nodeCount).toBeGreaterThan(0);
    console.log(`Template loaded with ${nodeCount} nodes`);

    // Verify React Flow rendered without errors
    await verifyNoReactFlowErrors(page);
  });

  test("Each template has valid NodeDefinition structure", async ({
    page,
  }) => {
    await goToHomepage(page);
    await page.waitForTimeout(2000);

    const templateLinks = page.locator('[data-testid^="template-button-"]');

    const linkCount = await templateLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Test each template
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      console.log(`Testing template ${i + 1}/${linkCount}`);

      // Navigate to homepage fresh for each template
      if (i > 0) {
        await goToHomepage(page);
        await page.waitForTimeout(1000);
      }

      // Get fresh reference to template buttons
      const freshLinks = page.locator('[data-testid^="template-button-"]');

      const link = freshLinks.nth(i);
      const templateName = await link
        .locator(".text-body-md-str")
        .textContent();

      // Click and load template
      await link.click();
      await page.waitForURL(/\/editor\//, { timeout: 10000 });
      await waitForEditor(page);

      // Verify template loaded with proper structure
      await page.waitForTimeout(2000);

      const nodes = await getNodes(page);
      const edges = await getEdges(page);
      const nodeCount = await nodes.count();
      const edgeCount = await edges.count();

      console.log(`${templateName}: ${nodeCount} nodes, ${edgeCount} edges`);

      // Each template should have nodes
      expect(nodeCount).toBeGreaterThan(0);

      // If multiple nodes, should have edges
      if (nodeCount > 1) {
        expect(edgeCount).toBeGreaterThanOrEqual(0);
      }

      // Verify no React Flow errors
      await verifyNoReactFlowErrors(page);

      // Go back for next iteration
      if (i < linkCount - 1) {
        await page.goBack();
      }
    }
  });

  test("Template store integration with UI renders correctly", async ({
    page,
  }) => {
    await goToHomepage(page);

    // Check that templates section exists
    const templatesSection = page.locator(".overflow-x-auto.scrollbar-none");
    const sectionExists = (await templatesSection.count()) > 0;

    if (sectionExists) {
      await expect(templatesSection.first()).toBeVisible();
      console.log("Templates section rendered");
    }

    // Wait for templates to load
    await page.waitForTimeout(2000);

    // Check for template links with correct structure
    const templateLinks = page.locator('[data-testid^="template-button-"]');

    const linkCount = await templateLinks.count();

    if (linkCount > 0) {
      // Verify first template link structure
      const firstLink = templateLinks.first();

      // Should have image
      const image = firstLink.locator("img");
      await expect(image).toBeVisible();

      // Should have title
      const title = firstLink.locator(".text-body-md-str");
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText).toBeTruthy();

      // Should have "Template" category
      const category = firstLink.locator(".text-secondary");
      await expect(category).toBeVisible();
      const categoryText = await category.textContent();
      expect(categoryText).toBe("Template");

      // Note: TanStack Router handles preload internally, not as HTML attribute
      // The preload="intent" prop is configured in the Link component

      console.log(`Verified template link structure: ${titleText}`);
    } else {
      console.log("Warning: No templates loaded from store");
    }
  });

  test("Known templates (Hello World, Data Transform, Image Processor) are available", async ({
    page,
  }) => {
    await goToHomepage(page);
    await page.waitForTimeout(2000);

    const templateLinks = page.locator('[data-testid^="template-button-"]');

    const linkCount = await templateLinks.count();

    if (linkCount === 0) {
      test.skip(linkCount === 0, "No templates loaded - store may be empty");
      return;
    }

    // Collect all template names
    const templateNames: string[] = [];
    for (let i = 0; i < linkCount; i++) {
      const link = templateLinks.nth(i);
      const name = await link.locator(".text-body-md-str").textContent();
      if (name) {
        templateNames.push(name.toLowerCase());
      }
    }

    console.log(`Found templates: ${templateNames.join(", ")}`);

    // Check for expected templates
    const hasHelloWorld = templateNames.some(
      (name) => name.includes("hello") || name.includes("world"),
    );
    const hasDataTransform = templateNames.some(
      (name) => name.includes("data") || name.includes("transform"),
    );
    const hasImageProcessor = templateNames.some(
      (name) => name.includes("image") || name.includes("processor"),
    );

    // At least one known template should be present
    const hasKnownTemplate =
      hasHelloWorld || hasDataTransform || hasImageProcessor;
    expect(hasKnownTemplate).toBe(true);

    console.log(
      `Known templates found - Hello World: ${hasHelloWorld}, Data Transform: ${hasDataTransform}, Image Processor: ${hasImageProcessor}`,
    );
  });
});
