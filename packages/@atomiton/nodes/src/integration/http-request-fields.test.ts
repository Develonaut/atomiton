/**
 * Integration tests for http-request node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { httpRequestFields } from "#definitions/http-request/fields";
import { httpRequestSchema } from "#schemas/http-request";

describe("HTTP Request Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(httpRequestFields);

      // Should include all fields from httpRequestSchemaShape
      expect(fieldKeys).toContain("method");
      expect(fieldKeys).toContain("url");
      expect(fieldKeys).toContain("headers");
      expect(fieldKeys).toContain("body");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 9 fields total", () => {
      // 4 http-request-specific + 5 base fields
      expect(Object.keys(httpRequestFields)).toHaveLength(9);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(httpRequestSchema.shape);

      for (const key of schemaKeys) {
        expect(httpRequestFields[key]).toBeDefined();
        expect(httpRequestFields[key].controlType).toBeDefined();
        expect(httpRequestFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(httpRequestSchema.shape);
      const fieldKeys = Object.keys(httpRequestFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Method Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(httpRequestFields.method.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(httpRequestFields.method.options).toEqual([
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(httpRequestFields.method.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(httpRequestFields.method.placeholder).toBe("Default: GET");
      });

      it("should have helpText from schema description", () => {
        expect(httpRequestFields.method.helpText).toBe("HTTP method to use");
      });

      it("should use default value when not provided", () => {
        const result = httpRequestSchema.safeParse({
          url: "https://api.example.com",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.method).toBe("GET");
        }
      });

      it("should validate enum values", () => {
        const validMethods = ["GET", "POST", "PUT", "DELETE"];

        for (const method of validMethods) {
          const result = httpRequestSchema.safeParse({
            method,
            url: "https://api.example.com",
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid method", () => {
        const result = httpRequestSchema.safeParse({
          method: "PATCH",
          url: "https://api.example.com",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("URL Field", () => {
      it("should have url control type (auto-derived from string with url validation)", () => {
        expect(httpRequestFields.url.controlType).toBe("url");
      });

      it("should be required (no default, not optional)", () => {
        expect(httpRequestFields.url.required).toBe(true);
      });

      it("should have helpText from schema description", () => {
        expect(httpRequestFields.url.helpText).toBe("Request URL");
      });

      it("should have auto-formatted label", () => {
        expect(httpRequestFields.url.label).toBe("Url");
      });

      it("should reject missing url", () => {
        const result = httpRequestSchema.safeParse({
          method: "GET",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].path).toContain("url");
        }
      });

      it("should reject invalid URL", () => {
        const result = httpRequestSchema.safeParse({
          url: "not-a-url",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toContain("valid URL");
        }
      });

      it("should accept valid URLs", () => {
        const validUrls = [
          "https://api.example.com",
          "http://localhost:3000",
          "https://api.example.com/users/123",
          "https://example.com:8080/path?query=value",
        ];

        for (const url of validUrls) {
          const result = httpRequestSchema.safeParse({ url });
          expect(result.success).toBe(true);
        }
      });
    });

    describe("Headers Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(httpRequestFields.headers.controlType).toBe("textarea");
      });

      it("should be required (has default but not optional)", () => {
        expect(httpRequestFields.headers.required).toBe(true);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(httpRequestFields.headers.placeholder).toBe(
          '{"Content-Type": "application/json", "Authorization": "Bearer token"}',
        );
      });

      it("should have custom rows (overridden)", () => {
        expect(httpRequestFields.headers.rows).toBe(3);
      });

      it("should have helpText from schema description", () => {
        expect(httpRequestFields.headers.helpText).toBe(
          "Request headers as key-value pairs (object or JSON string)",
        );
      });

      it("should use default value when not provided", () => {
        const result = httpRequestSchema.safeParse({
          url: "https://api.example.com",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.headers).toEqual({});
        }
      });

      it("should accept record objects", () => {
        const result = httpRequestSchema.safeParse({
          url: "https://api.example.com",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          },
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-string header values", () => {
        const result = httpRequestSchema.safeParse({
          url: "https://api.example.com",
          headers: {
            "Content-Type": 123,
          },
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Body Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(httpRequestFields.body.controlType).toBe("textarea");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(httpRequestFields.body.required).toBe(false);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(httpRequestFields.body.placeholder).toBe('{"key": "value"}');
      });

      it("should have custom rows (overridden)", () => {
        expect(httpRequestFields.body.rows).toBe(5);
      });

      it("should have helpText from schema description", () => {
        expect(httpRequestFields.body.helpText).toBe(
          "Request body content (string, object, or JSON string)",
        );
      });

      it("should accept undefined", () => {
        const result = httpRequestSchema.safeParse({
          url: "https://api.example.com",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.body).toBeUndefined();
        }
      });

      it("should accept string value", () => {
        const result = httpRequestSchema.safeParse({
          url: "https://api.example.com",
          body: '{"name": "John"}',
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-string value", () => {
        const result = httpRequestSchema.safeParse({
          url: "https://api.example.com",
          body: { name: "John" },
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(httpRequestFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(httpRequestFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(httpRequestFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = httpRequestSchema.safeParse({
        url: "https://api.example.com",
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(httpRequestFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(httpRequestFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(httpRequestFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(httpRequestFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const field of Object.values(httpRequestFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const field of Object.values(httpRequestFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      if (httpRequestFields.method.options) {
        expect(Array.isArray(httpRequestFields.method.options)).toBe(true);
        expect(httpRequestFields.method.options.length).toBeGreaterThan(0);

        for (const option of httpRequestFields.method.options) {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
        }
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = httpRequestSchema.safeParse({
        url: "https://api.example.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.method).toBe("GET");
        expect(result.data.headers).toEqual({});
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate GET request", () => {
      const result = httpRequestSchema.safeParse({
        method: "GET",
        url: "https://api.example.com/users",
        headers: { Authorization: "Bearer token" },
      });

      expect(result.success).toBe(true);
    });

    it("should validate POST request with body", () => {
      const result = httpRequestSchema.safeParse({
        method: "POST",
        url: "https://api.example.com/users",
        headers: { "Content-Type": "application/json" },
        body: '{"name": "John", "age": 30}',
      });

      expect(result.success).toBe(true);
    });

    it("should validate PUT request", () => {
      const result = httpRequestSchema.safeParse({
        method: "PUT",
        url: "https://api.example.com/users/123",
        body: '{"name": "Jane"}',
      });

      expect(result.success).toBe(true);
    });

    it("should validate DELETE request", () => {
      const result = httpRequestSchema.safeParse({
        method: "DELETE",
        url: "https://api.example.com/users/123",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject missing url", () => {
      const result = httpRequestSchema.safeParse({
        method: "GET",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("url");
      }
    });

    it("should reject invalid URL", () => {
      const result = httpRequestSchema.safeParse({
        url: "not-a-url",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid method", () => {
      const result = httpRequestSchema.safeParse({
        method: "PATCH",
        url: "https://api.example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid headers", () => {
      const result = httpRequestSchema.safeParse({
        url: "https://api.example.com",
        headers: "invalid",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string body", () => {
      const result = httpRequestSchema.safeParse({
        url: "https://api.example.com",
        body: { key: "value" },
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = httpRequestSchema.safeParse({
        url: "https://api.example.com",
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = httpRequestSchema.safeParse({
        url: "https://api.example.com",
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
