import {
    validateArrayLength,
    validateEnum,
    validatePattern,
    validateRange,
    validateRequired,
    validateType,
} from "#validator.js";
import { bench, describe } from "vitest";

const simpleData = {
  name: "Test",
  age: 30,
  email: "test@example.com",
};

const nestedData = {
  user: {
    profile: {
      name: "John Doe",
      age: 30,
      contact: {
        email: "john@example.com",
        phone: "123-456-7890",
      },
    },
    settings: {
      theme: "dark",
      notifications: true,
    },
  },
  metadata: {
    created: "2024-01-01",
    modified: "2024-01-15",
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
const colors = ["red", "green", "blue", "yellow", "purple"] as const;

describe("validateRequired benchmarks", () => {
  bench("validate simple required fields", () => {
    validateRequired(simpleData, ["name", "age", "email"]);
  });

  bench("validate nested required fields", () => {
    validateRequired(nestedData, [
      "user.profile.name",
      "user.profile.contact.email",
      "user.settings.theme",
      "metadata.created",
    ]);
  });

  bench("validate missing fields", () => {
    validateRequired(simpleData, ["name", "age", "email", "address", "phone"]);
  });
});

describe("validateType benchmarks", () => {
  bench("validate string type", () => {
    validateType("hello world", "string");
  });

  bench("validate number type", () => {
    validateType(42, "number");
  });

  bench("validate object type", () => {
    validateType(simpleData, "object");
  });

  bench("validate array type", () => {
    validateType([1, 2, 3, 4, 5], "array");
  });

  bench("validate mixed types (100 iterations)", () => {
    for (let i = 0; i < 100; i++) {
      validateType("string", "string");
      validateType(123, "number");
      validateType(true, "boolean");
      validateType({}, "object");
      validateType([], "array");
    }
  });
});

describe("validateEnum benchmarks", () => {
  bench("validate enum with 5 values", () => {
    validateEnum("blue", colors);
  });

  bench("validate enum (100 checks)", () => {
    for (let i = 0; i < 100; i++) {
      validateEnum(colors[i % colors.length], colors);
    }
  });
});

describe("validatePattern benchmarks", () => {
  bench("validate email pattern", () => {
    validatePattern("test@example.com", emailPattern);
  });

  bench("validate phone pattern", () => {
    validatePattern("123-456-7890", phonePattern);
  });

  bench("validate patterns (100 emails)", () => {
    for (let i = 0; i < 100; i++) {
      validatePattern(`user${i}@example.com`, emailPattern);
    }
  });
});

describe("validateRange benchmarks", () => {
  bench("validate number in range", () => {
    validateRange(50, 0, 100);
  });

  bench("validate range (1000 checks)", () => {
    for (let i = 0; i < 1000; i++) {
      validateRange(i % 100, 0, 100);
    }
  });
});

describe("validateArrayLength benchmarks", () => {
  const smallArray = [1, 2, 3];
  const mediumArray = Array.from({ length: 50 }, (_, i) => i);
  const largeArray = Array.from({ length: 1000 }, (_, i) => i);

  bench("validate small array length", () => {
    validateArrayLength(smallArray, 1, 10);
  });

  bench("validate medium array length", () => {
    validateArrayLength(mediumArray, 10, 100);
  });

  bench("validate large array length", () => {
    validateArrayLength(largeArray, 100, 10000);
  });
});
