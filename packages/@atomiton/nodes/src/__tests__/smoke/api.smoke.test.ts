/**
 * API Smoke Tests for @atomiton/nodes
 *
 * Minimal tests ensuring the public API is working
 */

import { describe, expect, it } from "vitest";
import * as BrowserAPI from "../../exports/browser";
import * as ExecutableAPI from "../../exports/executable";

describe("@atomiton/nodes API Smoke Tests", () => {
  describe("Browser Export", () => {
    it("exports node utility functions", () => {
      expect(BrowserAPI.getNodes).toBeDefined();
      expect(BrowserAPI.getNodesByCategory).toBeDefined();
      expect(BrowserAPI.getNodeByType).toBeDefined();
    });

    it("exports composite functionality", () => {
      expect(BrowserAPI.createCompositeNode).toBeDefined();
      expect(BrowserAPI.fromYaml).toBeDefined();
      expect(BrowserAPI.toYaml).toBeDefined();
      expect(BrowserAPI.templates).toBeDefined();
    });

    it("exports validation utilities", () => {
      expect(BrowserAPI.validateComposite).toBeDefined();
      expect(typeof BrowserAPI.validateComposite).toBe("function");
    });

    it("can create a composite node", () => {
      const composite = BrowserAPI.createCompositeNode({
        name: "Test",
        description: "Test",
        category: "test",
        nodes: [],
        edges: [],
      });
      expect(composite.type).toBe("composite");
    });

    it("templates are valid", () => {
      expect(BrowserAPI.templates.length).toBeGreaterThan(0);
      BrowserAPI.templates.forEach((t) => {
        expect(t.name).toBeDefined();
      });
    });
  });

  describe("Executable Export", () => {
    it("exports executable nodes collection", () => {
      expect(ExecutableAPI.nodes).toBeDefined();
      expect(typeof ExecutableAPI.nodes).toBe("object");
    });

    it("exports individual node executables", () => {
      expect(ExecutableAPI.codeExecutable).toBeDefined();
      expect(ExecutableAPI.transformExecutable).toBeDefined();
      expect(ExecutableAPI.parallelExecutable).toBeDefined();
    });

    it("exports execution utilities", () => {
      expect(ExecutableAPI.createSuccessResult).toBeDefined();
      expect(ExecutableAPI.createErrorResult).toBeDefined();
      expect(ExecutableAPI.validateRequiredInputs).toBeDefined();
    });

    it("exports node factory functions", () => {
      expect(ExecutableAPI.createAtomicNode).toBeDefined();
      expect(ExecutableAPI.createCompositeNode).toBeDefined();
    });
  });
});
