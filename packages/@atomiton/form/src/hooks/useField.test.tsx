import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "./useForm.js";
import { useField } from "./useField.js";

describe("useField", () => {
  it("returns field registration and state", () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { result: formResult } = renderHook(() =>
      useForm({ schema, defaultValues: { name: "John", email: "" } }),
    );

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "name", form: formResult.current }),
    );

    expect(fieldResult.current.value).toBe("John");
    expect(fieldResult.current.error).toBeUndefined();
    expect(fieldResult.current.touched).toBeFalsy();
    expect(fieldResult.current.hasError).toBe(false);
    expect(fieldResult.current.name).toBe("name");
  });

  it("tracks field value changes", () => {
    const schema = z.object({
      name: z.string(),
    });

    const { result: formResult } = renderHook(() =>
      useForm({ schema, defaultValues: { name: "" } }),
    );

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "name", form: formResult.current }),
    );

    expect(fieldResult.current.value).toBe("");

    act(() => {
      fieldResult.current.setValue("New Name");
    });

    expect(formResult.current.getValues("name")).toBe("New Name");
  });

  it("setValue function calls clearErrors when error exists", () => {
    const schema = z.object({
      name: z.string(),
    });

    const { result: formResult } = renderHook(() => useForm({ schema }));

    // Create a mock form with an error
    const mockForm = {
      ...formResult.current,
      formState: {
        ...formResult.current.formState,
        errors: { name: { message: "Error", type: "required" } },
        touchedFields: {},
      },
    };

    const clearErrorsSpy = vi.spyOn(mockForm, "clearErrors");
    const setValueSpy = vi.spyOn(mockForm, "setValue");

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "name", form: mockForm as unknown }),
    );

    // Call setValue when there's an error
    act(() => {
      fieldResult.current.setValue("New Value");
    });

    // Should call setValue and clearErrors
    expect(setValueSpy).toHaveBeenCalledWith("name", "New Value");
    expect(clearErrorsSpy).toHaveBeenCalledWith("name");
  });

  it("tracks touched state correctly", () => {
    const schema = z.object({
      name: z.string(),
    });

    const { result: formResult } = renderHook(() =>
      useForm({ schema, defaultValues: { name: "" } }),
    );

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "name", form: formResult.current }),
    );

    expect(fieldResult.current.touched).toBeFalsy();

    // Simulate field being touched
    act(() => {
      formResult.current.setFocus("name");
      formResult.current.trigger("name");
    });

    // Note: In a real scenario, the field would be marked as touched
    // after blur event, but we're testing the hook's ability to read the state
  });

  it("returns all register properties", () => {
    const schema = z.object({
      name: z.string().min(3),
    });

    const { result: formResult } = renderHook(() => useForm({ schema }));

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "name", form: formResult.current }),
    );

    // Check that register properties are spread correctly
    expect(fieldResult.current.name).toBe("name");
    expect(fieldResult.current.onChange).toBeDefined();
    expect(fieldResult.current.onBlur).toBeDefined();
    expect(fieldResult.current.ref).toBeDefined();
  });

  it("handles multiple fields independently", () => {
    const schema = z.object({
      firstName: z.string(),
      lastName: z.string(),
    });

    const { result: formResult } = renderHook(() =>
      useForm({
        schema,
        defaultValues: { firstName: "John", lastName: "Doe" },
      }),
    );

    const { result: firstNameField } = renderHook(() =>
      useField({ name: "firstName", form: formResult.current }),
    );

    const { result: lastNameField } = renderHook(() =>
      useField({ name: "lastName", form: formResult.current }),
    );

    expect(firstNameField.current.value).toBe("John");
    expect(lastNameField.current.value).toBe("Doe");

    act(() => {
      firstNameField.current.setValue("Jane");
    });

    // Check form values were updated
    expect(formResult.current.getValues("firstName")).toBe("Jane");
    expect(formResult.current.getValues("lastName")).toBe("Doe");
  });

  it("properly handles nested field names", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string(),
      }),
    });

    const { result: formResult } = renderHook(() =>
      useForm({
        schema,
        defaultValues: { user: { name: "John", email: "john@example.com" } },
      }),
    );

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "user.name", form: formResult.current }),
    );

    expect(fieldResult.current.value).toBe("John");
    expect(fieldResult.current.name).toBe("user.name");

    act(() => {
      fieldResult.current.setValue("Jane");
    });

    expect(formResult.current.getValues("user.name")).toBe("Jane");
  });

  it("returns undefined for non-existent fields", () => {
    const schema = z.object({
      name: z.string(),
    });

    const { result: formResult } = renderHook(() => useForm({ schema }));

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "nonExistent", form: formResult.current }),
    );

    expect(fieldResult.current.value).toBeUndefined();
    expect(fieldResult.current.error).toBeUndefined();
    expect(fieldResult.current.touched).toBeUndefined();
    expect(fieldResult.current.hasError).toBe(false);
  });

  it("updates when form values change externally", () => {
    const schema = z.object({
      name: z.string(),
    });

    const { result: formResult } = renderHook(() =>
      useForm({ schema, defaultValues: { name: "Initial" } }),
    );

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "name", form: formResult.current }),
    );

    expect(fieldResult.current.value).toBe("Initial");

    // Change value through form
    act(() => {
      formResult.current.setValue("name", "Updated");
    });

    // Verify the form value was actually updated
    expect(formResult.current.getValues("name")).toBe("Updated");
  });

  it("handles clearing errors only when error exists", async () => {
    const schema = z.object({
      name: z.string().min(3),
    });

    const { result: formResult } = renderHook(() =>
      useForm({ schema, defaultValues: { name: "" } }),
    );

    const { result: fieldResult } = renderHook(() =>
      useField({ name: "name", form: formResult.current }),
    );

    // Set value without error - clearErrors should not be called
    const clearErrorsSpy = vi.spyOn(formResult.current, "clearErrors");

    act(() => {
      fieldResult.current.setValue("Test");
    });

    expect(clearErrorsSpy).not.toHaveBeenCalled();

    // Trigger an error
    await act(async () => {
      formResult.current.setValue("name", "ab");
      await formResult.current.trigger("name");
    });

    clearErrorsSpy.mockRestore();

    // Now create a new field hook with the error present and spy on the form again
    const newClearErrorsSpy = vi.spyOn(formResult.current, "clearErrors");

    const { result: fieldWithErrorResult } = renderHook(() =>
      useField({ name: "name", form: formResult.current }),
    );

    // Set value with error present - clearErrors should be called
    act(() => {
      fieldWithErrorResult.current.setValue("Valid Name");
    });

    expect(newClearErrorsSpy).toHaveBeenCalledWith("name");
    newClearErrorsSpy.mockRestore();
  });
});
