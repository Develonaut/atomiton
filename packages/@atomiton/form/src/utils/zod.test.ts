import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodValidator } from "./zod.js";

describe("Zod Validator", () => {
  describe("String Validation", () => {
    const stringSchema = z.string().min(3, "Must be at least 3 characters");

    it("should validate valid string", async () => {
      const validator = zodValidator(stringSchema);
      const result = await validator("hello");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid string", async () => {
      const validator = zodValidator(stringSchema);
      const result = await validator("hi");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Must be at least 3 characters");
    });

    it("should handle empty string", async () => {
      const validator = zodValidator(stringSchema);
      const result = await validator("");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Must be at least 3 characters");
    });

    it("should handle null value", async () => {
      const validator = zodValidator(stringSchema);
      const result = await validator(null);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected string");
    });

    it("should handle undefined value", async () => {
      const validator = zodValidator(stringSchema);
      const result = await validator(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Required");
    });
  });

  describe("Number Validation", () => {
    const numberSchema = z
      .number()
      .min(0, "Must be positive")
      .max(100, "Must be under 100");

    it("should validate valid number", async () => {
      const validator = zodValidator(numberSchema);
      const result = await validator(50);

      expect(result.valid).toBe(true);
    });

    it("should reject negative number", async () => {
      const validator = zodValidator(numberSchema);
      const result = await validator(-5);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Must be positive");
    });

    it("should reject number too large", async () => {
      const validator = zodValidator(numberSchema);
      const result = await validator(150);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Must be under 100");
    });

    it("should handle string that looks like number", async () => {
      const validator = zodValidator(numberSchema);
      const result = await validator("50");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected number");
    });
  });

  describe("Email Validation", () => {
    const emailSchema = z.string().email("Invalid email format");

    it("should validate valid email", async () => {
      const validator = zodValidator(emailSchema);
      const result = await validator("test@example.com");

      expect(result.valid).toBe(true);
    });

    it("should reject invalid email format", async () => {
      const validator = zodValidator(emailSchema);
      const result = await validator("invalid-email");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid email format");
    });

    it("should reject email without domain", async () => {
      const validator = zodValidator(emailSchema);
      const result = await validator("test@");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid email format");
    });

    it("should reject email without @", async () => {
      const validator = zodValidator(emailSchema);
      const result = await validator("testexample.com");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid email format");
    });
  });

  describe("Object Validation", () => {
    const userSchema = z.object({
      name: z.string().min(2, "Name too short"),
      age: z.number().min(0, "Age must be positive"),
      email: z.string().email("Invalid email"),
    });

    it("should validate valid object", async () => {
      const validator = zodValidator(userSchema);
      const result = await validator({
        name: "John Doe",
        age: 30,
        email: "john@example.com",
      });

      expect(result.valid).toBe(true);
    });

    it("should reject object with invalid field", async () => {
      const validator = zodValidator(userSchema);
      const result = await validator({
        name: "J",
        age: 30,
        email: "john@example.com",
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Name too short");
    });

    it("should reject object with missing field", async () => {
      const validator = zodValidator(userSchema);
      const result = await validator({
        name: "John Doe",
        age: 30,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Required");
    });
  });

  describe("Array Validation", () => {
    const arraySchema = z
      .array(z.string())
      .min(1, "At least one item required");

    it("should validate valid array", async () => {
      const validator = zodValidator(arraySchema);
      const result = await validator(["item1", "item2"]);

      expect(result.valid).toBe(true);
    });

    it("should reject empty array", async () => {
      const validator = zodValidator(arraySchema);
      const result = await validator([]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("At least one item required");
    });

    it("should reject non-array", async () => {
      const validator = zodValidator(arraySchema);
      const result = await validator("not an array");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected array");
    });
  });

  describe("Optional Fields", () => {
    const optionalSchema = z.string().optional();

    it("should validate undefined for optional field", async () => {
      const validator = zodValidator(optionalSchema);
      const result = await validator(undefined);

      expect(result.valid).toBe(true);
    });

    it("should validate valid value for optional field", async () => {
      const validator = zodValidator(optionalSchema);
      const result = await validator("test");

      expect(result.valid).toBe(true);
    });

    it("should reject invalid type for optional field", async () => {
      const validator = zodValidator(optionalSchema);
      const result = await validator(123);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected string");
    });
  });

  describe("Complex Validation", () => {
    const complexSchema = z.object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain uppercase letter")
        .regex(/[a-z]/, "Password must contain lowercase letter")
        .regex(/[0-9]/, "Password must contain number"),
    });

    it("should validate strong password", async () => {
      const validator = zodValidator(complexSchema);
      const result = await validator({
        password: "StrongPass123",
      });

      expect(result.valid).toBe(true);
    });

    it("should reject weak password - too short", async () => {
      const validator = zodValidator(complexSchema);
      const result = await validator({
        password: "Weak1",
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Password must be at least 8 characters");
    });

    it("should reject password without uppercase", async () => {
      const validator = zodValidator(complexSchema);
      const result = await validator({
        password: "weakpass123",
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Password must contain uppercase letter");
    });

    it("should reject password without number", async () => {
      const validator = zodValidator(complexSchema);
      const result = await validator({
        password: "WeakPassword",
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Password must contain number");
    });
  });

  describe("Custom Validation", () => {
    const customSchema = z.string().refine((val) => val !== "forbidden", {
      message: "This value is forbidden",
    });

    it("should pass custom validation", async () => {
      const validator = zodValidator(customSchema);
      const result = await validator("allowed");

      expect(result.valid).toBe(true);
    });

    it("should fail custom validation", async () => {
      const validator = zodValidator(customSchema);
      const result = await validator("forbidden");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("This value is forbidden");
    });
  });

  describe("Async Validation", () => {
    const asyncSchema = z.string().refine(
      async (val) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return val !== "async-forbidden";
      },
      { message: "This value is forbidden async" },
    );

    it("should handle async validation success", async () => {
      const validator = zodValidator(asyncSchema);
      const result = await validator("allowed");

      expect(result.valid).toBe(true);
    });

    it("should handle async validation failure", async () => {
      const validator = zodValidator(asyncSchema);
      const result = await validator("async-forbidden");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("This value is forbidden async");
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed schema gracefully", async () => {
      const invalidSchema = null as unknown;
      const validator = zodValidator(invalidSchema);

      const result = await validator("test");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Unknown validation error");
    });

    it("should handle unexpected error types", async () => {
      const throwingSchema = z.custom(() => {
        throw new Error("Custom error");
      });

      const validator = zodValidator(throwingSchema);
      const result = await validator("test");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Unknown validation error");
    });

    it("should return first error from multiple validation errors", async () => {
      const multiErrorSchema = z.object({
        field1: z.string().min(10, "Field1 too short"),
        field2: z.string().min(10, "Field2 too short"),
      });

      const validator = zodValidator(multiErrorSchema);
      const result = await validator({
        field1: "short",
        field2: "short",
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Field1 too short");
    });
  });

  describe("Performance", () => {
    it("should handle large objects efficiently", async () => {
      const largeObjectSchema = z.object(
        Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            `field${i}`,
            z.string().min(1, `Field ${i} required`),
          ]),
        ),
      );

      const largeObject = Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [`field${i}`, `value${i}`]),
      );

      const validator = zodValidator(largeObjectSchema);
      const startTime = performance.now();

      const result = await validator(largeObject);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(100);
    });

    it("should handle repeated validation calls efficiently", async () => {
      const schema = z.string().email();
      const validator = zodValidator(schema);

      const startTime = performance.now();

      const promises = Array.from({ length: 1000 }, () =>
        validator("test@example.com"),
      );

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results.every((r) => r.valid)).toBe(true);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Edge Cases", () => {
    it("should handle extremely long strings", async () => {
      const schema = z.string();
      const validator = zodValidator(schema);
      const longString = "x".repeat(100000);

      const result = await validator(longString);

      expect(result.valid).toBe(true);
    });

    it("should handle deeply nested objects", async () => {
      const nestedSchema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              value: z.string(),
            }),
          }),
        }),
      });

      const validator = zodValidator(nestedSchema);
      const result = await validator({
        level1: {
          level2: {
            level3: {
              value: "deep",
            },
          },
        },
      });

      expect(result.valid).toBe(true);
    });

    it("should handle circular references safely", async () => {
      const schema = z.string();
      const validator = zodValidator(schema);

      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const result = await validator(circular);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Expected string");
    });
  });
});
