import { describe, it, expect } from "vitest";
import { joiValidator, joiObjectValidator } from "./joi.js";

const mockJoiSchema = {
  validate: (value: any) => {
    if (typeof value !== "string" || value.length < 3) {
      return {
        error: {
          details: [{ message: "Must be at least 3 characters" }],
        },
      };
    }
    return { value };
  },
};

const mockJoiObjectSchema = {
  validate: (values: any, options: any) => {
    const errors: any[] = [];

    if (!values.name || values.name.length < 2) {
      errors.push({ path: ["name"], message: "Name too short" });
    }

    if (!values.email || !values.email.includes("@")) {
      errors.push({ path: ["email"], message: "Invalid email" });
    }

    if (errors.length > 0) {
      if (options?.abortEarly === false) {
        return { error: { details: errors } };
      } else {
        return { error: { details: [errors[0]] } };
      }
    }

    return { value: values };
  },
};

describe("Joi Validator", () => {
  describe("Single Field Validation", () => {
    it("should validate valid value", async () => {
      const validator = joiValidator(mockJoiSchema);
      const result = await validator("hello");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid value", async () => {
      const validator = joiValidator(mockJoiSchema);
      const result = await validator("hi");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Must be at least 3 characters");
    });

    it("should handle invalid schema", async () => {
      const validator = joiValidator(null);
      const result = await validator("test");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid Joi schema");
    });

    it("should handle schema without validate method", async () => {
      const validator = joiValidator({});
      const result = await validator("test");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid Joi schema");
    });

    it("should handle error without details", async () => {
      const schemaWithGenericError = {
        validate: () => ({ error: { message: "Generic error" } }),
      };

      const validator = joiValidator(schemaWithGenericError);
      const result = await validator("test");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Validation failed");
    });
  });

  describe("Object Validation", () => {
    it("should validate valid object", async () => {
      const validator = joiObjectValidator(mockJoiObjectSchema);
      const errors = await validator({
        name: "John",
        email: "john@example.com",
      });

      expect(errors).toEqual({});
    });

    it("should return errors for invalid object", async () => {
      const validator = joiObjectValidator(mockJoiObjectSchema);
      const errors = await validator({
        name: "J",
        email: "invalid",
      });

      expect(errors.name).toBe("Name too short");
      expect(errors.email).toBe("Invalid email");
    });

    it("should handle invalid schema", async () => {
      const validator = joiObjectValidator(null);
      const errors = await validator({ test: "value" });

      expect(errors._form).toBe("Invalid Joi schema");
    });

    it("should handle error without details", async () => {
      const schemaWithGenericError = {
        validate: () => ({
          error: { message: "Generic validation error" },
        }),
      };

      const validator = joiObjectValidator(schemaWithGenericError);
      const errors = await validator({ test: "value" });

      expect(errors._form).toBe("Generic validation error");
    });
  });
});
