import { bench, describe } from "vitest";
import { z } from "zod";
import {
  generateFieldsFromSchema,
  getDefaultValues,
  mapZodTypeToControl,
} from "../index.js";

describe("Field Generation Performance", () => {
  const smallSchema = z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  });

  const mediumSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    age: z.number().min(0).max(120),
    birthDate: z.date(),
    active: z.boolean(),
    role: z.enum(["user", "admin", "moderator"]),
    bio: z.string().optional(),
    website: z.string().url().optional(),
  });

  const largeSchema = z.object(
    Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [
        `field_${i}`,
        i % 4 === 0
          ? z.string()
          : i % 4 === 1
            ? z.number()
            : i % 4 === 2
              ? z.boolean()
              : z.string().optional(),
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
    mapZodTypeToControl(z.string(), "test");
  });

  bench("mapZodTypeToControl - complex field", () => {
    mapZodTypeToControl(z.number().min(0).max(100).optional(), "test");
  });

  bench("mapZodTypeToControl - enum field", () => {
    mapZodTypeToControl(
      z.enum(["option1", "option2", "option3", "option4", "option5"]),
      "test",
    );
  });
});
