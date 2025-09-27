import type { Page, Locator } from "@playwright/test";
import { BasePage } from "#pages/base-page";

/**
 * Editor page object model for flow editor
 */
export class EditorPage extends BasePage {
  readonly canvas: Locator;
  readonly toolbar: Locator;
  readonly leftSidebar: Locator;
  readonly rightSidebar: Locator;
  readonly minimap: Locator;
  readonly grid: Locator;
  readonly nodes: Locator;
  readonly edges: Locator;
  readonly nodePalette: Locator;
  readonly nodeInspector: Locator;
  readonly saveButton: Locator;
  readonly undoButton: Locator;
  readonly redoButton: Locator;
  readonly zoomControls: Locator;
  readonly playButton: Locator;

  constructor(page: Page) {
    super(page);

    // React Flow canvas elements
    this.canvas = page.locator(".react-flow");
    this.nodes = page.locator(".react-flow__node");
    this.edges = page.locator(".react-flow__edge");
    this.minimap = page.locator(".react-flow__minimap");
    this.grid = page.locator(".react-flow__background");

    // UI elements
    this.toolbar = page
      .locator('[data-testid="toolbar"], .shadow-toolbar')
      .first();
    this.leftSidebar = page.locator('[data-testid="left-sidebar"]');
    this.rightSidebar = page
      .locator('[data-testid="right-sidebar"], .right-0.w-66')
      .first();
    this.nodePalette = page
      .locator('[data-testid="node-palette"], .left-0.w-66')
      .first();
    this.nodeInspector = page.locator('[data-testid="node-inspector"]').first();

    // Toolbar buttons
    this.saveButton = page
      .locator('[data-testid="save-button"], button:has-text("Save")')
      .first();
    this.undoButton = page.locator('button[title*="Undo"]').first();
    this.redoButton = page.locator('button[title*="Redo"]').first();
    this.zoomControls = page.locator('[data-testid="zoom-controls"]').first();
    this.playButton = page.locator('button:has(svg[name="play"])').first();
  }

  /**
   * Navigate to the editor page with optional flow ID
   */
  async visit(flowId?: string) {
    if (flowId) {
      await this.goto(`/editor/${flowId}`);
    } else {
      await this.goto("/editor");
    }
  }

  /**
   * Check if editor is loaded and ready
   */
  async isEditorLoaded(): Promise<boolean> {
    try {
      await this.canvas.waitFor({ state: "visible", timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the count of nodes in the canvas
   */
  async getNodeCount(): Promise<number> {
    await this.canvas.waitFor({ state: "visible", timeout: 5000 });
    return await this.nodes.count();
  }

  /**
   * Get the count of edges in the canvas
   */
  async getEdgeCount(): Promise<number> {
    await this.canvas.waitFor({ state: "visible", timeout: 5000 });
    return await this.edges.count();
  }

  /**
   * Check if canvas is empty (no nodes)
   */
  async isCanvasEmpty(): Promise<boolean> {
    const nodeCount = await this.getNodeCount();
    return nodeCount === 0;
  }

  /**
   * Add a node from the palette
   */
  async addNodeFromPalette(nodeType: string) {
    // Click on the node type in the palette
    const paletteNode = this.page
      .locator(
        `[data-testid="palette-node-${nodeType}"], [data-node-type="${nodeType}"]`,
      )
      .first();
    await paletteNode.click();

    // Click on the canvas to place the node
    const canvasBox = await this.canvas.boundingBox();
    if (canvasBox) {
      await this.page.mouse.click(
        canvasBox.x + canvasBox.width / 2,
        canvasBox.y + canvasBox.height / 2,
      );
    }
  }

  /**
   * Select a node by clicking on it
   */
  async selectNode(nodeIndex: number = 0) {
    const node = this.nodes.nth(nodeIndex);
    await node.click();
  }

  /**
   * Save the flow
   */
  async saveFlow() {
    await this.saveButton.click();
  }

  /**
   * Undo last action
   */
  async undo() {
    await this.undoButton.click();
  }

  /**
   * Redo last undone action
   */
  async redo() {
    await this.redoButton.click();
  }

  /**
   * Run/execute the flow
   */
  async runFlow() {
    await this.playButton.click();
  }

  /**
   * Wait for the editor to be ready
   */
  async waitForReady() {
    await this.canvas.waitFor({ state: "visible", timeout: 10000 });
    // Give React Flow a moment to initialize
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if a specific UI element is visible
   */
  async isUIElementVisible(
    element: "toolbar" | "leftSidebar" | "rightSidebar" | "minimap" | "grid",
  ): Promise<boolean> {
    const elements = {
      toolbar: this.toolbar,
      leftSidebar: this.leftSidebar,
      rightSidebar: this.rightSidebar,
      minimap: this.minimap,
      grid: this.grid,
    };

    try {
      await elements[element].waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
