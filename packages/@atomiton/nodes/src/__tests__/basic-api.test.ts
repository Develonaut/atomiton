/**
 * Basic API Test Suite
 *
 * Essential tests to verify the nodes package works correctly.
 * Focuses on core functionality without diving into implementation details.
 */

import { describe, it, expect } from "vitest";
import nodes from "../api";
import { ATOMIC_NODES } from "../atomic";
import type { NodeType } from "../types";

describe("Nodes Package - Core Functionality", () => {
  describe("Package Exports", () => {
    it("should export a working nodes API", () => {
      expect(nodes).toBeDefined();
      expect(typeof nodes.getAllNodes).toBe("function");
      expect(typeof nodes.getCategories).toBe("function");
      expect(typeof nodes.searchNodes).toBe("function");
    });

    it("should have registered nodes available", () => {
      expect(ATOMIC_NODES).toBeDefined();
      expect(Array.isArray(ATOMIC_NODES)).toBe(true);
      expect(ATOMIC_NODES.length).toBeGreaterThan(0);
    });
  });

  describe("Node Retrieval", () => {
    it("should return array of nodes", () => {
      const allNodes = nodes.getAllNodes();
      expect(Array.isArray(allNodes)).toBe(true);
      expect(allNodes.length).toBeGreaterThan(0);
    });

    it("should return categories", () => {
      const categories = nodes.getCategories();
      expect(Array.isArray(categories)).toBe(true);

      categories.forEach((category) => {
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("displayName");
        expect(category).toHaveProperty("items");
        expect(typeof category.name).toBe("string");
        expect(typeof category.displayName).toBe("string");
        expect(Array.isArray(category.items)).toBe(true);
      });
    });

    it("should find nodes by type", () => {
      const csvNode = nodes.getNodeMetadata("csv-reader");
      expect(csvNode).not.toBeNull();

      if (csvNode) {
        expect(csvNode.type).toBe("csv-reader");
      }
    });

    it("should return null for non-existent nodes", () => {
      const nonExistent = nodes.getNodeMetadata(
        "non-existent-type" as NodeType,
      );
      expect(nonExistent).toBeNull();
    });
  });

  describe("Search Functionality", () => {
    it("should search nodes", () => {
      const results = nodes.searchNodes("csv");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle empty search", () => {
      const results = nodes.searchNodes("");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle case insensitive search", () => {
      const lowerResults = nodes.searchNodes("csv");
      const upperResults = nodes.searchNodes("CSV");
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.map((r) => r.id)).toEqual(
        upperResults.map((r) => r.id),
      );
    });
  });

  describe("Node Structure Validation", () => {
    it("should have all registered nodes with basic structure", () => {
      const registeredNodes = nodes.getAllRegisteredNodes();

      expect(registeredNodes.length).toBeGreaterThan(0);

      registeredNodes.forEach((node) => {
        expect(node).toHaveProperty("definition");
        expect(node).toHaveProperty("metadata");
        expect(node).toHaveProperty("id");
        expect(node).toHaveProperty("name");
        expect(node).toHaveProperty("type");

        expect(node.definition).toHaveProperty("id");
        expect(node.definition).toHaveProperty("type");
        expect(node.definition).toHaveProperty("category");

        expect(node.metadata).toHaveProperty("id");
        expect(node.metadata).toHaveProperty("type");
        expect(node.metadata).toHaveProperty("category");
      });
    });

    it("should have consistent IDs between definition and metadata", () => {
      const registeredNodes = nodes.getAllRegisteredNodes();

      registeredNodes.forEach((node) => {
        expect(node.definition.id).toBe(node.metadata.id);
        expect(node.definition.type).toBe(node.metadata.type);
      });
    });
  });

  describe("API Operations", () => {
    it("should handle rapid API calls without corruption", () => {
      const results: unknown[] = [];

      // Simulate rapid API calls
      for (let i = 0; i < 100; i++) {
        results.push(nodes.getAllNodes());
      }

      expect(results).toHaveLength(100);

      // All results should have same length and node IDs
      const firstResult = results[0] as Array<{ id: string }>;
      results.forEach((result) => {
        const typedResult = result as Array<{ id: string }>;
        expect(typedResult.length).toBe(firstResult.length);
        expect(typedResult.map((r) => r.id)).toEqual(
          firstResult.map((r) => r.id),
        );
      });
    });

    it("should maintain consistent state across operations", () => {
      const initialNodes = nodes.getAllRegisteredNodes();

      // Perform various operations
      nodes.getAllNodes();
      nodes.getCategories();
      nodes.searchNodes("test");
      nodes.nodesByCategory();

      const finalNodes = nodes.getAllRegisteredNodes();
      expect(finalNodes).toEqual(initialNodes);
    });
  });

  describe("Category Management", () => {
    it("should organize nodes by category", () => {
      const categoryMap = nodes.nodesByCategory();
      expect(typeof categoryMap).toBe("object");

      Object.entries(categoryMap).forEach(([categoryName, categoryNodes]) => {
        expect(typeof categoryName).toBe("string");
        expect(Array.isArray(categoryNodes)).toBe(true);

        categoryNodes.forEach((node) => {
          expect(node.category).toBe(categoryName);
        });
      });
    });

    it("should get nodes by specific category", () => {
      const categories = nodes.getCategories();

      if (categories.length > 0) {
        const firstCategory = categories[0];
        const categoryNodes = nodes.getNodesByCategory(firstCategory.name);

        expect(Array.isArray(categoryNodes)).toBe(true);
        expect(categoryNodes.length).toBe(firstCategory.items.length);
      }
    });

    it("should handle non-existent categories gracefully", () => {
      const result = nodes.getNodesByCategory("non-existent-category");
      expect(result).toEqual([]);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed inputs gracefully", () => {
      // Test with strings that might cause issues but are still valid inputs
      expect(() => nodes.searchNodes("")).not.toThrow();
      expect(() => nodes.searchNodes("🚀")).not.toThrow();
      expect(() =>
        nodes.getNodeMetadata("invalid-type" as NodeType),
      ).not.toThrow();
      expect(() => nodes.getNodesByCategory("invalid-category")).not.toThrow();
    });

    it("should maintain stability after errors", () => {
      const initialCount = nodes.getAllRegisteredNodes().length;

      // Try operations that might fail but use valid string inputs
      try {
        nodes.getNodeMetadata("invalid" as NodeType);
        nodes.searchNodes("invalid-search");
        nodes.getNodesByCategory("invalid-category");
      } catch {
        // Ignore errors
      }

      // Should maintain state
      expect(nodes.getAllRegisteredNodes().length).toBe(initialCount);
    });
  });

  describe("Performance", () => {
    it("should perform basic operations quickly", () => {
      const startTime = performance.now();

      nodes.getAllNodes();
      nodes.getCategories();
      nodes.searchNodes("test");

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle large number of operations efficiently", () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        nodes.getAllNodes();
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe("TypeScript Integration", () => {
    it("should export proper TypeScript types", () => {
      const allNodes = nodes.getAllNodes();

      allNodes.forEach((node) => {
        expect(typeof node.id).toBe("string");
        expect(typeof node.type).toBe("string");
        expect(typeof node.category).toBe("string");
      });
    });

    it("should handle node type checking", () => {
      const validTypes = [
        "csv-reader",
        "file-system",
        "http-request",
        "shell-command",
        "image-composite",
        "transform",
        "code",
        "loop",
        "parallel",
      ];

      validTypes.forEach((type) => {
        const node = nodes.getNodeMetadata(type as NodeType);
        // Should either find the node or return null (if not implemented)
        expect(node === null || typeof node === "object").toBe(true);
      });
    });
  });

  describe("Initialization", () => {
    it("should initialize without errors", async () => {
      await expect(nodes.initialize()).resolves.not.toThrow();
    });

    it("should handle multiple initializations", async () => {
      await nodes.initialize();
      await nodes.initialize();
      await nodes.initialize();

      expect(nodes.isInitialized()).toBe(true);
    });
  });
});
