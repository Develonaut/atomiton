import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForm } from "./useForm.js";
import { deleteFormStore } from "./index.js";
import type { FormConfig, FieldValues } from "../types/index.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
} & FieldValues;

describe("useForm Hook", () => {
  const initialValues: TestFormData = {
    name: "",
    email: "",
    age: 0,
  };

  const config: FormConfig<TestFormData> = {
    initialValues,
    validateOnChange: true,
    validateOnBlur: true,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Hook Initialization", () => {
    it("should initialize with correct state", () => {
      const { result } = renderHook(() => useForm(config));

      expect(result.current.state.values).toEqual(initialValues);
      expect(result.current.state.errors).toEqual({});
      expect(result.current.state.touched).toEqual({
        name: false,
        email: false,
        age: false,
      });
      expect(result.current.state.isSubmitting).toBe(false);
      expect(result.current.state.isDirty).toBe(false);
    });

    it("should provide helper functions", () => {
      const { result } = renderHook(() => useForm(config));

      expect(typeof result.current.helpers.setFieldValue).toBe("function");
      expect(typeof result.current.helpers.setFieldError).toBe("function");
      expect(typeof result.current.helpers.setFieldTouched).toBe("function");
      expect(typeof result.current.helpers.setValues).toBe("function");
      expect(typeof result.current.helpers.setErrors).toBe("function");
      expect(typeof result.current.helpers.reset).toBe("function");
      expect(typeof result.current.helpers.validate).toBe("function");
      expect(typeof result.current.helpers.validateField).toBe("function");
      expect(typeof result.current.helpers.submit).toBe("function");
    });

    it("should use provided formId", () => {
      const formId = "custom-form-id";
      const { result } = renderHook(() => useForm(config, formId));

      expect(result.current.store.getState().formId).toBe(formId);
    });

    it("should generate unique formId when not provided", () => {
      const { result: result1 } = renderHook(() => useForm(config));
      const { result: result2 } = renderHook(() => useForm(config));

      const formId1 = result1.current.store.getState().formId;
      const formId2 = result2.current.store.getState().formId;

      expect(formId1).not.toBe(formId2);
      expect(formId1).toMatch(/^form-\d+$/);
      expect(formId2).toMatch(/^form-\d+$/);
    });
  });

  describe("State Updates", () => {
    it("should update state when field value changes", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.helpers.setFieldValue("name", "John Doe");
      });

      expect(result.current.state.values.name).toBe("John Doe");
      expect(result.current.state.isDirty).toBe(true);
    });

    it("should update multiple fields", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.helpers.setValues({
          name: "Jane",
          email: "jane@test.com",
        });
      });

      expect(result.current.state.values.name).toBe("Jane");
      expect(result.current.state.values.email).toBe("jane@test.com");
    });

    it("should handle field errors", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.helpers.setFieldError("email", {
          message: "Invalid email format",
        });
      });

      expect(result.current.state.errors.email?.message).toBe(
        "Invalid email format",
      );
    });

    it("should handle touched state", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.helpers.setFieldTouched("name", true);
      });

      expect(result.current.state.touched.name).toBe(true);
    });
  });

  describe("Form Reset", () => {
    it("should reset form to initial values", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.helpers.setFieldValue("name", "John");
        result.current.helpers.setFieldError("email", { message: "Error" });
        result.current.helpers.setFieldTouched("name", true);
      });

      expect(result.current.state.values.name).toBe("John");
      expect(result.current.state.errors.email?.message).toBe("Error");
      expect(result.current.state.touched.name).toBe(true);

      act(() => {
        result.current.helpers.reset();
      });

      expect(result.current.state.values).toEqual(initialValues);
      expect(result.current.state.errors).toEqual({});
      expect(result.current.state.touched).toEqual({
        name: false,
        email: false,
        age: false,
      });
      expect(result.current.state.isDirty).toBe(false);
    });

    it("should reset to provided values", () => {
      const { result } = renderHook(() => useForm(config));

      const resetValues = { name: "Reset Name" };
      act(() => {
        result.current.helpers.reset(resetValues);
      });

      expect(result.current.state.values.name).toBe("Reset Name");
      expect(result.current.state.values.email).toBe("");
      expect(result.current.state.values.age).toBe(0);
    });
  });

  describe("Validation", () => {
    it("should validate individual fields", async () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.store.registerValidator("name", async (value) => {
          if (!value || (value as string).length < 2) {
            return {
              valid: false,
              error: "Name must be at least 2 characters",
            };
          }
          return { valid: true };
        });
      });

      let validationResult;
      await act(async () => {
        validationResult = await result.current.helpers.validateField("name");
      });

      expect(validationResult?.valid).toBe(false);
      expect(validationResult?.error).toBe(
        "Name must be at least 2 characters",
      );
    });

    it("should validate entire form", async () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.store.registerValidator("name", async (value) => {
          if (!value) {
            return { valid: false, error: "Name is required" };
          }
          return { valid: true };
        });

        result.current.store.registerValidator("email", async (value) => {
          if (!value || !(value as string).includes("@")) {
            return { valid: false, error: "Valid email is required" };
          }
          return { valid: true };
        });
      });

      let isValid;
      await act(async () => {
        isValid = await result.current.helpers.validate();
      });

      expect(isValid).toBe(false);
      expect(result.current.state.errors.name?.message).toBe(
        "Name is required",
      );
      expect(result.current.state.errors.email?.message).toBe(
        "Valid email is required",
      );
    });
  });

  describe("Form Submission", () => {
    it("should handle form submission", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.helpers.setFieldValue("name", "John");
        result.current.helpers.setFieldValue("email", "john@test.com");
      });

      await act(async () => {
        await result.current.helpers.submit(onSubmit);
      });

      expect(onSubmit).toHaveBeenCalledWith({
        name: "John",
        email: "john@test.com",
        age: 0,
      });
      expect(result.current.state.submitCount).toBe(1);
    });

    it("should increment submit count on each submission", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useForm(config));

      await act(async () => {
        await result.current.helpers.submit(onSubmit);
      });
      expect(result.current.state.submitCount).toBe(1);

      await act(async () => {
        await result.current.helpers.submit(onSubmit);
      });
      expect(result.current.state.submitCount).toBe(2);
    });

    it("should handle submission errors", async () => {
      const onSubmit = vi
        .fn()
        .mockRejectedValue(new Error("Submission failed"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useForm(config));

      await act(async () => {
        await result.current.helpers.submit(onSubmit);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Form submission error:",
        expect.any(Error),
      );
      expect(result.current.state.isSubmitting).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("Store Cleanup", () => {
    it("should cleanup auto-generated store on unmount", () => {
      const { result, unmount } = renderHook(() => useForm(config));
      const formId = result.current.store.getState().formId;

      expect(result.current.store).toBeDefined();

      unmount();

      const deletedStore = deleteFormStore(formId);
      expect(deletedStore).toBe(false);
    });

    it("should not cleanup store with custom formId", () => {
      const customFormId = "persistent-form";
      const { unmount } = renderHook(() => useForm(config, customFormId));

      unmount();

      const deleted = deleteFormStore(customFormId);
      expect(deleted).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should maintain stable references for helpers", () => {
      const { result, rerender } = renderHook(() => useForm(config));
      const initialHelpers = result.current.helpers;

      rerender();

      expect(result.current.helpers).toBe(initialHelpers);
    });

    it("should handle rapid updates efficiently", () => {
      const { result } = renderHook(() => useForm(config));
      const startTime = performance.now();

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.helpers.setFieldValue("name", `value-${i}`);
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      expect(result.current.state.values.name).toBe("value-999");
    });

    it("should handle large form data efficiently", () => {
      const largeConfig: FormConfig<Record<string, string>> = {
        initialValues: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [`field${i}`, ""]),
        ),
      };

      const { result } = renderHook(() => useForm(largeConfig));
      const startTime = performance.now();

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.helpers.setFieldValue(`field${i}`, `value-${i}`);
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });
  });

  describe("Edge Cases", () => {
    it("should handle config changes", () => {
      const { result, rerender } = renderHook(
        ({ config: currentConfig }) => useForm(currentConfig),
        { initialProps: { config } },
      );

      const newConfig = {
        ...config,
        validateOnChange: false,
      };

      rerender({ config: newConfig });

      expect(result.current.store.getState().config.validateOnChange).toBe(
        false,
      );
    });

    it("should handle undefined/null in field values", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        result.current.helpers.setFieldValue(
          "name",
          undefined as unknown as string,
        );
        result.current.helpers.setFieldValue(
          "email",
          null as unknown as string,
        );
      });

      expect(result.current.state.values.name).toBeUndefined();
      expect(result.current.state.values.email).toBeNull();
    });

    it("should handle extremely rapid state changes", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        Promise.all(
          Array.from({ length: 100 }, (_, i) =>
            Promise.resolve().then(() => {
              result.current.helpers.setFieldValue("name", `rapid-${i}`);
            }),
          ),
        );
      });

      expect(typeof result.current.state.values.name).toBe("string");
    });

    it("should maintain state consistency during concurrent operations", () => {
      const { result } = renderHook(() => useForm(config));

      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.helpers.setFieldValue("name", `name-${i}`);
          result.current.helpers.setFieldTouched("name", i % 2 === 0);
          result.current.helpers.setFieldError(
            "name",
            i % 5 === 0 ? { message: `error-${i}` } : undefined,
          );
        }
      });

      const state = result.current.state;
      expect(state.values.name).toBe("name-49");
      expect(state.touched.name).toBe(false);
      expect(state.errors.name?.message).toBe("error-45");
    });
  });
});
