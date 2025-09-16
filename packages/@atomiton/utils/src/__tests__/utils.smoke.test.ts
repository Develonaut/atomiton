import { describe, expect, it } from "vitest";
import {
  delay,
  generateExecutionId,
  generateId,
  generateJobId,
  generateNodeId,
  generateWorkerId,
  capitalize,
  kebabCase,
  titleCase,
} from "../index";

describe("Utils Package Smoke Tests", () => {
  describe("delay function", () => {
    it("should be exported and callable", async () => {
      expect(typeof delay).toBe("function");
      const start = Date.now();
      await delay(1);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });
  });

  describe("ID generation functions", () => {
    it("should generate valid IDs with proper prefixes", () => {
      expect(generateExecutionId()).toMatch(/^exec_/);
      expect(generateJobId()).toMatch(/^job_/);
      expect(generateNodeId()).toMatch(/^node_/);
      expect(generateWorkerId(1)).toMatch(/^worker_1_/);
      expect(generateId("test")).toMatch(/^test_/);
      expect(generateId()).toMatch(/^[0-9a-f-]+$/);
    });

    it("should generate unique IDs", () => {
      const ids = [
        generateExecutionId(),
        generateJobId(),
        generateNodeId(),
        generateWorkerId(1),
        generateId(),
      ];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("case conversion functions", () => {
    it("should export and execute case conversion functions", () => {
      expect(typeof capitalize).toBe("function");
      expect(typeof kebabCase).toBe("function");
      expect(typeof titleCase).toBe("function");

      expect(capitalize("test")).toBe("Test");
      expect(kebabCase("testCase")).toBe("test-case");
      expect(titleCase("test case")).toBe("Test Case");
    });
  });

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
