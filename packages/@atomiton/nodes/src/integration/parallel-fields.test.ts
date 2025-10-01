/**
 * Integration tests for parallel node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { parallelFields } from "#definitions/parallel";
import { parallelSchema } from "#schemas/parallel";

describe("Parallel Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from parallelSchemaShape", () => {
      const fieldKeys = Object.keys(parallelFields);

      // Should include all custom fields
      expect(fieldKeys).toContain("concurrency");
      expect(fieldKeys).toContain("strategy");
      expect(fieldKeys).toContain("operationTimeout");
      expect(fieldKeys).toContain("globalTimeout");
      expect(fieldKeys).toContain("failFast");
      expect(fieldKeys).toContain("maintainOrder");
    });

    it("should have exactly 6 custom fields", () => {
      // Parallel node has 6 custom fields
      expect(Object.keys(parallelFields)).toHaveLength(6);
    });

    it("should have field config for custom fields", () => {
      const customFields = [
        "concurrency",
        "strategy",
        "operationTimeout",
        "globalTimeout",
        "failFast",
        "maintainOrder",
      ];

      for (const key of customFields) {
        expect(parallelFields[key]).toBeDefined();
        expect(parallelFields[key].controlType).toBeDefined();
        expect(parallelFields[key].label).toBeDefined();
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Concurrency Field", () => {
      it("should have range control type", () => {
        expect(parallelFields.concurrency.controlType).toBe("range");
      });

      it("should have correct label", () => {
        expect(parallelFields.concurrency.label).toBe("Concurrency");
      });

      it("should have correct min and max constraints", () => {
        expect(parallelFields.concurrency.min).toBe(1);
        expect(parallelFields.concurrency.max).toBe(50);
      });

      it("should have helpText", () => {
        expect(parallelFields.concurrency.helpText).toBe(
          "Maximum number of concurrent operations (1-50)",
        );
      });

      it("should use default value when not provided", () => {
        const result = parallelSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.concurrency).toBe(5);
        }
      });

      it("should reject values below minimum", () => {
        const result = parallelSchema.safeParse({
          concurrency: 0,
        });

        expect(result.success).toBe(false);
      });

      it("should reject values above maximum", () => {
        const result = parallelSchema.safeParse({
          concurrency: 51,
        });

        expect(result.success).toBe(false);
      });

      it("should accept values within range", () => {
        const result = parallelSchema.safeParse({
          concurrency: 10,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.concurrency).toBe(10);
        }
      });
    });

    describe("Strategy Field", () => {
      it("should have select control type", () => {
        expect(parallelFields.strategy.controlType).toBe("select");
      });

      it("should have correct label", () => {
        expect(parallelFields.strategy.label).toBe("Strategy");
      });

      it("should have helpText", () => {
        expect(parallelFields.strategy.helpText).toBe(
          "Parallel execution strategy",
        );
      });

      it("should have options defined", () => {
        expect(parallelFields.strategy.options).toBeDefined();
        expect(parallelFields.strategy.options).toHaveLength(3);
      });

      it("should use default value when not provided", () => {
        const result = parallelSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.strategy).toBe("allSettled");
        }
      });

      it("should accept 'all' strategy", () => {
        const result = parallelSchema.safeParse({
          strategy: "all",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.strategy).toBe("all");
        }
      });

      it("should accept 'race' strategy", () => {
        const result = parallelSchema.safeParse({
          strategy: "race",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.strategy).toBe("race");
        }
      });

      it("should accept 'allSettled' strategy", () => {
        const result = parallelSchema.safeParse({
          strategy: "allSettled",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.strategy).toBe("allSettled");
        }
      });

      it("should reject invalid strategy", () => {
        const result = parallelSchema.safeParse({
          strategy: "invalid",
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Operation Timeout Field", () => {
      it("should have number control type", () => {
        expect(parallelFields.operationTimeout.controlType).toBe("number");
      });

      it("should have correct label", () => {
        expect(parallelFields.operationTimeout.label).toBe(
          "Operation Timeout (ms)",
        );
      });

      it("should have correct min and max constraints", () => {
        expect(parallelFields.operationTimeout.min).toBe(1000);
        expect(parallelFields.operationTimeout.max).toBe(300000);
      });

      it("should have helpText", () => {
        expect(parallelFields.operationTimeout.helpText).toBe(
          "Timeout for each individual operation",
        );
      });

      it("should use default value when not provided", () => {
        const result = parallelSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.operationTimeout).toBe(30000);
        }
      });

      it("should reject values below minimum", () => {
        const result = parallelSchema.safeParse({
          operationTimeout: 500,
        });

        expect(result.success).toBe(false);
      });

      it("should reject values above maximum", () => {
        const result = parallelSchema.safeParse({
          operationTimeout: 400000,
        });

        expect(result.success).toBe(false);
      });

      it("should accept values within range", () => {
        const result = parallelSchema.safeParse({
          operationTimeout: 5000,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.operationTimeout).toBe(5000);
        }
      });
    });

    describe("Global Timeout Field", () => {
      it("should have number control type", () => {
        expect(parallelFields.globalTimeout.controlType).toBe("number");
      });

      it("should have correct label", () => {
        expect(parallelFields.globalTimeout.label).toBe("Global Timeout (ms)");
      });

      it("should have correct min and max constraints", () => {
        expect(parallelFields.globalTimeout.min).toBe(5000);
        expect(parallelFields.globalTimeout.max).toBe(600000);
      });

      it("should have helpText", () => {
        expect(parallelFields.globalTimeout.helpText).toBe(
          "Global timeout for all parallel operations",
        );
      });

      it("should use default value when not provided", () => {
        const result = parallelSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.globalTimeout).toBe(120000);
        }
      });

      it("should reject values below minimum", () => {
        const result = parallelSchema.safeParse({
          globalTimeout: 3000,
        });

        expect(result.success).toBe(false);
      });

      it("should reject values above maximum", () => {
        const result = parallelSchema.safeParse({
          globalTimeout: 700000,
        });

        expect(result.success).toBe(false);
      });

      it("should accept values within range", () => {
        const result = parallelSchema.safeParse({
          globalTimeout: 60000,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.globalTimeout).toBe(60000);
        }
      });
    });

    describe("Fail Fast Field", () => {
      it("should have boolean control type", () => {
        expect(parallelFields.failFast.controlType).toBe("boolean");
      });

      it("should have correct label", () => {
        expect(parallelFields.failFast.label).toBe("Fail Fast");
      });

      it("should have helpText", () => {
        expect(parallelFields.failFast.helpText).toBe(
          "Stop all operations on first error",
        );
      });

      it("should use default value when not provided", () => {
        const result = parallelSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.failFast).toBe(false);
        }
      });

      it("should accept true value", () => {
        const result = parallelSchema.safeParse({
          failFast: true,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.failFast).toBe(true);
        }
      });

      it("should reject non-boolean values", () => {
        const result = parallelSchema.safeParse({
          failFast: "true",
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Maintain Order Field", () => {
      it("should have boolean control type", () => {
        expect(parallelFields.maintainOrder.controlType).toBe("boolean");
      });

      it("should have correct label", () => {
        expect(parallelFields.maintainOrder.label).toBe("Maintain Order");
      });

      it("should have helpText", () => {
        expect(parallelFields.maintainOrder.helpText).toBe(
          "Maintain input order in results",
        );
      });

      it("should use default value when not provided", () => {
        const result = parallelSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.maintainOrder).toBe(true);
        }
      });

      it("should accept false value", () => {
        const result = parallelSchema.safeParse({
          maintainOrder: false,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.maintainOrder).toBe(false);
        }
      });

      it("should reject non-boolean values", () => {
        const result = parallelSchema.safeParse({
          maintainOrder: 1,
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should have correct default", () => {
      const result = parallelSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
      }
    });

    it("label field should be optional", () => {
      const result = parallelSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBeUndefined();
      }
    });

    it("description field should be optional", () => {
      const result = parallelSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("should accept custom label and description", () => {
      const result = parallelSchema.safeParse({
        label: "Batch Processor",
        description: "Process multiple items concurrently",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBe("Batch Processor");
        expect(result.data.description).toBe(
          "Process multiple items concurrently",
        );
      }
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const field of Object.values(parallelFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const field of Object.values(parallelFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node with all defaults", () => {
      const result = parallelSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.concurrency).toBe(5);
        expect(result.data.strategy).toBe("allSettled");
        expect(result.data.operationTimeout).toBe(30000);
        expect(result.data.globalTimeout).toBe(120000);
        expect(result.data.failFast).toBe(false);
        expect(result.data.maintainOrder).toBe(true);
        expect(result.data.enabled).toBe(true);
      }
    });

    it("should validate fully specified node", () => {
      const result = parallelSchema.safeParse({
        concurrency: 10,
        strategy: "all",
        operationTimeout: 60000,
        globalTimeout: 300000,
        failFast: true,
        maintainOrder: false,
        enabled: true,
        label: "API Batch Processor",
        description: "Process multiple API calls in parallel",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.concurrency).toBe(10);
        expect(result.data.strategy).toBe("all");
        expect(result.data.operationTimeout).toBe(60000);
        expect(result.data.globalTimeout).toBe(300000);
        expect(result.data.failFast).toBe(true);
        expect(result.data.maintainOrder).toBe(false);
      }
    });

    it("should validate node with race strategy", () => {
      const result = parallelSchema.safeParse({
        strategy: "race",
        concurrency: 20,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.strategy).toBe("race");
        expect(result.data.concurrency).toBe(20);
      }
    });

    it("should validate node with maximum concurrency", () => {
      const result = parallelSchema.safeParse({
        concurrency: 50,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.concurrency).toBe(50);
      }
    });

    it("should validate node with minimum concurrency", () => {
      const result = parallelSchema.safeParse({
        concurrency: 1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.concurrency).toBe(1);
      }
    });
  });

  describe("Invalid Examples", () => {
    it("should reject invalid concurrency (too low)", () => {
      const result = parallelSchema.safeParse({
        concurrency: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid concurrency (too high)", () => {
      const result = parallelSchema.safeParse({
        concurrency: 100,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid strategy", () => {
      const result = parallelSchema.safeParse({
        strategy: "invalid",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid operationTimeout (too low)", () => {
      const result = parallelSchema.safeParse({
        operationTimeout: 500,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid operationTimeout (too high)", () => {
      const result = parallelSchema.safeParse({
        operationTimeout: 500000,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid globalTimeout (too low)", () => {
      const result = parallelSchema.safeParse({
        globalTimeout: 3000,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid globalTimeout (too high)", () => {
      const result = parallelSchema.safeParse({
        globalTimeout: 700000,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean failFast", () => {
      const result = parallelSchema.safeParse({
        failFast: "false",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean maintainOrder", () => {
      const result = parallelSchema.safeParse({
        maintainOrder: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-number concurrency", () => {
      const result = parallelSchema.safeParse({
        concurrency: "5",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-number operationTimeout", () => {
      const result = parallelSchema.safeParse({
        operationTimeout: "30000",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-number globalTimeout", () => {
      const result = parallelSchema.safeParse({
        globalTimeout: "120000",
      });

      expect(result.success).toBe(false);
    });
  });
});
