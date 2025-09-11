import { describe, it, expect } from "vitest";
import { yupValidator, yupObjectValidator } from "./yup.js";

const mockYupSchema = {
  validate: async (value: any) => {
    if (typeof value !== "string" || value.length < 3) {
      throw new Error("Must be at least 3 characters");
    }
    return value;
  },
};

const mockYupObjectSchema = {
  validate: async (values: any, options: any) => {
    const errors: any[] = [];

    if (!values.name || values.name.length < 2) {
      errors.push({ path: "name", message: "Name too short" });
    }

    if (!values.email || !values.email.includes("@")) {
      errors.push({ path: "email", message: "Invalid email" });
    }

    if (errors.length > 0) {
      const error: any = new Error("Validation failed");
      error.inner = errors;

      if (options?.abortEarly === false) {
        throw error;
      } else {
        error.inner = [errors[0]];
        throw error;
      }
    }

    return values;
  },
};

describe("Yup Validator", () => {
  describe("Single Field Validation", () => {
    it("should validate valid value", async () => {
      const validator = yupValidator(mockYupSchema);
      const result = await validator("hello");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid value", async () => {
      const validator = yupValidator(mockYupSchema);
      const result = await validator("hi");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Must be at least 3 characters");
    });

    it("should handle invalid schema", async () => {
      const validator = yupValidator(null);
      const result = await validator("test");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid Yup schema");
    });

    it("should handle schema without validate method", async () => {
      const validator = yupValidator({});
      const result = await validator("test");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid Yup schema");
    });
  });

  describe("Object Validation", () => {
    it("should validate valid object", async () => {
      const validator = yupObjectValidator(mockYupObjectSchema);
      const errors = await validator({
        name: "John",
        email: "john@example.com",
      });

      expect(errors).toEqual({});
    });

    it("should return errors for invalid object", async () => {
      const validator = yupObjectValidator(mockYupObjectSchema);
      const errors = await validator({
        name: "J",
        email: "invalid",
      });

      expect(errors.name).toBe("Name too short");
      expect(errors.email).toBe("Invalid email");
    });

    it("should handle invalid schema", async () => {
      const validator = yupObjectValidator(null);
      const errors = await validator({ test: "value" });

      expect(errors._form).toBe("Invalid Yup schema");
    });
  });
});
