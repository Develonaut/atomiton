/**
 * Contract tests for createNodeMetadata factory
 *
 * Tests the contracts that createNodeMetadata establishes:
 * - Input validation and required field handling
 * - Output shape and type guarantees
 * - Default value application
 * - Title case transformation
 * - Keyword and tag generation
 * - Edge cases and boundary conditions
 */

import type { NodeCategory, NodeIcon, NodeRuntime } from "@/types/nodeMetadata";
import { describe, expect, it } from "vitest";
import {
  createNodeMetadata,
  type NodeMetadataInput,
} from "./createNodeMetadata";

describe("createNodeMetadata - Contract Tests", () => {
  const validInput: NodeMetadataInput = {
    id: "test-node",
    name: "test node",
    description: "A test node for validation",
    category: "utility" as NodeCategory,
    icon: "code-2" as NodeIcon,
  };

  describe("Input validation contracts", () => {
    it("provides default for missing id field", () => {
      const result = createNodeMetadata({
        name: "test",
        description: "test",
        category: "utility",
        icon: "code-2",
      });
      expect(result.id).toBe("node");
    });

    it("provides default for missing name field", () => {
      const result = createNodeMetadata({
        id: "test",
        description: "test",
        category: "utility",
        icon: "code-2",
      });
      expect(result.name).toBe("Node");
    });

    it("provides default for missing description field", () => {
      const result = createNodeMetadata({
        id: "test",
        name: "test",
        category: "utility",
        icon: "code-2",
      });
      expect(result.description).toBe("Test node");
    });

    it("provides default for missing category field", () => {
      const result = createNodeMetadata({
        id: "test",
        name: "test",
        description: "test",
        icon: "code-2",
      });
      expect(result.category).toBe("processing");
    });

    it("provides default for missing icon field", () => {
      const result = createNodeMetadata({
        id: "test",
        name: "test",
        description: "test",
        category: "utility",
      });
      expect(result.icon).toBe("Code");
    });

    it("accepts minimal valid input", () => {
      const result = createNodeMetadata(validInput);
      expect(result).toBeDefined();
      expect(result.id).toBe("test-node");
      expect(result.name).toBe("Test Node");
      expect(result.description).toBe("A test node for validation");
      expect(result.category).toBe("utility");
      expect(result.icon).toBe("code-2");
    });

    it("handles null/undefined input gracefully", () => {
      expect(() => {
        // @ts-expect-error - Intentionally testing null input
        createNodeMetadata(null);
      }).toThrow();

      expect(() => {
        // @ts-expect-error - Intentionally testing undefined input
        createNodeMetadata(undefined);
      }).toThrow();
    });
  });

  describe("Default value application contracts", () => {
    it("applies default variant from id when not provided", () => {
      const result = createNodeMetadata(validInput);
      expect(result.variant).toBe("test-node");
    });

    it("uses provided variant when specified", () => {
      const result = createNodeMetadata({
        ...validInput,
        variant: "test",
      });
      expect(result.variant).toBe("test");
    });

    it("applies default version", () => {
      const result = createNodeMetadata(validInput);
      expect(result.version).toBe("1.0.0");
    });

    it("uses provided version when specified", () => {
      const result = createNodeMetadata({
        ...validInput,
        version: "2.1.0",
      });
      expect(result.version).toBe("2.1.0");
    });

    it("applies default author", () => {
      const result = createNodeMetadata(validInput);
      expect(result.author).toBe("Atomiton Core Team");
    });

    it("uses provided author when specified", () => {
      const result = createNodeMetadata({
        ...validInput,
        author: "Custom Author",
      });
      expect(result.author).toBe("Custom Author");
    });

    it("applies default runtime", () => {
      const result = createNodeMetadata(validInput);
      expect(result.runtime).toEqual({ language: "typescript" });
    });

    it("uses provided runtime when specified", () => {
      const result = createNodeMetadata({
        ...validInput,
        runtime: { language: "python" as NodeRuntime },
      });
      expect(result.runtime).toEqual({ language: "python" });
    });

    it("applies default experimental flag", () => {
      const result = createNodeMetadata(validInput);
      expect(result.experimental).toBe(false);
    });

    it("applies default deprecated flag", () => {
      const result = createNodeMetadata(validInput);
      expect(result.deprecated).toBe(false);
    });

    it("preserves explicit false values", () => {
      const result = createNodeMetadata({
        ...validInput,
        experimental: false,
        deprecated: false,
      });
      expect(result.experimental).toBe(false);
      expect(result.deprecated).toBe(false);
    });

    it("preserves explicit true values", () => {
      const result = createNodeMetadata({
        ...validInput,
        experimental: true,
        deprecated: true,
      });
      expect(result.experimental).toBe(true);
      expect(result.deprecated).toBe(true);
    });
  });

  describe("Title case transformation contract", () => {
    it("transforms name to title case", () => {
      const testCases = [
        { input: "test node", expected: "Test Node" },
        { input: "HTTP REQUEST", expected: "Http Request" }, // titleCase capitalizes each word
        { input: "csv-reader node", expected: "Csv Reader Node" }, // titleCase converts hyphens to spaces
        { input: "file system manager", expected: "File System Manager" },
        { input: "a", expected: "A" },
        { input: "", expected: "" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = createNodeMetadata({
          ...validInput,
          name: input,
        });
        expect(result.name).toBe(expected);
      });
    });

    it("preserves original name in input", () => {
      const originalInput = { ...validInput, name: "test node" };
      createNodeMetadata(originalInput);
      expect(originalInput.name).toBe("test node");
    });
  });

  describe("Keyword generation contract", () => {
    it("generates keywords from id and name", () => {
      const result = createNodeMetadata({
        ...validInput,
        id: "http-request-node",
        name: "HTTP Request Handler",
      });

      expect(result.keywords).toContain("http");
      expect(result.keywords).toContain("request");
      expect(result.keywords).toContain("node");
      expect(result.keywords).toContain("handler");
    });

    it("filters out short words from keywords", () => {
      const result = createNodeMetadata({
        ...validInput,
        id: "a-b-test-node",
        name: "A B Test Node",
      });

      expect(result.keywords).not.toContain("a");
      expect(result.keywords).not.toContain("b");
      expect(result.keywords).toContain("test");
      expect(result.keywords).toContain("node");
    });

    it("removes duplicate keywords", () => {
      const result = createNodeMetadata({
        ...validInput,
        id: "test-test-node",
        name: "Test Test Handler",
      });

      const testCount =
        result.keywords?.filter((k) => k === "test").length || 0;
      expect(testCount).toBe(1);
    });

    it("uses provided keywords when specified", () => {
      const customKeywords = ["custom", "keywords", "list"];
      const result = createNodeMetadata({
        ...validInput,
        keywords: customKeywords,
      });

      expect(result.keywords).toEqual(customKeywords);
    });

    it("handles empty id and name for keyword generation", () => {
      const result = createNodeMetadata({
        ...validInput,
        id: "",
        name: "",
      });

      expect(result.keywords).toEqual([]);
    });
  });

  describe("Tag generation contract", () => {
    it("generates tags from id and category", () => {
      const result = createNodeMetadata({
        ...validInput,
        id: "http-request-node",
        category: "io",
      });

      expect(result.tags).toContain("http");
      expect(result.tags).toContain("request");
      expect(result.tags).toContain("node");
      expect(result.tags).toContain("io");
    });

    it("includes all id parts in tags", () => {
      const result = createNodeMetadata({
        ...validInput,
        id: "a-b-c-d",
      });

      expect(result.tags).toContain("a");
      expect(result.tags).toContain("b");
      expect(result.tags).toContain("c");
      expect(result.tags).toContain("d");
    });

    it("removes duplicate tags", () => {
      const result = createNodeMetadata({
        ...validInput,
        id: "utility-utility-node",
        category: "utility",
      });

      const utilityCount =
        result.tags?.filter((t) => t === "utility").length || 0;
      expect(utilityCount).toBe(1);
    });

    it("uses provided tags when specified", () => {
      const customTags = ["custom", "tags", "list"];
      const result = createNodeMetadata({
        ...validInput,
        tags: customTags,
      });

      expect(result.tags).toEqual(customTags);
    });
  });

  describe("Optional field handling contracts", () => {
    it("preserves optional fields when provided", () => {
      const result = createNodeMetadata({
        ...validInput,
        documentationUrl: "https://docs.example.com",
        examples: [
          {
            name: "Basic Example",
            description: "A basic usage example",
            config: { setting: "value" },
          },
        ],
      });

      expect(result.documentationUrl).toBe("https://docs.example.com");
      expect(result.examples).toHaveLength(1);
      expect(result.examples?.[0].name).toBe("Basic Example");
    });

    it("leaves optional fields undefined when not provided", () => {
      const result = createNodeMetadata(validInput);

      expect(result.documentationUrl).toBeUndefined();
      expect(result.examples).toBeUndefined();
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("handles very long strings", () => {
      const longString = "a".repeat(10000);
      const expectedTitleCase = "A" + "a".repeat(9999); // titleCase will capitalize first letter
      const result = createNodeMetadata({
        ...validInput,
        name: longString,
        description: longString,
        author: longString,
      });

      expect(result.name).toBe(expectedTitleCase);
      expect(result.description).toBe(longString);
      expect(result.author).toBe(longString);
    });

    it("handles special characters in strings", () => {
      const specialChars =
        "Node with 'quotes' and \"double quotes\" and \n newlines & symbols!@#$%^&*()";
      const result = createNodeMetadata({
        ...validInput,
        name: specialChars,
        description: specialChars,
      });

      // titleCase transforms the string, so check that essential content is preserved
      expect(result.name).toContain("'quotes'");
      expect(result.name).toContain('"double');
      expect(result.name.toLowerCase()).toContain("symbols");
      expect(result.description).toBe(specialChars);
    });

    it("handles empty strings", () => {
      const result = createNodeMetadata({
        id: "",
        name: "",
        description: "",
        category: "utility" as NodeCategory,
        icon: "code-2" as NodeIcon,
      });

      expect(result.id).toBe("");
      expect(result.name).toBe("");
      expect(result.description).toBe("");
    });

    it("handles all possible category values", () => {
      const categories: NodeCategory[] = [
        "io",
        "data",
        "logic",
        "media",
        "system",
        "ai",
        "database",
        "analytics",
        "communication",
        "utility",
        "user",
        "composite",
      ];

      categories.forEach((category) => {
        const result = createNodeMetadata({
          ...validInput,
          category,
        });
        expect(result.category).toBe(category);
      });
    });

    it("handles all possible icon values", () => {
      const icons: NodeIcon[] = [
        "file",
        "database",
        "cloud",
        "code-2",
        "wand-2",
        "zap",
        "cpu",
        "image",
        "mail",
        "message-square",
        "globe-2",
        "table-2",
        "terminal",
        "git-branch",
        "layers",
        "activity",
        "bar-chart",
        "lock",
        "unlock",
        "shield",
        "user",
        "users",
        "settings",
        "filter",
        "search",
        "plus",
        "minus",
        "check",
        "x",
        "alert-triangle",
        "info",
        "help-circle",
      ];

      icons.forEach((icon) => {
        const result = createNodeMetadata({
          ...validInput,
          icon,
        });
        expect(result.icon).toBe(icon);
      });
    });

    it("handles complex examples array", () => {
      const complexExamples = [
        {
          name: "Example 1",
          description: "First example",
          config: { nested: { object: { with: "values" } } },
        },
        {
          name: "Example 2",
          description: "Second example",
          config: { array: [1, 2, 3], boolean: true, null: null },
        },
      ];

      const result = createNodeMetadata({
        ...validInput,
        examples: complexExamples,
      });

      expect(result.examples).toEqual(complexExamples);
    });

    it("preserves exact config objects in examples", () => {
      const configWithCircularRef: Record<string, unknown> = { self: null };
      configWithCircularRef.self = configWithCircularRef;

      const result = createNodeMetadata({
        ...validInput,
        examples: [
          {
            name: "Circular Example",
            description: "Example with circular reference",
            config: configWithCircularRef,
          },
        ],
      });

      expect(result.examples?.[0].config).toBe(configWithCircularRef);
    });
  });

  describe("Output guarantees", () => {
    it("always returns all required NodeMetadata fields", () => {
      const result = createNodeMetadata(validInput);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("variant");
      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("icon");
      expect(result).toHaveProperty("keywords");
      expect(result).toHaveProperty("tags");
      expect(result).toHaveProperty("runtime");
      expect(result).toHaveProperty("experimental");
      expect(result).toHaveProperty("deprecated");
    });

    it("returns correct types for all fields", () => {
      const result = createNodeMetadata(validInput);

      expect(typeof result.id).toBe("string");
      expect(typeof result.name).toBe("string");
      expect(typeof result.variant).toBe("string");
      expect(typeof result.version).toBe("string");
      expect(typeof result.author).toBe("string");
      expect(typeof result.description).toBe("string");
      expect(typeof result.category).toBe("string");
      expect(typeof result.icon).toBe("string");
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(Array.isArray(result.tags)).toBe(true);
      expect(typeof result.runtime).toBe("object");
      expect(typeof result.experimental).toBe("boolean");
      expect(typeof result.deprecated).toBe("boolean");
    });

    it("does not include extra properties", () => {
      const inputWithExtra = {
        ...validInput,
        extraProperty: "should not appear",
      };

      const result = createNodeMetadata(
        inputWithExtra as typeof validInput & Record<string, unknown>,
      );

      expect(result).not.toHaveProperty("extraProperty");
    });

    it("maintains referential integrity for complex objects", () => {
      const runtime = { language: "python" as NodeRuntime };
      const examples = [{ name: "test", description: "test", config: {} }];

      const result = createNodeMetadata({
        ...validInput,
        runtime,
        examples,
      });

      expect(result.runtime).toEqual(runtime);
      expect(result.examples).toEqual(examples);
    });
  });
});
