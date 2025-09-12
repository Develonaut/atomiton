import { describe, it, expect } from "vitest";
import { z } from "zod";
import { generateFieldsFromSchema } from "./generateFieldsFromSchema.js";

describe("generateFieldsFromSchema", () => {
  describe("basic functionality", () => {
    it("generates fields from simple object schema", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        active: z.boolean(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result).toHaveLength(3);

      expect(result[0]).toEqual({
        name: "name",
        type: "text",
        label: "Name",
        required: true,
        placeholder: undefined,
        helpText: undefined,
        options: undefined,
        min: undefined,
        max: undefined,
        step: undefined,
        disabled: undefined,
        group: undefined,
        order: undefined,
      });

      expect(result[1]).toEqual({
        name: "age",
        type: "number",
        label: "Age",
        required: true,
        placeholder: undefined,
        helpText: undefined,
        options: undefined,
        min: undefined,
        max: undefined,
        step: undefined,
        disabled: undefined,
        group: undefined,
        order: undefined,
      });

      expect(result[2]).toEqual({
        name: "active",
        type: "boolean",
        label: "Active",
        required: true,
        placeholder: undefined,
        helpText: undefined,
        options: undefined,
        min: undefined,
        max: undefined,
        step: undefined,
        disabled: undefined,
        group: undefined,
        order: undefined,
      });
    });

    it("generates fields with proper labels from camelCase names", () => {
      const schema = z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date(),
        phoneNumber: z.string(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].label).toBe("FirstName");
      expect(result[1].label).toBe("LastName");
      expect(result[2].label).toBe("DateOfBirth");
      expect(result[3].label).toBe("PhoneNumber");
    });

    it("handles empty object schema", () => {
      const schema = z.object({});
      const result = generateFieldsFromSchema(schema);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe("field metadata merging", () => {
    it("merges custom labels", () => {
      const schema = z.object({
        name: z.string(),
      });

      const fields = {
        name: {
          label: "Full Name",
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].label).toBe("Full Name");
    });

    it("merges control type overrides", () => {
      const schema = z.object({
        description: z.string(),
      });

      const fields = {
        description: {
          controlType: "textarea" as const,
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].type).toBe("textarea");
    });

    it("merges placeholder text", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const fields = {
        email: {
          placeholder: "Enter your email address",
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].placeholder).toBe("Enter your email address");
    });

    it("merges help text", () => {
      const schema = z.object({
        password: z.string(),
      });

      const fields = {
        password: {
          helpText: "Must be at least 8 characters long",
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].helpText).toBe("Must be at least 8 characters long");
    });

    it("merges custom options for select fields", () => {
      const schema = z.object({
        status: z.enum(["active", "inactive"]),
      });

      const fields = {
        status: {
          options: [
            { label: "Active User", value: "active" },
            { label: "Inactive User", value: "inactive" },
          ],
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].options).toEqual([
        { label: "Active User", value: "active" },
        { label: "Inactive User", value: "inactive" },
      ]);
    });

    it("preserves inferred options when no custom options provided", () => {
      const schema = z.object({
        status: z.enum(["draft", "published"]),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].options).toEqual([
        { label: "draft", value: "draft" },
        { label: "published", value: "published" },
      ]);
    });

    it("merges number constraints", () => {
      const schema = z.object({
        score: z.number().min(0).max(100),
      });

      const fields = {
        score: {
          min: 10, // Override min
          step: 5,
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].min).toBe(10); // Custom override
      expect(result[0].max).toBe(100); // From schema
      expect(result[0].step).toBe(5); // Custom
    });

    it("merges required field overrides", () => {
      const schema = z.object({
        optional: z.string().optional(),
        required: z.string(),
      });

      const fields = {
        optional: {
          required: true, // Override
        },
        required: {
          required: false, // Override
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].required).toBe(true);
      expect(result[1].required).toBe(false);
    });

    it("merges disabled state", () => {
      const schema = z.object({
        readOnly: z.string(),
      });

      const fields = {
        readOnly: {
          disabled: true,
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].disabled).toBe(true);
    });

    it("merges group information", () => {
      const schema = z.object({
        firstName: z.string(),
        lastName: z.string(),
      });

      const fields = {
        firstName: {
          group: "personal",
        },
        lastName: {
          group: "personal",
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].group).toBe("personal");
      expect(result[1].group).toBe("personal");
    });

    it("merges order information", () => {
      const schema = z.object({
        third: z.string(),
        first: z.string(),
        second: z.string(),
      });

      const fields = {
        first: { order: 1 },
        second: { order: 2 },
        third: { order: 3 },
      };

      const result = generateFieldsFromSchema(schema, fields);

      // Note: order doesn't change the array order, just adds metadata
      expect(result[0].name).toBe("third");
      expect(result[0].order).toBe(3);
      expect(result[1].name).toBe("first");
      expect(result[1].order).toBe(1);
      expect(result[2].name).toBe("second");
      expect(result[2].order).toBe(2);
    });
  });

  describe("complex field types", () => {
    it("handles optional fields correctly", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
        nullable: z.string().nullable(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].required).toBe(true);
      expect(result[1].required).toBe(false);
      expect(result[2].required).toBe(false);
    });

    it("handles email and url fields", () => {
      const schema = z.object({
        email: z.string().email(),
        website: z.string().url(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].type).toBe("email");
      expect(result[1].type).toBe("url");
    });

    it("handles number fields with constraints", () => {
      const schema = z.object({
        age: z.number().min(18).max(120),
        score: z.number().max(100),
        rating: z.number().min(1),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0]).toMatchObject({
        type: "number",
        min: 18,
        max: 120,
      });
      expect(result[1]).toMatchObject({
        type: "number",
        max: 100,
      });
      expect(result[2]).toMatchObject({
        type: "number",
        min: 1,
      });
    });

    it("handles enum fields", () => {
      const schema = z.object({
        size: z.enum(["small", "medium", "large"]),
        priority: z.enum(["low", "high"]),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0]).toMatchObject({
        type: "select",
        options: [
          { label: "small", value: "small" },
          { label: "medium", value: "medium" },
          { label: "large", value: "large" },
        ],
      });
      expect(result[1]).toMatchObject({
        type: "select",
        options: [
          { label: "low", value: "low" },
          { label: "high", value: "high" },
        ],
      });
    });

    it("handles date fields", () => {
      const schema = z.object({
        birthDate: z.date(),
        createdAt: z.date().optional(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0]).toMatchObject({
        type: "date",
        required: true,
      });
      expect(result[1]).toMatchObject({
        type: "date",
        required: false,
      });
    });
  });

  describe("comprehensive field merging", () => {
    it("merges all possible field metadata", () => {
      const schema = z.object({
        bio: z.string().optional(),
      });

      const fields = {
        bio: {
          label: "Biography",
          placeholder: "Tell us about yourself...",
          helpText: "This will appear on your profile",
          controlType: "textarea" as const,
          disabled: false,
          group: "profile",
          order: 5,
          required: true, // Override optional
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0]).toEqual({
        name: "bio",
        type: "textarea",
        label: "Biography",
        placeholder: "Tell us about yourself...",
        helpText: "This will appear on your profile",
        options: undefined,
        min: undefined,
        max: undefined,
        step: undefined,
        required: true,
        disabled: false,
        group: "profile",
        order: 5,
      });
    });

    it("handles partial field metadata", () => {
      const schema = z.object({
        title: z.string(),
      });

      const fields = {
        title: {
          label: "Post Title",
          // Only providing label, others should be undefined
        },
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0]).toEqual({
        name: "title",
        type: "text",
        label: "Post Title",
        placeholder: undefined,
        helpText: undefined,
        options: undefined,
        min: undefined,
        max: undefined,
        step: undefined,
        required: true,
        disabled: undefined,
        group: undefined,
        order: undefined,
      });
    });
  });

  describe("error handling", () => {
    it("throws error for non-object schemas", () => {
      const stringSchema = z.string();

      expect(() => generateFieldsFromSchema(stringSchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });

    it("throws error for array schemas", () => {
      const arraySchema = z.array(z.string());

      expect(() => generateFieldsFromSchema(arraySchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });

    it("throws error for number schemas", () => {
      const numberSchema = z.number();

      expect(() => generateFieldsFromSchema(numberSchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });

    it("throws error for union schemas", () => {
      const unionSchema = z.union([z.string(), z.number()]);

      expect(() => generateFieldsFromSchema(unionSchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });
  });

  describe("edge cases", () => {
    it("handles fields with no metadata provided", () => {
      const schema = z.object({
        field1: z.string(),
        field2: z.number(),
      });

      const fields = {
        field1: {
          label: "Field 1",
        },
        // field2 has no metadata
      };

      const result = generateFieldsFromSchema(schema, fields);

      expect(result[0].label).toBe("Field 1");
      expect(result[1].label).toBe("Field2"); // Auto-generated
    });

    it("handles empty fields metadata object", () => {
      const schema = z.object({
        name: z.string(),
      });

      const result = generateFieldsFromSchema(schema, {});

      expect(result[0].label).toBe("Name"); // Auto-generated
    });

    it("handles undefined fields parameter", () => {
      const schema = z.object({
        name: z.string(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].label).toBe("Name"); // Auto-generated
    });

    it("preserves field order from schema definition", () => {
      const schema = z.object({
        zulu: z.string(),
        alpha: z.string(),
        beta: z.string(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result.map((f) => f.name)).toEqual(["zulu", "alpha", "beta"]);
    });
  });
});
