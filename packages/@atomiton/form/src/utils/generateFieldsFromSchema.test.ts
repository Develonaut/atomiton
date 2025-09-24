import { generateFieldsFromSchema } from "#generateFieldsFromSchema";
import v from "@atomiton/validation";
import { describe, expect, it } from "vitest";

describe("generateFieldsFromSchema", () => {
  describe("basic functionality", () => {
    it("generates fields from simple object schema", () => {
      const schema = v.object({
        name: v.string(),
        age: v.number(),
        active: v.boolean(),
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
      const schema = v.object({
        firstName: v.string(),
        lastName: v.string(),
        dateOfBirth: v.date(),
        phoneNumber: v.string(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].label).toBe("FirstName");
      expect(result[1].label).toBe("LastName");
      expect(result[2].label).toBe("DateOfBirth");
      expect(result[3].label).toBe("PhoneNumber");
    });

    it("handles empty object schema", () => {
      const schema = v.object({});
      const result = generateFieldsFromSchema(schema);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe("field metadata merging", () => {
    it("merges custom labels", () => {
      const schema = v.object({
        name: v.string(),
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
      const schema = v.object({
        description: v.string(),
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
      const schema = v.object({
        email: v.string().email(),
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
      const schema = v.object({
        password: v.string(),
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
      const schema = v.object({
        status: v.enum(["active", "inactive"]),
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
      const schema = v.object({
        status: v.enum(["draft", "published"]),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].options).toEqual([
        { label: "draft", value: "draft" },
        { label: "published", value: "published" },
      ]);
    });

    it("merges number constraints", () => {
      const schema = v.object({
        score: v.number().min(0).max(100),
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
      const schema = v.object({
        optional: v.string().optional(),
        required: v.string(),
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
      const schema = v.object({
        readOnly: v.string(),
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
      const schema = v.object({
        firstName: v.string(),
        lastName: v.string(),
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
      const schema = v.object({
        third: v.string(),
        first: v.string(),
        second: v.string(),
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
      const schema = v.object({
        required: v.string(),
        optional: v.string().optional(),
        nullable: v.string().nullable(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].required).toBe(true);
      expect(result[1].required).toBe(false);
      expect(result[2].required).toBe(false);
    });

    it("handles email and url fields", () => {
      const schema = v.object({
        email: v.string().email(),
        website: v.string().url(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].type).toBe("email");
      expect(result[1].type).toBe("url");
    });

    it("handles number fields with constraints", () => {
      const schema = v.object({
        age: v.number().min(18).max(120),
        score: v.number().max(100),
        rating: v.number().min(1),
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
      const schema = v.object({
        size: v.enum(["small", "medium", "large"]),
        priority: v.enum(["low", "high"]),
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
      const schema = v.object({
        birthDate: v.date(),
        createdAt: v.date().optional(),
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
      const schema = v.object({
        bio: v.string().optional(),
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
      const schema = v.object({
        title: v.string(),
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
      const stringSchema = v.string();

      expect(() => generateFieldsFromSchema(stringSchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });

    it("throws error for array schemas", () => {
      const arraySchema = v.array(v.string());

      expect(() => generateFieldsFromSchema(arraySchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });

    it("throws error for number schemas", () => {
      const numberSchema = v.number();

      expect(() => generateFieldsFromSchema(numberSchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });

    it("throws error for union schemas", () => {
      const unionSchema = v.union([v.string(), v.number()]);

      expect(() => generateFieldsFromSchema(unionSchema)).toThrow(
        "Schema must be a ZodObject",
      );
    });
  });

  describe("edge cases", () => {
    it("handles fields with no metadata provided", () => {
      const schema = v.object({
        field1: v.string(),
        field2: v.number(),
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
      const schema = v.object({
        name: v.string(),
      });

      const result = generateFieldsFromSchema(schema, {});

      expect(result[0].label).toBe("Name"); // Auto-generated
    });

    it("handles undefined fields parameter", () => {
      const schema = v.object({
        name: v.string(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result[0].label).toBe("Name"); // Auto-generated
    });

    it("preserves field order from schema definition", () => {
      const schema = v.object({
        zulu: v.string(),
        alpha: v.string(),
        beta: v.string(),
      });

      const result = generateFieldsFromSchema(schema);

      expect(result.map((f) => f.name)).toEqual(["zulu", "alpha", "beta"]);
    });
  });
});
