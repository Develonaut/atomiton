import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldValues, FormConfig } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createSubmit } from "./submit.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
} & FieldValues;

describe("submit", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let submit: ReturnType<typeof createSubmit<TestFormData>>;
  let mockValidate: ReturnType<typeof vi.fn>;
  let mockReset: ReturnType<typeof vi.fn>;
  let mockOnSubmit: ReturnType<typeof vi.fn>;

  const initialValues: TestFormData = {
    name: "John",
    email: "john@example.com",
    age: 25,
  };

  beforeEach(() => {
    store = storeApi.createStore<FormStoreState<TestFormData>>({
      initialState: {
        formId: "test-form",
        config: {
          initialValues,
          validateOnSubmit: true,
          resetOnSubmitSuccess: false,
        } as FormConfig<TestFormData>,
        values: { ...initialValues },
        errors: {},
        touched: { name: false, email: false, age: false },
        isSubmitting: false,
        isValidating: false,
        isValid: true,
        isDirty: false,
        submitCount: 0,
        validators: new Map(),
      },
      name: "test-store",
    });

    mockValidate = vi.fn().mockResolvedValue(true);
    mockReset = vi.fn();
    mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    submit = createSubmit(store, { validate: mockValidate, reset: mockReset });
  });

  describe("Happy Path", () => {
    it("should increment submitCount and set isSubmitting during submission", async () => {
      expect(store.getState().submitCount).toBe(0);
      expect(store.getState().isSubmitting).toBe(false);

      let duringSubmission = false;
      mockOnSubmit.mockImplementation(async () => {
        duringSubmission = store.getState().isSubmitting;
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      await submit(mockOnSubmit);

      expect(duringSubmission).toBe(true);
      expect(store.getState().submitCount).toBe(1);
      expect(store.getState().isSubmitting).toBe(false);
    });

    it("should validate before submission when validateOnSubmit is true", async () => {
      await submit(mockOnSubmit);

      expect(mockValidate).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    it("should skip validation when validateOnSubmit is false", async () => {
      store.setState((state) => {
        state.config.validateOnSubmit = false;
      });

      await submit(mockOnSubmit);

      expect(mockValidate).not.toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    it("should not call onSubmit if validation fails", async () => {
      mockValidate.mockResolvedValue(false);

      await submit(mockOnSubmit);

      expect(mockValidate).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(store.getState().isSubmitting).toBe(false);
      expect(store.getState().submitCount).toBe(1);
    });

    it("should reset form after successful submission when enabled", async () => {
      store.setState((state) => {
        state.config.resetOnSubmitSuccess = true;
      });

      await submit(mockOnSubmit);

      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalled();
    });

    it("should not reset form when resetOnSubmitSuccess is false", async () => {
      await submit(mockOnSubmit);

      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
    });

    it("should call onSubmit with current form values", async () => {
      const testValues = {
        name: "Test User",
        email: "test@example.com",
        age: 30,
      };

      store.setState((state) => {
        state.values = testValues;
      });

      await submit(mockOnSubmit);

      expect(mockOnSubmit).toHaveBeenCalledWith(testValues);
    });
  });

  describe("Error Handling", () => {
    it("should handle onSubmit throwing synchronous errors", async () => {
      const error = new Error("Submission failed");
      mockOnSubmit.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await submit(mockOnSubmit);

      expect(consoleSpy).toHaveBeenCalledWith("Form submission error:", error);
      expect(store.getState().isSubmitting).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should handle onSubmit rejecting async errors", async () => {
      const error = new Error("Async submission failed");
      mockOnSubmit.mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await submit(mockOnSubmit);

      expect(consoleSpy).toHaveBeenCalledWith("Form submission error:", error);
      expect(store.getState().isSubmitting).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should not reset form when submission fails", async () => {
      store.setState((state) => {
        state.config.resetOnSubmitSuccess = true;
      });

      mockOnSubmit.mockRejectedValue(new Error("Failed"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await submit(mockOnSubmit);

      expect(mockReset).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle validation throwing errors", async () => {
      mockValidate.mockRejectedValue(new Error("Validation error"));

      await expect(submit(mockOnSubmit)).rejects.toThrow("Validation error");
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should always reset isSubmitting even on error", async () => {
      mockOnSubmit.mockRejectedValue(new Error("Error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await submit(mockOnSubmit);

      expect(store.getState().isSubmitting).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("Concurrent Submissions", () => {
    it("should handle multiple concurrent submit calls", async () => {
      let submissionCount = 0;
      mockOnSubmit.mockImplementation(async () => {
        submissionCount++;
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const promises = [
        submit(mockOnSubmit),
        submit(mockOnSubmit),
        submit(mockOnSubmit),
      ];

      await Promise.all(promises);

      expect(submissionCount).toBe(3);
      expect(store.getState().submitCount).toBe(3);
      expect(store.getState().isSubmitting).toBe(false);
    });

    it("should handle rapid successive submissions", async () => {
      for (let i = 0; i < 10; i++) {
        await submit(mockOnSubmit);
      }

      expect(store.getState().submitCount).toBe(10);
      expect(mockOnSubmit).toHaveBeenCalledTimes(10);
    });

    it("should maintain state consistency during concurrent submissions", async () => {
      let maxConcurrentSubmissions = 0;
      let currentSubmissions = 0;

      mockOnSubmit.mockImplementation(async () => {
        currentSubmissions++;
        maxConcurrentSubmissions = Math.max(
          maxConcurrentSubmissions,
          currentSubmissions,
        );
        await new Promise((resolve) => setTimeout(resolve, 10));
        currentSubmissions--;
      });

      const promises = Array.from({ length: 5 }, () => submit(mockOnSubmit));
      await Promise.all(promises);

      expect(maxConcurrentSubmissions).toBeGreaterThan(1);
      expect(store.getState().submitCount).toBe(5);
      expect(store.getState().isSubmitting).toBe(false);
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle very fast submissions efficiently", async () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        await submit(mockOnSubmit);
      }

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(store.getState().submitCount).toBe(100);
    });

    it("should handle slow onSubmit functions", async () => {
      mockOnSubmit.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const startTime = Date.now();
      await submit(mockOnSubmit);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
      expect(store.getState().isSubmitting).toBe(false);
    });

    it("should handle large form data efficiently", async () => {
      const largeValues = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [`field${i}`, `value${i}`]),
      );

      store.setState((state) => {
        Object.assign(state.values, largeValues);
      });

      const startTime = Date.now();
      await submit(mockOnSubmit);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining(largeValues),
      );
    });
  });

  describe("State Management", () => {
    it("should preserve other state properties during submission", async () => {
      store.setState((state) => {
        state.errors.name = { message: "Test error" };
        state.touched.email = true;
        state.isDirty = true;
      });

      await submit(mockOnSubmit);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Test error");
      expect(state.touched.email).toBe(true);
      expect(state.isDirty).toBe(true);
    });

    it("should work correctly when store state changes during submission", async () => {
      mockOnSubmit.mockImplementation(async (values) => {
        store.setState((state) => {
          state.values.name = "Changed during submission";
        });

        // Values passed to onSubmit should be snapshot from when submit was called
        expect(values.name).toBe("John");
      });

      await submit(mockOnSubmit);

      expect(store.getState().values.name).toBe("Changed during submission");
    });

    it("should handle external state modifications during submission", async () => {
      let submissionStarted = false;

      mockOnSubmit.mockImplementation(async () => {
        submissionStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const submissionPromise = submit(mockOnSubmit);

      // Modify state externally while submission is in progress
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (submissionStarted) {
        store.setState((state) => {
          state.values.email = "externally-modified@test.com";
        });
      }

      await submissionPromise;

      expect(store.getState().values.email).toBe(
        "externally-modified@test.com",
      );
    });
  });

  describe("Configuration Edge Cases", () => {
    it("should handle missing validateOnSubmit configuration", async () => {
      store.setState((state) => {
        delete (state.config as any).validateOnSubmit;
      });

      await submit(mockOnSubmit);

      expect(mockValidate).not.toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("should handle missing resetOnSubmitSuccess configuration", async () => {
      store.setState((state) => {
        delete (state.config as any).resetOnSubmitSuccess;
      });

      await submit(mockOnSubmit);

      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
    });

    it("should handle config being undefined", async () => {
      store.setState((state) => {
        (state as any).config = undefined;
      });

      expect(() => submit(mockOnSubmit)).not.toThrow();
      await submit(mockOnSubmit);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("should handle malformed config", async () => {
      store.setState((state) => {
        (state.config as any) = "invalid config";
      });

      await submit(mockOnSubmit);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe("Edge Cases with onSubmit", () => {
    it("should handle onSubmit returning non-promise values", async () => {
      const syncOnSubmit = vi.fn().mockReturnValue("sync return");

      await submit(syncOnSubmit);

      expect(syncOnSubmit).toHaveBeenCalled();
      expect(store.getState().isSubmitting).toBe(false);
    });

    it("should handle onSubmit being undefined", async () => {
      await expect(submit(undefined as any)).rejects.toThrow();
    });

    it("should handle onSubmit being null", async () => {
      await expect(submit(null as any)).rejects.toThrow();
    });

    it("should handle onSubmit with no return value", async () => {
      const voidOnSubmit = vi.fn().mockImplementation(() => {});

      await submit(voidOnSubmit);

      expect(voidOnSubmit).toHaveBeenCalled();
      expect(store.getState().isSubmitting).toBe(false);
    });
  });

  describe("Integration with Other Actions", () => {
    it("should work correctly with validation that sets errors", async () => {
      mockValidate.mockImplementation(async () => {
        store.setState((state) => {
          state.errors.name = { message: "Validation set this error" };
          state.isValid = false;
        });
        return false;
      });

      await submit(mockOnSubmit);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(store.getState().errors.name?.message).toBe(
        "Validation set this error",
      );
    });

    it("should work correctly with reset action", async () => {
      store.setState((state) => {
        state.config.resetOnSubmitSuccess = true;
        state.values.name = "Modified";
        state.isDirty = true;
      });

      mockReset.mockImplementation(() => {
        store.setState((state) => {
          state.values = { ...initialValues };
          state.isDirty = false;
        });
      });

      await submit(mockOnSubmit);

      expect(mockReset).toHaveBeenCalled();
      expect(store.getState().values.name).toBe("John");
      expect(store.getState().isDirty).toBe(false);
    });

    it("should handle reset action throwing errors", async () => {
      store.setState((state) => {
        state.config.resetOnSubmitSuccess = true;
      });

      mockReset.mockImplementation(() => {
        throw new Error("Reset failed");
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await submit(mockOnSubmit);

      expect(store.getState().isSubmitting).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe("Memory and Resource Management", () => {
    it("should not create memory leaks with many submissions", async () => {
      const submissions = Array.from({ length: 1000 }, (_, i) => async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        await submit(onSubmit);
        return onSubmit;
      });

      const onSubmitFunctions = await Promise.all(submissions.map((s) => s()));

      expect(onSubmitFunctions).toHaveLength(1000);
      expect(store.getState().submitCount).toBe(1000);
    });

    it("should handle submission with large payload efficiently", async () => {
      const largePayload = {
        name: "x".repeat(10000),
        email: "y".repeat(10000),
        age: 999999999,
      };

      store.setState((state) => {
        state.values = largePayload;
      });

      const startTime = Date.now();
      await submit(mockOnSubmit);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(mockOnSubmit).toHaveBeenCalledWith(largePayload);
    });
  });
});
