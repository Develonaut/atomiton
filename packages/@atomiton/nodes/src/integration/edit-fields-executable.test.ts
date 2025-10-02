/**
 * Integration tests for edit-fields node executable
 * Tests Handlebars templating, field creation, and data transformation
 */

import { describe, expect, it } from "vitest";
import { editFieldsExecutable } from "#executables/edit-fields";

type EditFieldsResult = { result: Record<string, unknown> };

describe("Edit Fields Executable Integration", () => {
  describe("Basic Field Creation", () => {
    it("should create new fields with static values", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {},
        values: {
          name: "John Doe",
          age: 30,
          active: true,
        },
        keepOnlySet: false,
      })) as { result: Record<string, unknown> };
      expect(result).toHaveProperty("result");
      expect(result.result).toEqual({
        name: "John Doe",
        age: 30,
        active: true,
      });
    });

    it("should merge new fields with existing input data", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { existing: "value", count: 10 },
        },
        values: {
          name: "Alice",
          status: "active",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;
      expect(result.result).toEqual({
        existing: "value",
        count: 10,
        name: "Alice",
        status: "active",
      });
    });

    it("should override existing fields with new values", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { name: "Old Name", status: "inactive" },
        },
        values: {
          name: "New Name",
          status: "active",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result).toEqual({
        name: "New Name",
        status: "active",
      });
    });
  });

  describe("keepOnlySet Functionality", () => {
    it("should keep only set fields when keepOnlySet is true", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { existing: "value", another: "field", count: 10 },
        },
        values: {
          name: "Alice",
          status: "active",
        },
        keepOnlySet: true,
      })) as EditFieldsResult;

      expect(result.result).toEqual({
        name: "Alice",
        status: "active",
      });
      expect(result.result).not.toHaveProperty("existing");
      expect(result.result).not.toHaveProperty("another");
      expect(result.result).not.toHaveProperty("count");
    });

    it("should keep all fields when keepOnlySet is false", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { existing: "value", count: 10 },
        },
        values: {
          name: "Alice",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result).toEqual({
        existing: "value",
        count: 10,
        name: "Alice",
      });
    });
  });

  describe("Template Interpolation", () => {
    it("should process template variables in string values", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { firstName: "John", lastName: "Doe" },
        },
        values: {
          fullName: "{{firstName}} {{lastName}}",
          greeting: "Hello, {{firstName}}!",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result.fullName).toBe("John Doe");
      expect(result.result.greeting).toBe("Hello, John!");
    });

    it("should access nested properties in templates", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: {
            user: {
              name: "Alice",
              email: "alice@example.com",
            },
            metadata: {
              version: "1.0",
            },
          },
        },
        values: {
          userInfo: "{{user.name}} ({{user.email}})",
          version: "Version {{metadata.version}}",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result.userInfo).toBe("Alice (alice@example.com)");
      expect(result.result.version).toBe("Version 1.0");
    });

    it("should handle missing template variables gracefully", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { firstName: "John" },
        },
        values: {
          message: "Hello {{firstName}} {{lastName}}",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      // Template engine renders missing variables as empty strings
      expect(result.result.message).toBe("Hello John ");
    });
  });

  describe("Built-in Template Helpers", () => {
    it("should support $now helper for timestamps", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {},
        values: {
          timestamp: "{{$now}}",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      // Verify it's an ISO timestamp
      expect(result.result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // Verify it's recent (within last 5 seconds)
      const timestamp = new Date(result.result.timestamp as string);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      expect(diffMs).toBeLessThan(5000);
    });

    it("should combine $now with other template values", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { user: "Alice" },
        },
        values: {
          message: "User {{user}} logged in at {{$now}}",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result.message).toMatch(/^User Alice logged in at \d{4}-/);
    });
  });

  describe("Non-String Values", () => {
    it("should preserve non-string values without templating", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { name: "John" },
        },
        values: {
          age: 30,
          active: true,
          score: 95.5,
          items: [1, 2, 3],
          metadata: { key: "value" },
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result.age).toBe(30);
      expect(result.result.active).toBe(true);
      expect(result.result.score).toBe(95.5);
      expect(result.result.items).toEqual([1, 2, 3]);
      expect(result.result.metadata).toEqual({ key: "value" });
    });

    it("should mix string templates with non-string values", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { name: "Alice", count: 5 },
        },
        values: {
          message: "Hello {{name}}",
          age: 25,
          active: true,
          multiplier: 2.5,
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result.message).toBe("Hello Alice");
      expect(result.result.age).toBe(25);
      expect(result.result.active).toBe(true);
      expect(result.result.multiplier).toBe(2.5);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty values object", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { existing: "data" },
        },
        values: {},
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result).toEqual({ existing: "data" });
    });

    it("should handle null values in config", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { existing: "data" },
        },
        values: {
          nullValue: null,
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result.nullValue).toBe(null);
    });

    it("should handle empty input data", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {},
        values: {
          name: "Alice",
          status: "active",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      expect(result.result).toEqual({
        name: "Alice",
        status: "active",
      });
    });

    it("should handle special characters in templates", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: { message: "Hello & goodbye", tag: "<script>" },
        },
        values: {
          output: "Message: {{message}}, Tag: {{tag}}",
        },
        keepOnlySet: false,
      })) as EditFieldsResult;

      // Handlebars escapes HTML by default with {{}}
      expect(result.result.output).toMatch(/Message: Hello &amp; goodbye/);
      expect(result.result.output).toMatch(/Tag: &lt;script&gt;/);
    });
  });

  describe("Complex Real-World Scenarios", () => {
    it("should build user profile from multiple fields", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            role: "developer",
          },
        },
        values: {
          fullName: "{{firstName}} {{lastName}}",
          displayName: "{{firstName}} ({{role}})",
          contactInfo: "Email: {{email}}",
          createdAt: "{{$now}}",
          active: true,
        },
        keepOnlySet: true,
      })) as EditFieldsResult;

      expect(result.result).toHaveProperty("fullName", "John Doe");
      expect(result.result).toHaveProperty("displayName", "John (developer)");
      expect(result.result).toHaveProperty(
        "contactInfo",
        "Email: john.doe@example.com",
      );
      expect(result.result).toHaveProperty("active", true);
      expect(result.result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.result).not.toHaveProperty("firstName");
      expect(result.result).not.toHaveProperty("lastName");
    });

    it("should transform API response into structured data", async () => {
      const result = (await editFieldsExecutable.execute({
        nodeId: "test-node",
        executionId: "test-exec",
        input: {
          data: {
            api_response: {
              user_id: 123,
              user_name: "alice_wonder",
              user_email: "alice@wonder.land",
            },
            metadata: {
              version: "2.0",
              source: "API",
            },
          },
        },
        values: {
          id: "{{api_response.user_id}}",
          username: "{{api_response.user_name}}",
          email: "{{api_response.user_email}}",
          source: "Data from {{metadata.source}} v{{metadata.version}}",
          processedAt: "{{$now}}",
        },
        keepOnlySet: true,
      })) as EditFieldsResult;

      expect(result.result.id).toBe("123");
      expect(result.result.username).toBe("alice_wonder");
      expect(result.result.email).toBe("alice@wonder.land");
      expect(result.result.source).toBe("Data from API v2.0");
      expect(result.result.processedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
