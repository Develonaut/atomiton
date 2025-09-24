import { mapZodTypeToControl } from "#mapZodTypeToControl";
import v from "@atomiton/validation";
import { describe, expect, it } from "vitest";

describe("mapZodTypeToControl", () => {
  describe("basic types", () => {
    it("maps string to text input", () => {
      const schema = v.string();
      const result = mapZodTypeToControl(schema, "test");

      expect(result).toEqual({
        name: "test",
        type: "text",
        required: true,
      });
    });

    it("maps number to number input", () => {
      const schema = v.number();
      const result = mapZodTypeToControl(schema, "count");

      expect(result).toEqual({
        name: "count",
        type: "number",
        required: true,
      });
    });

    it("maps boolean to boolean input", () => {
      const schema = v.boolean();
      const result = mapZodTypeToControl(schema, "active");

      expect(result).toEqual({
        name: "active",
        type: "boolean",
        required: true,
      });
    });

    it("maps date to date input", () => {
      const schema = v.date();
      const result = mapZodTypeToControl(schema, "birthday");

      expect(result).toEqual({
        name: "birthday",
        type: "date",
        required: true,
      });
    });

    it("maps unknown types to text input", () => {
      // Create a custom schema that doesn't match known types
      const schema = v.any();
      const result = mapZodTypeToControl(schema, "unknown");

      expect(result).toEqual({
        name: "unknown",
        type: "text",
        required: true,
      });
    });
  });

  describe("string validations", () => {
    it("maps email string to email input", () => {
      const schema = v.string().email();
      const result = mapZodTypeToControl(schema, "email");

      expect(result).toEqual({
        name: "email",
        type: "email",
        required: true,
      });
    });

    it("maps url string to url input", () => {
      const schema = v.string().url();
      const result = mapZodTypeToControl(schema, "website");

      expect(result).toEqual({
        name: "website",
        type: "url",
        required: true,
      });
    });

    it("prioritizes email over other validations", () => {
      const schema = v.string().email().min(5);
      const result = mapZodTypeToControl(schema, "contact");

      expect(result.type).toBe("email");
    });

    it("prioritizes url over other validations except email", () => {
      const schema = v.string().url().min(5);
      const result = mapZodTypeToControl(schema, "link");

      expect(result.type).toBe("url");
    });

    it("handles string with only length validations", () => {
      const schema = v.string().min(3).max(50);
      const result = mapZodTypeToControl(schema, "title");

      expect(result).toEqual({
        name: "title",
        type: "text",
        required: true,
      });
    });
  });

  describe("number validations", () => {
    it("maps number with min constraint", () => {
      const schema = v.number().min(1);
      const result = mapZodTypeToControl(schema, "count");

      expect(result).toEqual({
        name: "count",
        type: "number",
        required: true,
        min: 1,
      });
    });

    it("maps number with max constraint", () => {
      const schema = v.number().max(100);
      const result = mapZodTypeToControl(schema, "percentage");

      expect(result).toEqual({
        name: "percentage",
        type: "number",
        required: true,
        max: 100,
      });
    });

    it("maps number with min and max constraints", () => {
      const schema = v.number().min(18).max(120);
      const result = mapZodTypeToControl(schema, "age");

      expect(result).toEqual({
        name: "age",
        type: "number",
        required: true,
        min: 18,
        max: 120,
      });
    });

    it("handles number with no constraints", () => {
      const schema = v.number();
      const result = mapZodTypeToControl(schema, "value");

      expect(result).toEqual({
        name: "value",
        type: "number",
        required: true,
      });
    });

    it("handles number with step validation", () => {
      const schema = v.number().step(0.01);
      const result = mapZodTypeToControl(schema, "price");

      expect(result).toEqual({
        name: "price",
        type: "number",
        required: true,
      });
    });
  });

  describe("enum types", () => {
    it("maps string enum to select input", () => {
      const schema = v.enum(["red", "green", "blue"]);
      const result = mapZodTypeToControl(schema, "color");

      expect(result).toEqual({
        name: "color",
        type: "select",
        required: true,
        options: [
          { label: "red", value: "red" },
          { label: "green", value: "green" },
          { label: "blue", value: "blue" },
        ],
      });
    });

    it("maps number enum to select input", () => {
      const schema = v.enum(["1", "2", "3"]);
      const result = mapZodTypeToControl(schema, "rating");

      expect(result).toEqual({
        name: "rating",
        type: "select",
        required: true,
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
        ],
      });
    });

    it("handles single value enum", () => {
      const schema = v.enum(["only"]);
      const result = mapZodTypeToControl(schema, "single");

      expect(result).toEqual({
        name: "single",
        type: "select",
        required: true,
        options: [{ label: "only", value: "only" }],
      });
    });
  });

  describe("optional and nullable types", () => {
    it("handles optional string", () => {
      const schema = v.string().optional();
      const result = mapZodTypeToControl(schema, "optional");

      expect(result.required).toBe(false);
      expect(result.type).toBe("text");
      expect(result.name).toBe("optional");
    });

    it("handles nullable string", () => {
      const schema = v.string().nullable();
      const result = mapZodTypeToControl(schema, "nullable");

      expect(result.required).toBe(false);
      expect(result.type).toBe("text");
      expect(result.name).toBe("nullable");
    });

    it("handles optional email", () => {
      const schema = v.string().email().optional();
      const result = mapZodTypeToControl(schema, "email");

      expect(result.required).toBe(false);
      expect(result.type).toBe("email");
    });

    it("handles optional number with constraints", () => {
      const schema = v.number().min(1).max(10).optional();
      const result = mapZodTypeToControl(schema, "score");

      expect(result).toEqual({
        name: "score",
        type: "number",
        required: false,
        min: 1,
        max: 10,
      });
    });

    it("handles optional enum", () => {
      const schema = v.enum(["a", "b"]).optional();
      const result = mapZodTypeToControl(schema, "choice");

      expect(result.required).toBe(false);
      expect(result.type).toBe("select");
      expect(result.options).toEqual([
        { label: "a", value: "a" },
        { label: "b", value: "b" },
      ]);
    });

    it("handles nullable boolean", () => {
      const schema = v.boolean().nullable();
      const result = mapZodTypeToControl(schema, "flag");

      expect(result.required).toBe(false);
      expect(result.type).toBe("boolean");
    });

    it("handles nullable date", () => {
      const schema = v.date().nullable();
      const result = mapZodTypeToControl(schema, "expiry");

      expect(result.required).toBe(false);
      expect(result.type).toBe("date");
    });
  });

  describe("nested optional/nullable combinations", () => {
    it("handles optional nullable", () => {
      const schema = v.string().nullable().optional();
      const result = mapZodTypeToControl(schema, "field");

      expect(result.required).toBe(false);
      expect(result.type).toBe("text");
    });

    it("handles nullable optional", () => {
      const schema = v.string().optional().nullable();
      const result = mapZodTypeToControl(schema, "field");

      expect(result.required).toBe(false);
      expect(result.type).toBe("text");
    });
  });

  describe("edge cases", () => {
    it("handles empty field name", () => {
      const schema = v.string();
      const result = mapZodTypeToControl(schema, "");

      expect(result.name).toBe("");
    });

    it("handles field name with spaces", () => {
      const schema = v.string();
      const result = mapZodTypeToControl(schema, "field with spaces");

      expect(result.name).toBe("field with spaces");
    });

    it("handles field name with special characters", () => {
      const schema = v.string();
      const result = mapZodTypeToControl(schema, "field-name_123");

      expect(result.name).toBe("field-name_123");
    });
  });
});
