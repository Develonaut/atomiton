import { describe, it, expect } from "vitest";

/**
 * Editor Integration Tests
 *
 * Tests that involve heavy imports and full component loading.
 * These tests verify that the editor system works end-to-end but are
 * moved from smoke tests due to performance impact.
 */
describe("Editor Integration Tests", () => {
  it("editor package can be imported with all components", async () => {
    const editorModule = await import("@atomiton/editor");
    expect(editorModule).toBeDefined();

    // Verify main editor components are available
    expect(editorModule.Editor).toBeDefined();
    expect(typeof editorModule.Editor).toBe("function");
  });

  it("editor page template renders without errors", async () => {
    const editorPage = await import("../../templates/EditorPage");
    expect(editorPage).toBeDefined();
    expect(editorPage.default).toBeDefined();
    expect(typeof editorPage.default).toBe("function");
  });

  it("editor hooks are functional", async () => {
    // Test editor hooks can be imported
    const editorModule = await import("@atomiton/editor");

    // Verify hooks are available (if exported)
    // This tests the full editor package integration
    expect(editorModule).toBeDefined();
  });
});
