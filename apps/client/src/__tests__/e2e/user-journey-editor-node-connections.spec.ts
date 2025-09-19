import { test, expect } from "@playwright/test";
import {
  createNewProject,
  setupConsoleErrorTracking,
  verifyNoReactFlowErrors,
  clearConsoleErrors,
  addNodeFromAssetPanel,
  getNodes,
  getEdges,
  getConsoleErrors,
  selectNode,
  panCanvas,
  zoomCanvas,
  openTemplate,
  waitForEditor,
} from "./utils";

test.describe("User Journey: Creating Node Connections in Editor", () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleErrorTracking(page);
  });

  test("User can open editor and start connecting nodes", async ({ page }) => {
    await createNewProject(page);
    await verifyNoReactFlowErrors(page);
  });

  test("Can add a node without triggering handle errors", async ({ page }) => {
    await createNewProject(page);
    await clearConsoleErrors(page);

    const nodeAdded = await addNodeFromAssetPanel(page);

    if (nodeAdded) {
      const nodes = await getNodes(page);
      const nodeCount = await nodes.count();
      expect(nodeCount).toBeGreaterThan(0);

      // Verify specific node test ID
      const nodeWithTestId = page.locator('[data-testid^="node-"]').first();
      await expect(nodeWithTestId).toBeVisible();

      // Check for handle errors
      const handleErrors = await getConsoleErrors(page, [
        "handle",
        "source handle id",
        "Couldn't create edge",
      ]);

      if (handleErrors.length > 0) {
        console.log("Handle Errors After Node Addition:", handleErrors);
      }

      expect(handleErrors).toHaveLength(0);
    } else {
      console.log(
        "No node buttons found in palette - skipping node addition test",
      );
    }
  });

  test("Can create multiple nodes without errors", async ({ page }) => {
    await createNewProject(page);
    await clearConsoleErrors(page);

    const firstNodeAdded = await addNodeFromAssetPanel(page, 0);
    const secondNodeAdded = await addNodeFromAssetPanel(page, 1);

    if (firstNodeAdded && secondNodeAdded) {
      const nodes = await getNodes(page);
      const nodeCount = await nodes.count();
      expect(nodeCount).toBeGreaterThanOrEqual(2);

      await verifyNoReactFlowErrors(page);
    } else {
      console.log("Insufficient node types available for multi-node test");
    }
  });

  test("ReactFlow components render with proper structure", async ({
    page,
  }) => {
    await createNewProject(page);

    // Verify essential ReactFlow elements are present
    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toBeVisible();

    // Check for ReactFlow background (grid)
    const background = page.locator(".react-flow__background");
    await expect(background).toBeVisible();

    // Check for ReactFlow viewport
    const viewport = page.locator(".react-flow__viewport");
    await expect(viewport).toBeVisible();

    // Verify minimap if present
    const minimap = page.locator(".react-flow__minimap");
    const minimapExists = (await minimap.count()) > 0;
    if (minimapExists) {
      await expect(minimap).toBeVisible();
    }

    // Check for initialization errors
    const initErrors = await getConsoleErrors(page, [
      "React Flow",
      "initialization",
    ]);
    expect(initErrors).toHaveLength(0);
  });

  test("Node selection works without handle errors", async ({ page }) => {
    await createNewProject(page);

    const nodeAdded = await addNodeFromAssetPanel(page);

    if (nodeAdded) {
      await clearConsoleErrors(page);

      const nodeSelected = await selectNode(page);

      if (nodeSelected) {
        const selectionErrors = await getConsoleErrors(page, [
          "handle",
          "selection",
          "React Flow",
        ]);

        expect(selectionErrors).toHaveLength(0);
      }
    }
  });

  test("Editor state persists without ReactFlow errors", async ({ page }) => {
    await createNewProject(page);
    await clearConsoleErrors(page);

    // Switch between tabs to test state persistence
    const assetTab = page.getByRole("button", { name: "Asset" });
    await assetTab.click();
    await page.waitForTimeout(200);

    const designTab = page.getByRole("button", { name: "Design" });
    const designTabExists = (await designTab.count()) > 0;
    if (designTabExists) {
      await designTab.click();
      await page.waitForTimeout(200);
    }

    await assetTab.click();
    await page.waitForTimeout(200);

    // Check for persistent errors
    const persistentErrors = await getConsoleErrors(page, [
      "React Flow",
      "handle",
      "edge",
      "memory",
      "leak",
    ]);

    expect(persistentErrors).toHaveLength(0);
  });

  test("Zoom and pan operations work without errors", async ({ page }) => {
    await createNewProject(page);
    await clearConsoleErrors(page);

    // Test zoom operations
    await zoomCanvas(page, "in");
    await zoomCanvas(page, "out");

    // Test pan operation
    await panCanvas(page, 50, 50);

    // Check for zoom/pan related errors
    const zoomPanErrors = await getConsoleErrors(page, [
      "zoom",
      "pan",
      "transform",
      "React Flow",
    ]);

    expect(zoomPanErrors).toHaveLength(0);
  });

  test("Edges render visibly when templates are loaded", async ({ page }) => {
    // Navigate to homepage to find template links
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for template links
    const templateLinks = page.locator('[data-testid^="template-button-"]');
    const linkCount = await templateLinks.count();

    if (linkCount > 0) {
      // Click first template
      await templateLinks.first().click();
      await page.waitForURL(/\/editor\//, { timeout: 10000 });
      await waitForEditor(page);
      await page.waitForTimeout(2000); // Extra time for template to load

      await clearConsoleErrors(page);

      const nodes = await getNodes(page);
      const nodeCount = await nodes.count();

      if (nodeCount >= 2) {
        const edges = await getEdges(page);
        const edgeCount = await edges.count();

        console.log(`Found ${nodeCount} nodes and ${edgeCount} edges`);

        // Template should have at least one edge if it has multiple nodes
        expect(edgeCount).toBeGreaterThan(0);

        // Verify edges exist and are in DOM (edges may not be immediately "visible" due to SVG rendering)
        if (edgeCount > 0) {
          const firstEdge = edges.first();
          await expect(firstEdge).toBeAttached();

          // Additional wait for React Flow to finish rendering
          await page.waitForTimeout(1000);

          // Verify the edge has the expected data attributes
          const edgeId = await firstEdge.getAttribute("data-id");
          expect(edgeId).toBeTruthy();
          console.log(`Edge found with ID: ${edgeId}`);
        }

        // Check for edge-related console errors
        const edgeErrors = await getConsoleErrors(page, [
          "edge",
          "handle",
          "connection",
        ]);

        if (edgeErrors.length > 0) {
          console.log("Edge Rendering Errors:", edgeErrors);
        }

        expect(edgeErrors).toHaveLength(0);
      } else {
        console.log(
          `Template loaded with ${nodeCount} nodes - no edges expected`,
        );
      }
    } else {
      console.log("No template links found - skipping edge visibility test");
    }
  });

  test("Nodes have proper testid attributes for edge connections", async ({
    page,
  }) => {
    await createNewProject(page);

    // Add multiple nodes to test connections
    const firstNodeAdded = await addNodeFromAssetPanel(page, 0);
    const secondNodeAdded = await addNodeFromAssetPanel(page, 1);

    if (firstNodeAdded && secondNodeAdded) {
      // Verify nodes have proper test IDs
      const nodesWithTestId = page.locator('[data-testid^="node-"]');
      const testIdNodeCount = await nodesWithTestId.count();
      expect(testIdNodeCount).toBeGreaterThanOrEqual(2);

      // Each node should be visible with unique test ID
      for (let i = 0; i < Math.min(testIdNodeCount, 2); i++) {
        const node = nodesWithTestId.nth(i);
        await expect(node).toBeVisible();

        // Get the test ID
        const testId = await node.getAttribute("data-testid");
        expect(testId).toBeTruthy();
        expect(testId).toMatch(/^node-/);

        console.log(`Node ${i} has testid: ${testId}`);
      }
    } else {
      console.log("Insufficient node types for testid verification");
    }
  });
});
