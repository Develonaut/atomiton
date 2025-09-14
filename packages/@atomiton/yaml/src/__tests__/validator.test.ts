import { describe, it, expect } from "vitest";
import {
  validateRequired,
  validateType,
  validateEnum,
  validatePattern,
  validateRange,
  validateArrayLength,
  createValidator,
} from "../utils/validator";

describe("validateRequired", () => {
  it("should pass when all required fields exist", () => {
    const data = {
      name: "Test",
      age: 30,
      email: "test@example.com",
    };
    const errors = validateRequired(data, ["name", "age", "email"]);
    expect(errors).toHaveLength(0);
  });

  it("should fail when required fields are missing", () => {
    const data = {
      name: "Test",
    };
    const errors = validateRequired(data, ["name", "age", "email"]);
    expect(errors).toHaveLength(2);
    expect(errors[0].message).toContain("age");
    expect(errors[1].message).toContain("email");
  });

  it("should validate nested required fields", () => {
    const data = {
      user: {
        name: "Test",
        profile: {
          bio: "Hello",
        },
      },
    };
    const errors = validateRequired(data, [
      "user.name",
      "user.profile.bio",
      "user.profile.age",
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("user.profile.age");
  });
});

describe("validateType", () => {
  it("should validate string type", () => {
    expect(validateType("hello", "string")).toBe(true);
    expect(validateType(123, "string")).toBe(false);
  });

  it("should validate number type", () => {
    expect(validateType(42, "number")).toBe(true);
    expect(validateType("42", "number")).toBe(false);
    expect(validateType(NaN, "number")).toBe(false);
  });

  it("should validate boolean type", () => {
    expect(validateType(true, "boolean")).toBe(true);
    expect(validateType(false, "boolean")).toBe(true);
    expect(validateType(1, "boolean")).toBe(false);
  });

  it("should validate object type", () => {
    expect(validateType({}, "object")).toBe(true);
    expect(validateType({ key: "value" }, "object")).toBe(true);
    expect(validateType([], "object")).toBe(false);
    expect(validateType(null, "object")).toBe(false);
  });

  it("should validate array type", () => {
    expect(validateType([], "array")).toBe(true);
    expect(validateType([1, 2, 3], "array")).toBe(true);
    expect(validateType({}, "array")).toBe(false);
  });
});

describe("validateEnum", () => {
  it("should validate enum values", () => {
    const colors = ["red", "green", "blue"] as const;
    expect(validateEnum("red", colors)).toBe(true);
    expect(validateEnum("green", colors)).toBe(true);
    expect(validateEnum("yellow", colors)).toBe(false);
  });

  it("should work with number enums", () => {
    const levels = [1, 2, 3] as const;
    expect(validateEnum(1, levels)).toBe(true);
    expect(validateEnum(4, levels)).toBe(false);
  });
});

describe("validatePattern", () => {
  it("should validate email pattern", () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(validatePattern("test@example.com", emailPattern)).toBe(true);
    expect(validatePattern("invalid-email", emailPattern)).toBe(false);
  });

  it("should validate phone pattern", () => {
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    expect(validatePattern("123-456-7890", phonePattern)).toBe(true);
    expect(validatePattern("1234567890", phonePattern)).toBe(false);
  });
});

describe("validateRange", () => {
  it("should validate number within range", () => {
    expect(validateRange(5, 1, 10)).toBe(true);
    expect(validateRange(1, 1, 10)).toBe(true);
    expect(validateRange(10, 1, 10)).toBe(true);
  });

  it("should fail for numbers outside range", () => {
    expect(validateRange(0, 1, 10)).toBe(false);
    expect(validateRange(11, 1, 10)).toBe(false);
  });

  it("should handle min only", () => {
    expect(validateRange(5, 1)).toBe(true);
    expect(validateRange(0, 1)).toBe(false);
  });

  it("should handle max only", () => {
    expect(validateRange(5, undefined, 10)).toBe(true);
    expect(validateRange(11, undefined, 10)).toBe(false);
  });
});

describe("validateArrayLength", () => {
  it("should validate array length within range", () => {
    expect(validateArrayLength([1, 2, 3], 1, 5)).toBe(true);
    expect(validateArrayLength([], 0, 5)).toBe(true);
  });

  it("should fail for arrays outside length range", () => {
    expect(validateArrayLength([1, 2, 3], 4, 10)).toBe(false);
    expect(validateArrayLength([1, 2, 3, 4, 5, 6], 1, 5)).toBe(false);
  });

  it("should handle min length only", () => {
    expect(validateArrayLength([1, 2, 3], 2)).toBe(true);
    expect(validateArrayLength([1], 2)).toBe(false);
  });
});

describe("createValidator", () => {
  it("should create a custom validator", () => {
    const isPositiveNumber = createValidator<number>((data): data is number => {
      return typeof data === "number" && data > 0;
    });

    expect(isPositiveNumber.validate(5)).toBe(true);
    expect(isPositiveNumber.validate(-5)).toBe(false);
    expect(isPositiveNumber.validate("5")).toBe(false);
  });

  it("should capture errors in custom validator", () => {
    const validator = createValidator<{ name: string }>(
      (data): data is { name: string } => {
        if (!data || typeof data !== "object") {
          throw new Error("Data must be an object");
        }
        if (
          !("name" in data) ||
          typeof (data as Record<string, unknown>).name !== "string"
        ) {
          throw new Error("Name field is required and must be a string");
        }
        return true;
      },
    );

    expect(validator.validate({ name: "Test" })).toBe(true);
    expect(validator.validate({ age: 30 })).toBe(false);
    expect(validator.errors).toBeDefined();
  });
});
