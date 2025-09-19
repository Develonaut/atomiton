import v from "@atomiton/validation";
import { bench, describe } from "vitest";
import { generateFieldsFromSchema } from "../utils/generateFieldsFromSchema";
import { getDefaultValues } from "../utils/getDefaultValues";
import { mapZodTypeToControl } from "../utils/mapZodTypeToControl";

describe("Field Generation Performance", () => {
  const smallSchema = v.object({
    name: v.string(),
    age: v.number(),
    email: v.string().email(),
  });

  const mediumSchema = v.object({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string().email(),
    phone: v.string().optional(),
    age: v.number().min(0).max(120),
    birthDate: v.date(),
    active: v.boolean(),
    role: v.enum(["user", "admin", "moderator"]),
    bio: v.string().optional(),
    website: v.string().url().optional(),
  });

  const largeSchema = v.object(
    Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [
        `field_${i}`,
        i % 4 === 0
          ? v.string()
          : i % 4 === 1
            ? v.number()
            : i % 4 === 2
              ? v.boolean()
              : v.string().optional(),
      ]),
    ),
  );

  bench("generateFieldsFromSchema - small schema (3 fields)", () => {
    generateFieldsFromSchema(smallSchema);
  });

  bench("generateFieldsFromSchema - medium schema (10 fields)", () => {
    generateFieldsFromSchema(mediumSchema);
  });

  bench("generateFieldsFromSchema - large schema (100 fields)", () => {
    generateFieldsFromSchema(largeSchema);
  });

  bench("generateFieldsFromSchema with metadata - medium schema", () => {
    const metadata = {
      firstName: { label: "First Name", placeholder: "Enter first name" },
      lastName: { label: "Last Name", placeholder: "Enter last name" },
      email: { label: "Email Address", placeholder: "email@example.com" },
      bio: { type: "textarea" as const, label: "Biography" },
    };
    generateFieldsFromSchema(mediumSchema, metadata);
  });

  bench("getDefaultValues - small schema", () => {
    getDefaultValues(smallSchema);
  });

  bench("getDefaultValues - medium schema", () => {
    getDefaultValues(mediumSchema);
  });

  bench("getDefaultValues - large schema", () => {
    getDefaultValues(largeSchema);
  });

  bench("mapZodTypeToControl - string field", () => {
    mapZodTypeToControl(v.string(), "test");
  });

  bench("mapZodTypeToControl - complex field", () => {
    mapZodTypeToControl(v.number().min(0).max(100).optional(), "test");
  });

  bench("mapZodTypeToControl - enum field", () => {
    mapZodTypeToControl(
      v.enum(["option1", "option2", "option3", "option4", "option5"]),
      "test",
    );
  });
});
