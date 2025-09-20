import { describe, expect, it } from "vitest";
import {
  capitalize,
  delay,
  generateExecutionId,
  generateId,
  generateJobId,
  generateNodeId,
  generateWorkerId,
  kebabCase,
  titleCase,
} from "./index";

describe("Utils Package Contract", () => {
  describe("package exports", () => {
    it("should export all expected functions", () => {
      const expectedExports = [
        "delay",
        "generateExecutionId",
        "generateId",
        "generateJobId",
        "generateNodeId",
        "generateWorkerId",
        "capitalize",
        "kebabCase",
        "titleCase",
      ];

      const actualExports = [
        delay,
        generateExecutionId,
        generateId,
        generateJobId,
        generateNodeId,
        generateWorkerId,
        capitalize,
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
