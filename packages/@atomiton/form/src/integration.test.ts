import { describe, it, expect } from "vitest";
import { z } from "zod";
import { generateFieldsFromSchema, getDefaultValues } from "./utils/index.js";

describe("Integration Tests", () => {
  it("generates working field configurations", () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number().min(18),
      active: z.boolean(),
      role: z.enum(["user", "admin"]),
      bio: z.string().optional(),
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
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      active: z.boolean(),
    });

    const defaults = getDefaultValues(schema);

    expect(defaults).toEqual({
      name: "",
      age: 0,
      active: false,
    });
  });

  it("supports field metadata overrides", () => {
    const schema = z.object({
      description: z.string(),
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
