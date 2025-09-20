import v from "@atomiton/validation";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "./hooks/index";

describe("useForm", () => {
  it("creates form with generated fields", () => {
    const schema = v.object({
      name: v.string(),
      age: v.number(),
    });

    const { result } = renderHook(() => useForm({ schema }));

    expect(result.current).toBeDefined();
    expect(result.current.fields).toBeDefined();
    expect(result.current.fields).toHaveLength(2);

    // Check fields are generated correctly
    expect(result.current.fields[0].name).toBe("name");
    expect(result.current.fields[0].type).toBe("text");
    expect(result.current.fields[1].name).toBe("age");
    expect(result.current.fields[1].type).toBe("number");
  });

  it("merges fields metadata", () => {
    const schema = v.object({
      name: v.string(),
    });

    const fields = {
      name: {
        label: "Full Name",
        controlType: "textarea" as const,
      },
    };

    const { result } = renderHook(() => useForm({ schema, fields }));

    expect(result.current.fields[0].type).toBe("textarea");
    expect(result.current.fields[0].label).toBe("Full Name");
  });

  it("includes React Hook Form methods", () => {
    const schema = v.object({
      name: v.string(),
    });

    const { result } = renderHook(() => useForm({ schema }));

    // Check all React Hook Form methods are available
    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.watch).toBeDefined();
    expect(result.current.setValue).toBeDefined();
    expect(result.current.getValues).toBeDefined();
    expect(result.current.formState).toBeDefined();
  });

  it("handles default values", () => {
    const schema = v.object({
      name: v.string(),
      age: v.number(),
    });

    const defaultValues = { name: "John", age: 30 };

    const { result } = renderHook(() => useForm({ schema, defaultValues }));

    expect(result.current.getValues()).toEqual(defaultValues);
  });

  it("handles empty fields parameter", () => {
    const schema = v.object({
      name: v.string(),
    });

    const { result } = renderHook(() => useForm({ schema, fields: {} }));

    expect(result.current.fields).toHaveLength(1);
    expect(result.current.fields[0].label).toBe("Name"); // Auto-generated label
  });

  it("handles complex schema with optional fields", () => {
    const schema = v.object({
      name: v.string(),
      email: v.string().email().optional(),
      age: v.number().min(18).max(100),
      active: v.boolean(),
      role: v.enum(["user", "admin"]),
    });

    const { result } = renderHook(() => useForm({ schema }));

    expect(result.current.fields).toHaveLength(5);

    const [name, email, age, active, role] = result.current.fields;

    expect(name.type).toBe("text");
    expect(name.required).toBe(true);

    expect(email.type).toBe("email");
    expect(email.required).toBe(false);

    expect(age.type).toBe("number");
    expect(age.min).toBe(18);
    expect(age.max).toBe(100);

    expect(active.type).toBe("boolean");

    expect(role.type).toBe("select");
    expect(role.options).toEqual([
      { label: "user", value: "user" },
      { label: "admin", value: "admin" },
    ]);
  });

  it("handles error when generating fields from invalid schema", () => {
    // Mock console.error to check it was called
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Pass a non-ZodObject schema which will throw an error
    const invalidSchema = v.string() as unknown;

    const { result } = renderHook(() => useForm({ schema: invalidSchema }));

    // Should handle error gracefully and return empty fields array
    expect(result.current.fields).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error generating fields:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("still provides React Hook Form functionality when field generation fails", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Pass invalid schema
    const invalidSchema = v.array(v.string()) as unknown;

    const { result } = renderHook(() => useForm({ schema: invalidSchema }));

    // Should still have all React Hook Form methods
    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.formState).toBeDefined();
    expect(result.current.fields).toEqual([]);

    consoleSpy.mockRestore();
  });
});
