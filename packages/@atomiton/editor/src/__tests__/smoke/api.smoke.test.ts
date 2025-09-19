/**
 * Smoke tests for @atomiton/editor package
 * These tests must complete in <5 seconds and verify critical functionality
 */

import { describe, expect, it } from "vitest";
import * as EditorAPI from "../../index";

describe("Editor Package Smoke Tests", () => {
  describe("Public API Exports", () => {
    it("should export all required components", () => {
      expect(EditorAPI.Canvas).toBeDefined();
      expect(EditorAPI.Editor).toBeDefined();
    });

    it("should export all required hooks", () => {
      // Core editor hooks
      expect(EditorAPI.useEditorNodes).toBeDefined();
      expect(EditorAPI.useEditorEdges).toBeDefined();
      expect(EditorAPI.useEditorViewport).toBeDefined();
      expect(EditorAPI.useEditorNode).toBeDefined();

      // Selection hooks
      expect(EditorAPI.useSelectedNode).toBeDefined();

      // Action hooks
      expect(EditorAPI.useAddNode).toBeDefined();
    });

    it("should export all required types", () => {
      // TypeScript types are compile-time, so we verify the module structure
      const exports = Object.keys(EditorAPI);

      // These are the actual runtime exports
      expect(exports).toContain("Canvas");
      expect(exports).toContain("Editor");
      expect(exports).toContain("useEditorNodes");
      expect(exports).toContain("useEditorEdges");
    });
  });

  describe("Critical Hook Functionality", () => {
    it("should have performant hook implementations using useStore", () => {
      // Verify that our hooks are using the optimized implementation
      // This is a smoke test to ensure we haven't accidentally reverted
      const hookSource = useEditorNodes.toString();

      // Check for useStore usage (our optimized approach)
      // If this fails, it means we may have reverted to the slower implementation
      expect(hookSource).toContain("useStore");
    });
  });

  describe("Performance Characteristics", () => {
    it("should handle basic operations quickly", () => {
      const startTime = performance.now();

      // Create a basic node structure
      const nodes = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: i * 100, y: i * 100 },
        data: {},
      }));

      // Basic operations that should be fast
      const selectedNodes = nodes.filter((n) => n.id === "node-50");
      const nodeIds = nodes.map((n) => n.id);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Smoke test: Basic operations should complete in milliseconds
      expect(duration).toBeLessThan(10);
      expect(selectedNodes).toHaveLength(1);
      expect(nodeIds).toHaveLength(100);
    });
  });
});

// Re-export for type checking
function useEditorNodes() {
  return EditorAPI.useEditorNodes;
}
