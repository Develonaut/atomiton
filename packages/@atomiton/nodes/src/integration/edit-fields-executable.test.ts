/**
 * Integration tests for edit-fields node executable
 * Tests Handlebars templating, field creation, and data transformation
 */

import { describe, expect, it } from "vitest";
import { editFieldsExecutable } from "#executables/edit-fields";

type EditFieldsResult = { data: Record<string, unknown> };

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
      })) as { data: Record<string, unknown> };
      expect(result).toHaveProperty("data");
      expect(result.data).toEqual({
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
      expect(result.data).toEqual({
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

      expect(result.data).toEqual({
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

      expect(result.data).toEqual({
        name: "Alice",
        status: "active",
      });
      expect(result.data).not.toHaveProperty("existing");
      expect(result.data).not.toHaveProperty("another");
      expect(result.data).not.toHaveProperty("count");
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

      expect(result.data).toEqual({
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

      expect(result.data.fullName).toBe("John Doe");
      expect(result.data.greeting).toBe("Hello, John!");
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

      expect(result.data.userInfo).toBe("Alice (alice@example.com)");
      expect(result.data.version).toBe("Version 1.0");
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
      expect(result.data.message).toBe("Hello John ");
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
      expect(result.data.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // Verify it's recent (within last 5 seconds)
      const timestamp = new Date(result.data.timestamp as string);
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

      expect(result.data.message).toMatch(/^User Alice logged in at \d{4}-/);
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

      expect(result.data.age).toBe(30);
      expect(result.data.active).toBe(true);
      expect(result.data.score).toBe(95.5);
      expect(result.data.items).toEqual([1, 2, 3]);
      expect(result.data.metadata).toEqual({ key: "value" });
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

      expect(result.data.message).toBe("Hello Alice");
      expect(result.data.age).toBe(25);
      expect(result.data.active).toBe(true);
      expect(result.data.multiplier).toBe(2.5);
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

      expect(result.data).toEqual({ existing: "data" });
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

      expect(result.data.nullValue).toBe(null);
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

      expect(result.data).toEqual({
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
      expect(result.data.output).toMatch(/Message: Hello &amp; goodbye/);
      expect(result.data.output).toMatch(/Tag: &lt;script&gt;/);
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

      expect(result.data).toHaveProperty("fullName", "John Doe");
      expect(result.data).toHaveProperty("displayName", "John (developer)");
      expect(result.data).toHaveProperty(
        "contactInfo",
        "Email: john.doe@example.com",
      );
      expect(result.data).toHaveProperty("active", true);
      expect(result.data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.data).not.toHaveProperty("firstName");
      expect(result.data).not.toHaveProperty("lastName");
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

      expect(result.data.id).toBe("123");
      expect(result.data.username).toBe("alice_wonder");
      expect(result.data.email).toBe("alice@wonder.land");
      expect(result.data.source).toBe("Data from API v2.0");
      expect(result.data.processedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
