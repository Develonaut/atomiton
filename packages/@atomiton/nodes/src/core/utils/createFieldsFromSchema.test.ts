/**
 * Tests for createFieldsFromSchema utility
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import v from "@atomiton/validation";
import { describe, expect, it } from "vitest";

describe("createFieldsFromSchema", () => {
  describe("Basic Type Inference", () => {
    it("should infer text control from string", () => {
      const schema = v.object({
        name: v.string(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.name).toMatchObject({
        controlType: "text",
        label: "Name",
        required: true,
      });
    });

    it("should infer number control from number", () => {
      const schema = v.object({
        count: v.number(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.count).toMatchObject({
        controlType: "number",
        label: "Count",
        required: true,
      });
    });

    it("should infer boolean control from boolean", () => {
      const schema = v.object({
        enabled: v.boolean(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        required: true,
      });
    });

    it("should infer select control from enum", () => {
      const schema = v.object({
        status: v.enum(["active", "inactive", "pending"]),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.status).toMatchObject({
        controlType: "select",
        label: "Status",
        required: true,
      });
      expect(fields.status.options).toEqual([
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ]);
    });

    it("should infer json control from object", () => {
      const schema = v.object({
        config: v.object({
          key: v.string(),
        }),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.config).toMatchObject({
        controlType: "json",
        label: "Config",
        required: true,
      });
    });

    it("should infer json control from array", () => {
      const schema = v.object({
        items: v.array(v.string()),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.items).toMatchObject({
        controlType: "json",
        label: "Items",
        required: true,
      });
    });

    it("should infer json control from record", () => {
      const schema = v.object({
        headers: v.record(v.string()),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.headers).toMatchObject({
        controlType: "json",
        label: "Headers",
        required: true,
      });
    });

    it("should infer email control from string with email validation", () => {
      const schema = v.object({
        email: v.string().email(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.email).toMatchObject({
        controlType: "email",
        label: "Email",
        required: true,
      });
    });

    it("should infer url control from string with url validation", () => {
      const schema = v.object({
        website: v.string().url(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.website).toMatchObject({
        controlType: "url",
        label: "Website",
        required: true,
      });
    });
  });

  describe("Constraint Extraction", () => {
    it("should extract min constraint from number", () => {
      const schema = v.object({
        age: v.number().min(18),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.age.min).toBe(18);
    });

    it("should extract max constraint from number", () => {
      const schema = v.object({
        score: v.number().max(100),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.score.max).toBe(100);
    });

    it("should extract both min and max constraints", () => {
      const schema = v.object({
        timeout: v.number().min(1000).max(300000),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.timeout.min).toBe(1000);
      expect(fields.timeout.max).toBe(300000);
    });
  });

  describe("Optional Fields", () => {
    it("should mark optional fields as not required", () => {
      const schema = v.object({
        description: v.string().optional(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.description.required).toBe(false);
    });

    it("should correctly infer type from optional fields", () => {
      const schema = v.object({
        count: v.number().optional(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.count).toMatchObject({
        controlType: "number",
        required: false,
      });
    });

    it("should extract constraints from optional fields", () => {
      const schema = v.object({
        timeout: v.number().min(1000).max(5000).optional(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.timeout).toMatchObject({
        controlType: "number",
        required: false,
        min: 1000,
        max: 5000,
      });
    });
  });

  describe("Default Values", () => {
    it("should create placeholder from string default", () => {
      const schema = v.object({
        name: v.string().default("John"),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.name.placeholder).toBe("Default: John");
    });

    it("should create placeholder from number default", () => {
      const schema = v.object({
        count: v.number().default(10),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.count.placeholder).toBe("Default: 10");
    });

    it("should create placeholder from boolean default", () => {
      const schema = v.object({
        enabled: v.boolean().default(true),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.enabled.placeholder).toBe("Default: true");
    });

    it("should create placeholder from object default", () => {
      const schema = v.object({
        config: v.object({ key: v.string() }).default({ key: "value" }),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.config.placeholder).toBe('Default: {"key":"value"}');
    });
  });

  describe("Description Extraction", () => {
    it("should extract description as helpText", () => {
      const schema = v.object({
        timeout: v.number().describe("Request timeout in milliseconds"),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.timeout.helpText).toBe("Request timeout in milliseconds");
    });

    it("should work with optional fields", () => {
      const schema = v.object({
        description: v
          .string()
          .optional()
          .describe("Optional description field"),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.description.helpText).toBe("Optional description field");
    });
  });

  describe("Label Formatting", () => {
    it("should format camelCase to Title Case", () => {
      const schema = v.object({
        maxIterations: v.number(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.maxIterations.label).toBe("Max Iterations");
    });

    it("should format snake_case to Title Case", () => {
      const schema = v.object({
        http_timeout: v.number(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.http_timeout.label).toBe("Http Timeout");
    });

    it("should format kebab-case to Title Case", () => {
      const schema = v.object({
        "retry-delay": v.number(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields["retry-delay"].label).toBe("Retry Delay");
    });

    it("should handle single word fields", () => {
      const schema = v.object({
        timeout: v.number(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.timeout.label).toBe("Timeout");
    });

    it("should handle acronyms in field names", () => {
      const schema = v.object({
        urlPath: v.string(),
      });

      const fields = createFieldsFromSchema(schema);

      expect(fields.urlPath.label).toBe("Url Path");
    });
  });

  describe("Override Application", () => {
    it("should allow overriding controlType", () => {
      const schema = v.object({
        code: v.string(),
      });

      const fields = createFieldsFromSchema(schema, {
        code: {
          controlType: "code",
        },
      });

      expect(fields.code.controlType).toBe("code");
    });

    it("should allow overriding label", () => {
      const schema = v.object({
        timeout: v.number(),
      });

      const fields = createFieldsFromSchema(schema, {
        timeout: {
          label: "Timeout Duration",
        },
      });

      expect(fields.timeout.label).toBe("Timeout Duration");
    });

    it("should allow adding custom placeholder", () => {
      const schema = v.object({
        path: v.string(),
      });

      const fields = createFieldsFromSchema(schema, {
        path: {
          placeholder: "./output/file.txt",
        },
      });

      expect(fields.path.placeholder).toBe("./output/file.txt");
    });

    it("should allow adding rows for textarea", () => {
      const schema = v.object({
        description: v.string(),
      });

      const fields = createFieldsFromSchema(schema, {
        description: {
          controlType: "textarea",
          rows: 5,
        },
      });

      expect(fields.description).toMatchObject({
        controlType: "textarea",
        rows: 5,
      });
    });

    it("should allow overriding enum options with custom labels", () => {
      const schema = v.object({
        method: v.enum(["GET", "POST"]),
      });

      const fields = createFieldsFromSchema(schema, {
        method: {
          options: [
            { value: "GET", label: "GET - Retrieve data" },
            { value: "POST", label: "POST - Create data" },
          ],
        },
      });

      expect(fields.method.options).toEqual([
        { value: "GET", label: "GET - Retrieve data" },
        { value: "POST", label: "POST - Create data" },
      ]);
    });

    it("should merge derived config with overrides", () => {
      const schema = v.object({
        timeout: v.number().min(1000).max(5000).describe("Timeout in ms"),
      });

      const fields = createFieldsFromSchema(schema, {
        timeout: {
          label: "Request Timeout",
          step: 100,
        },
      });

      expect(fields.timeout).toMatchObject({
        controlType: "number",
        label: "Request Timeout", // overridden
        helpText: "Timeout in ms", // from schema
        min: 1000, // from schema
        max: 5000, // from schema
        step: 100, // from override
        required: true,
      });
    });
  });

  describe("Field Inclusion", () => {
    it("should include all fields from schema (no filtering)", () => {
      const schema = v.object({
        id: v.string(),
        type: v.string(),
        enabled: v.boolean(),
        timeout: v.number(),
        retries: v.number(),
        label: v.string().optional(),
        description: v.string().optional(),
        customField: v.string(),
      });

      const fields = createFieldsFromSchema(schema);

      // All fields should be included (no base field filtering)
      expect(Object.keys(fields)).toEqual([
        "id",
        "type",
        "enabled",
        "timeout",
        "retries",
        "label",
        "description",
        "customField",
      ]);
    });
  });

  describe("Complex Real-World Example", () => {
    it("should handle HTTP request schema correctly", () => {
      const schema = v.object({
        method: v
          .enum(["GET", "POST", "PUT", "DELETE"])
          .default("GET")
          .describe("HTTP method to use"),

        url: v.string().url().describe("Request URL"),

        headers: v.record(v.string()).default({}).describe("Request headers"),

        body: v.string().optional().describe("Request body content"),

        timeout: v
          .number()
          .min(1000)
          .max(300000)
          .default(30000)
          .describe("Request timeout in milliseconds"),
      });

      const fields = createFieldsFromSchema(schema, {
        method: {
          options: [
            { value: "GET", label: "GET - Retrieve data" },
            { value: "POST", label: "POST - Create data" },
            { value: "PUT", label: "PUT - Update data" },
            { value: "DELETE", label: "DELETE - Remove data" },
          ],
        },
        headers: {
          controlType: "textarea",
          rows: 3,
        },
        body: {
          controlType: "textarea",
          rows: 5,
        },
      });

      // Method field
      expect(fields.method).toMatchObject({
        controlType: "select",
        label: "Method",
        helpText: "HTTP method to use",
        placeholder: "Default: GET",
        required: true,
      });
      expect(fields.method.options).toHaveLength(4);

      // URL field (auto-derived)
      expect(fields.url).toMatchObject({
        controlType: "url",
        label: "Url",
        helpText: "Request URL",
        required: true,
      });

      // Headers field (overridden to textarea)
      expect(fields.headers).toMatchObject({
        controlType: "textarea",
        label: "Headers",
        helpText: "Request headers",
        placeholder: "Default: {}",
        rows: 3,
        required: true,
      });

      // Body field (optional, overridden to textarea)
      expect(fields.body).toMatchObject({
        controlType: "textarea",
        label: "Body",
        helpText: "Request body content",
        rows: 5,
        required: false,
      });

      // Timeout field (auto-derived with constraints)
      expect(fields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Request timeout in milliseconds",
        placeholder: "Default: 30000",
        min: 1000,
        max: 300000,
        required: true,
      });
    });
  });
});
