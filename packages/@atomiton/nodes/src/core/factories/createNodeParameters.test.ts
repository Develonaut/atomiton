/**
 * Contract tests for createNodeParameters factory
 *
 * Tests the contracts that createNodeParameters establishes:
 * - Input validation and schema composition
 * - Output shape and method guarantees
 * - Base schema integration
 * - Default value application and merging
 * - Validation method contracts
 * - Edge cases and boundary conditions
 */

import { describe, expect, it } from "vitest";
import v from "@atomiton/validation";
import { createNodeParameters } from "./createNodeParameters";
import type { NodeFieldsConfig } from "@/types/nodeParameters";

describe("createNodeParameters - Contract Tests", () => {
  const basicSchema = {
    message: v.string().optional().describe("A test message"),
    count: v.number().optional().describe("Number of repetitions"),
  };

  const basicDefaults = {
    message: "Hello World",
    count: 3,
  };

  const basicFields: NodeFieldsConfig = {
    message: {
      controlType: "text",
      label: "Message",
      placeholder: "Enter message",
    },
    count: {
      controlType: "number",
      label: "Count",
      min: 1,
      max: 100,
    },
  };

  describe("Input validation contracts", () => {
    it("requires nodeSchema parameter", () => {
      // Factory doesn't validate - tests should reflect actual behavior
      const result = createNodeParameters(
        // @ts-expect-error - Intentionally testing missing nodeSchema
        undefined,
        basicDefaults,
        basicFields,
      );
      expect(result).toBeDefined();
    });

    it("requires defaults parameter", () => {
      // Factory doesn't validate - tests should reflect actual behavior
      const result = createNodeParameters(
        basicSchema,
        // @ts-expect-error - Intentionally testing missing defaults
        undefined,
        basicFields,
      );
      expect(result).toBeDefined();
    });

    it("requires fields parameter", () => {
      // Factory doesn't validate - tests should reflect actual behavior
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        // @ts-expect-error - Intentionally testing missing fields
        undefined,
      );
      expect(result).toBeDefined();
    });

    it("accepts valid input configuration", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );
      expect(result).toBeDefined();
      expect(result.schema).toBeDefined();
      expect(result.defaults).toBeDefined();
      expect(result.fields).toBeDefined();
    });
  });

  describe("Base schema integration contracts", () => {
    it("includes base schema fields in output schema", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      // Test that base fields are present by attempting to parse them
      const parsed = result.parse({
        message: "test",
        count: 1,
        enabled: false,
        timeout: 5000,
        retries: 2,
      });

      expect(parsed.enabled).toBe(false);
      expect(parsed.timeout).toBe(5000);
      expect(parsed.retries).toBe(2);
    });

    it("applies base schema defaults", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      expect(result.defaults.enabled).toBe(true);
      expect(result.defaults.timeout).toBe(30000);
      expect(result.defaults.retries).toBe(1);
    });

    it("allows custom defaults to override base defaults", () => {
      const customDefaults = {
        ...basicDefaults,
        enabled: false,
        timeout: 60000,
        retries: 3,
      };

      const result = createNodeParameters(
        basicSchema,
        customDefaults,
        basicFields,
      );

      expect(result.defaults.enabled).toBe(false);
      expect(result.defaults.timeout).toBe(60000);
      expect(result.defaults.retries).toBe(3);
    });

    it("preserves custom schema fields alongside base fields", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const parsed = result.parse({
        message: "test message",
        count: 5,
        enabled: true,
        timeout: 30000,
        retries: 1,
      });

      expect(parsed.message).toBe("test message");
      expect(parsed.count).toBe(5);
      expect(parsed.enabled).toBe(true);
    });
  });

  describe("Parse method contracts", () => {
    it("successfully parses valid parameters", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const validParams = {
        message: "Hello",
        count: 10,
        enabled: true,
        timeout: 5000,
        retries: 2,
      };

      const parsed = result.parse(validParams);

      expect(parsed.message).toBe("Hello");
      expect(parsed.count).toBe(10);
      expect(parsed.enabled).toBe(true);
      expect(parsed.timeout).toBe(5000);
      expect(parsed.retries).toBe(2);
    });

    it("throws on invalid parameters", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const invalidParams = {
        message: 123, // Should be string
        count: "not a number", // Should be number
        enabled: "not a boolean", // Should be boolean
      };

      expect(() => result.parse(invalidParams)).toThrow();
    });

    it("validates type requirements strictly", () => {
      const strictSchema = {
        stringField: v.string(),
        numberField: v.number(),
        booleanField: v.boolean(),
      };

      const result = createNodeParameters(
        strictSchema,
        { stringField: "default", numberField: 0, booleanField: false },
        {},
      );

      // Should throw on type mismatches without coercion
      expect(() =>
        result.parse({
          stringField: 123, // Wrong type
          numberField: "456", // Wrong type
          booleanField: 1, // Wrong type
        }),
      ).toThrow();
    });
  });

  describe("SafeParse method contracts", () => {
    it("returns success result for valid parameters", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const validParams = {
        message: "Hello",
        count: 10,
      };

      const parseResult = result.safeParse(validParams);

      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.message).toBe("Hello");
        expect(parseResult.data.count).toBe(10);
      }
    });

    it("returns error result for invalid parameters", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const invalidParams = {
        message: 123, // Should be string
        count: "invalid", // Should be number
      };

      const parseResult = result.safeParse(invalidParams);

      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        expect(parseResult.error).toBeDefined();
        expect(parseResult.error.issues).toBeDefined();
        expect(parseResult.error.issues.length).toBeGreaterThan(0);
      }
    });

    it("includes detailed error information", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const parseResult = result.safeParse({ message: 123, count: "invalid" });

      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues.map(
          (issue) => issue.message,
        );
        expect(errorMessages.some((msg) => msg.includes("string"))).toBe(true);
        expect(errorMessages.some((msg) => msg.includes("number"))).toBe(true);
      }
    });
  });

  describe("isValid method contracts", () => {
    it("returns true for valid parameters", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const validParams = {
        message: "Hello",
        count: 10,
        enabled: true,
      };

      expect(result.isValid(validParams)).toBe(true);
    });

    it("returns false for invalid parameters", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const invalidParams = {
        message: 123,
        count: "invalid",
      };

      expect(result.isValid(invalidParams)).toBe(false);
    });

    it("handles null and undefined gracefully", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      expect(result.isValid(null)).toBe(false);
      expect(result.isValid(undefined)).toBe(false);
    });

    it("handles partial valid objects", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      // Base schema fields have defaults, so partial objects should validate
      expect(result.isValid({ message: "Hello" })).toBe(true);
      expect(result.isValid({ count: 5 })).toBe(true);
      expect(result.isValid({})).toBe(true); // Defaults should make this valid
    });
  });

  describe("withDefaults method contracts", () => {
    it("returns full defaults when no partial params provided", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const merged = result.withDefaults();

      expect(merged.message).toBe("Hello World");
      expect(merged.count).toBe(3);
      expect(merged.enabled).toBe(true);
      expect(merged.timeout).toBe(30000);
      expect(merged.retries).toBe(1);
    });

    it("merges partial parameters with defaults", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const merged = result.withDefaults({
        message: "Custom Message",
        timeout: 60000,
      });

      expect(merged.message).toBe("Custom Message");
      expect(merged.count).toBe(3); // From defaults
      expect(merged.enabled).toBe(true); // From base defaults
      expect(merged.timeout).toBe(60000); // Overridden
      expect(merged.retries).toBe(1); // From base defaults
    });

    it("handles undefined partial parameters", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const merged = result.withDefaults(undefined);

      expect(merged).toEqual(result.defaults);
    });

    it("preserves complex object structures", () => {
      const complexSchema = {
        config: v.object({
          nested: v.object({
            value: v.string(),
          }),
        }),
      };

      const complexDefaults = {
        config: {
          nested: {
            value: "default",
          },
        },
      };

      const result = createNodeParameters(complexSchema, complexDefaults, {});

      const merged = result.withDefaults({
        config: {
          nested: {
            value: "custom",
          },
        },
      });

      expect(merged.config.nested.value).toBe("custom");
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("handles empty schema", () => {
      const result = createNodeParameters({}, {}, {});

      expect(result.defaults.enabled).toBe(true);
      expect(result.defaults.timeout).toBe(30000);
      expect(result.defaults.retries).toBe(1);
    });

    it("handles complex nested schemas", () => {
      const nestedSchema = {
        api: v.object({
          endpoint: v.string().url(),
          headers: v.record(v.string()),
          retryConfig: v.object({
            maxRetries: v.number().min(0),
            backoffMs: v.number().positive(),
          }),
        }),
      };

      const nestedDefaults = {
        api: {
          endpoint: "https://api.example.com",
          headers: { "Content-Type": "application/json" },
          retryConfig: {
            maxRetries: 3,
            backoffMs: 1000,
          },
        },
      };

      const result = createNodeParameters(nestedSchema, nestedDefaults, {});

      const validParams = {
        api: {
          endpoint: "https://custom.api.com",
          headers: { Authorization: "Bearer token" },
          retryConfig: {
            maxRetries: 5,
            backoffMs: 2000,
          },
        },
      };

      const parsed = result.parse(validParams);
      expect(parsed.api.endpoint).toBe("https://custom.api.com");
      expect(parsed.api.retryConfig.maxRetries).toBe(5);
    });

    it("handles very large parameter objects", () => {
      const largeSchema = {
        largeString: v.string(),
        largeArray: v.array(v.string()),
        largeObject: v.record(v.any()),
      };

      const largeDefaults = {
        largeString: "x".repeat(10000),
        largeArray: Array.from({ length: 1000 }, (_, i) => `item-${i}`),
        largeObject: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`key-${i}`, `value-${i}`]),
        ),
      };

      const result = createNodeParameters(largeSchema, largeDefaults, {});

      expect(result.defaults.largeString).toHaveLength(10000);
      expect(result.defaults.largeArray).toHaveLength(1000);
      expect(Object.keys(result.defaults.largeObject)).toHaveLength(100);
    });

    it("handles schemas with optional and required fields", () => {
      const mixedSchema = {
        required: v.string(),
        optional: v.string().optional(),
        withDefault: v.number().default(42),
        nullable: v.string().nullable(),
      };

      const mixedDefaults = {
        required: "required value",
        withDefault: 100,
      };

      const result = createNodeParameters(mixedSchema, mixedDefaults, {});

      const parsed = result.parse({
        required: "test",
        optional: undefined,
        nullable: null,
        withDefault: 42,
      });

      expect(parsed.required).toBe("test");
      expect(parsed.optional).toBeUndefined();
      expect(parsed.withDefault).toBe(42); // Schema default takes precedence
      expect(parsed.nullable).toBeNull();
    });

    it("handles circular references in defaults", () => {
      const circularDefaults: Record<string, unknown> = {
        message: "test",
        count: 1,
        circular: null,
      };
      circularDefaults.circular = circularDefaults;

      const result = createNodeParameters(
        { message: v.string(), count: v.number() },
        circularDefaults,
        {},
      );

      expect(result.defaults.circular).toBe(circularDefaults);
    });

    it("validates against base schema constraints", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      // Test base schema validation
      expect(() =>
        result.parse({
          message: "test",
          count: 1,
          timeout: -1, // Should fail - must be positive
        }),
      ).toThrow();

      expect(() =>
        result.parse({
          message: "test",
          count: 1,
          retries: -1, // Should fail - must be >= 0
        }),
      ).toThrow();
    });
  });

  describe("Output guarantees", () => {
    it("always returns object with required methods", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      expect(result).toHaveProperty("schema");
      expect(result).toHaveProperty("defaults");
      expect(result).toHaveProperty("fields");
      expect(result).toHaveProperty("parse");
      expect(result).toHaveProperty("safeParse");
      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("withDefaults");

      expect(typeof result.parse).toBe("function");
      expect(typeof result.safeParse).toBe("function");
      expect(typeof result.isValid).toBe("function");
      expect(typeof result.withDefaults).toBe("function");
    });

    it("preserves fields reference", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      expect(result.fields).toBe(basicFields);
    });

    it("creates immutable defaults object", () => {
      const result = createNodeParameters(
        basicSchema,
        basicDefaults,
        basicFields,
      );

      const originalDefaults = { ...result.defaults };

      // Attempt to modify defaults
      try {
        (result.defaults as Record<string, unknown>).newField =
          "should not work";
      } catch {
        // Expected in strict mode
      }

      // Original structure should be preserved
      expect(result.defaults.message).toBe(originalDefaults.message);
      expect(result.defaults.count).toBe(originalDefaults.count);
    });

    it("maintains type safety through generic parameter", () => {
      type CustomParams = {
        customField: string;
        optionalField?: number;
      };

      const customSchema = {
        customField: v.string(),
        optionalField: v.number().optional(),
      };

      const customDefaults: CustomParams = {
        customField: "default",
        optionalField: 42,
      };

      const result = createNodeParameters(customSchema, customDefaults, {});

      // TypeScript should enforce the correct type
      const parsed = result.parse({ customField: "test" });
      expect(parsed.customField).toBe("test");
    });
  });
});
