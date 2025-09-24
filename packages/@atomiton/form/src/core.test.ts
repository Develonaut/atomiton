import { useForm } from "#useForm";
import { generateFieldsFromSchema, getDefaultValues } from "#utils/index";
import v from "@atomiton/validation";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Form Package Smoke Tests", () => {
  it("exports all required functions", () => {
    expect(useForm).toBeDefined();
    expect(generateFieldsFromSchema).toBeDefined();
    expect(getDefaultValues).toBeDefined();
  });

  it("creates form with basic schema", () => {
    const schema = v.object({
      name: v.string(),
      age: v.number(),
    });

    const { result } = renderHook(() => useForm({ schema }));

    expect(result.current).toBeDefined();
    expect(result.current.fields).toHaveLength(2);
    expect(result.current.handleSubmit).toBeDefined();
  });

  it("generates fields from schema", () => {
    const schema = v.object({
      email: v.string().email(),
      active: v.boolean(),
    });

    const fields = generateFieldsFromSchema(schema);

    expect(fields).toHaveLength(2);
    expect(fields[0].type).toBe("email");
    expect(fields[1].type).toBe("boolean");
  });

  it("generates default values", () => {
    const schema = v.object({
      name: v.string(),
      count: v.number(),
      active: v.boolean(),
    });

    const defaults = getDefaultValues(schema);

    expect(defaults).toEqual({
      name: "",
      count: 0,
      active: false,
    });
  });

  it("handles optional fields correctly", () => {
    const schema = v.object({
      required: v.string(),
      optional: v.string().optional(),
    });

    const fields = generateFieldsFromSchema(schema);
    const defaults = getDefaultValues(schema);

    expect(fields[0].required).toBe(true);
    expect(fields[1].required).toBe(false);
    expect(defaults.required).toBe("");
    expect(defaults.optional).toBe(undefined);
  });
});
