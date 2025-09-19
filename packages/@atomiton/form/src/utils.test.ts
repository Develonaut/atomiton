import v from "@atomiton/validation";
import { describe, expect, it } from "vitest";
import {
  generateFieldsFromSchema,
  getDefaultValues,
  mapZodTypeToControl,
} from "./utils/index";

describe("mapZodTypeToControl", () => {
  it("maps string to text input", () => {
    const schema = v.string();
    const result = mapZodTypeToControl(schema, "test");

    expect(result).toEqual({
      name: "test",
      type: "text",
      required: true,
    });
  });

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

  it("maps number to number input with min/max", () => {
    const schema = v.number().min(1).max(10);
    const result = mapZodTypeToControl(schema, "count");

    expect(result).toEqual({
      name: "count",
      type: "number",
      required: true,
      min: 1,
      max: 10,
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

  it("maps enum to select input", () => {
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

  it("maps date to date input", () => {
    const schema = v.date();
    const result = mapZodTypeToControl(schema, "birthday");

    expect(result).toEqual({
      name: "birthday",
      type: "date",
      required: true,
    });
  });

  it("handles optional fields", () => {
    const schema = v.string().optional();
    const result = mapZodTypeToControl(schema, "optional");

    expect(result.required).toBe(false);
  });

  it("handles nullable fields", () => {
    const schema = v.string().nullable();
    const result = mapZodTypeToControl(schema, "nullable");

    expect(result.required).toBe(false);
  });
});

describe("generateFieldsFromSchema", () => {
  it("generates fields from object schema", () => {
    const schema = v.object({
      name: v.string(),
      age: v.number().min(0),
      email: v.string().email().optional(),
    });

    const result = generateFieldsFromSchema(schema);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("name");
    expect(result[0].type).toBe("text");
    expect(result[0].label).toBe("Name");
    expect(result[0].required).toBe(true);

    expect(result[1].name).toBe("age");
    expect(result[1].type).toBe("number");
    expect(result[1].min).toBe(0);
    expect(result[1].required).toBe(true);

    expect(result[2].name).toBe("email");
    expect(result[2].type).toBe("email");
    expect(result[2].required).toBe(false);
  });

  it("merges fields metadata", () => {
    const schema = v.object({
      name: v.string(),
    });

    const fields = {
      name: {
        label: "Full Name",
        placeholder: "Enter your name",
        helpText: "Your display name",
        controlType: "textarea" as const,
      },
    };

    const result = generateFieldsFromSchema(schema, fields);

    expect(result[0].type).toBe("textarea"); // Override from controlType
    expect(result[0].label).toBe("Full Name");
    expect(result[0].placeholder).toBe("Enter your name");
    expect(result[0].helpText).toBe("Your display name");
  });

  it("throws error for non-object schemas", () => {
    const schema = v.string();

    expect(() => generateFieldsFromSchema(schema)).toThrow(
      "Schema must be a ZodObject",
    );
  });
});

describe("getDefaultValues", () => {
  it("generates default values for object schema", () => {
    const schema = v.object({
      name: v.string(),
      age: v.number(),
      active: v.boolean(),
      email: v.string().optional(),
      birthdate: v.date().nullable(),
    });

    const result = getDefaultValues(schema);

    expect(result).toEqual({
      name: "",
      age: 0,
      active: false,
      email: undefined,
      birthdate: undefined,
    });
  });

  it("returns empty object for non-object schemas", () => {
    const schema = v.string();
    const result = getDefaultValues(schema);

    expect(result).toEqual({});
  });
});
