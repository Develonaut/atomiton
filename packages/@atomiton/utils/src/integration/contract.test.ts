import { describe, expect, it } from "vitest";
import {
  generateEdgeId,
  generateExecutionId,
  generateNodeId,
  kebabCase,
  titleCase,
} from "#index";

describe("Utils Package Contract", () => {
  describe("package exports", () => {
    it("should export all expected functions", () => {
      const expectedExports = [
        "generateEdgeId",
        "generateExecutionId",
        "generateNodeId",
        "kebabCase",
        "titleCase",
      ];

      const actualExports = [
        generateEdgeId,
        generateExecutionId,
        generateNodeId,
        kebabCase,
        titleCase,
      ];

      actualExports.forEach((exportedFunction, index) => {
        expect(typeof exportedFunction).toBe("function");
        expect(exportedFunction.name || expectedExports[index]).toBeTruthy();
      });
    });
  });
});
