import v from "@atomiton/validation";
import { describe, expect, it } from "vitest";
import { generateFieldsFromSchema, getDefaultValues } from "#utils/index";

describe("Integration Tests", () => {
  it("generates working field configurations", () => {
    const schema = v.object({
      name: v.string(),
      email: v.string().email(),
      age: v.number().min(18),
      active: v.boolean(),
      role: v.enum(["user", "admin"]),
      bio: v.string().optional(),
    });

    const fields = generateFieldsFromSchema(schema);

    expect(fields).toHaveLength(6);
    expect(fields.map((f) => f.name)).toEqual([
      "name",
      "email",
      "age",
      "active",
      "role",
      "bio",
    ]);
    expect(fields.map((f) => f.type)).toEqual([
      "text",
      "email",
      "number",
      "boolean",
      "select",
      "text",
    ]);
  });

  it("generates correct default values", () => {
    const schema = v.object({
      name: v.string(),
      age: v.number(),
      active: v.boolean(),
    });

    const defaults = getDefaultValues(schema);

    expect(defaults).toEqual({
      name: "",
      age: 0,
      active: false,
    });
  });

  it("supports field metadata overrides", () => {
    const schema = v.object({
      description: v.string(),
    });

    const fieldsMetadata = {
      description: {
        controlType: "textarea" as const,
        label: "Description",
        placeholder: "Enter description...",
      },
    };

    const fields = generateFieldsFromSchema(schema, fieldsMetadata);

    expect(fields[0].type).toBe("textarea");
    expect(fields[0].label).toBe("Description");
    expect(fields[0].placeholder).toBe("Enter description...");
  });
});
