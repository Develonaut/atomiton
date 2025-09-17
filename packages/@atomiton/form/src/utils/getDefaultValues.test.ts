import { describe, it, expect } from "vitest";
import { z } from "@atomiton/validation";
import { getDefaultValues } from "./getDefaultValues";

describe("getDefaultValues", () => {
  describe("basic type defaults", () => {
    it("generates defaults for string fields", () => {
      const schema = z.object({
        name: z.string(),
        title: z.string(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        name: "",
        title: "",
      });
    });

    it("generates defaults for number fields", () => {
      const schema = z.object({
        age: z.number(),
        score: z.number(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        age: 0,
        score: 0,
      });
    });

    it("generates defaults for boolean fields", () => {
      const schema = z.object({
        active: z.boolean(),
        verified: z.boolean(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        active: false,
        verified: false,
      });
    });

    it("generates defaults for date fields", () => {
      const schema = z.object({
        createdAt: z.date(),
        updatedAt: z.date(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("generates defaults for mixed types", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        active: z.boolean(),
        birthDate: z.date(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        name: "",
        age: 0,
        active: false,
        birthDate: undefined,
      });
    });
  });

  describe("optional and nullable fields", () => {
    it("generates undefined for optional fields", () => {
      const schema = z.object({
        name: z.string().optional(),
        age: z.number().optional(),
        active: z.boolean().optional(),
        birthDate: z.date().optional(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        name: undefined,
        age: undefined,
        active: undefined,
        birthDate: undefined,
      });
    });

    it("generates undefined for nullable fields", () => {
      const schema = z.object({
        name: z.string().nullable(),
        age: z.number().nullable(),
        active: z.boolean().nullable(),
        birthDate: z.date().nullable(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        name: undefined,
        age: undefined,
        active: undefined,
        birthDate: undefined,
      });
    });

    it("handles mixed required and optional fields", () => {
      const schema = z.object({
        requiredName: z.string(),
        optionalName: z.string().optional(),
        requiredAge: z.number(),
        optionalAge: z.number().optional(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        requiredName: "",
        optionalName: undefined,
        requiredAge: 0,
        optionalAge: undefined,
      });
    });
  });

  describe("string field variations", () => {
    it("handles string with validations as empty string", () => {
      const schema = z.object({
        email: z.string().email(),
        url: z.string().url(),
        minString: z.string().min(5),
        maxString: z.string().max(10),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        email: "",
        url: "",
        minString: "",
        maxString: "",
      });
    });

    it("handles string enums as undefined", () => {
      const schema = z.object({
        status: z.enum(["active", "inactive"]),
        priority: z.enum(["low", "medium", "high"]),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        status: undefined,
        priority: undefined,
      });
    });
  });

  describe("number field variations", () => {
    it("handles number with constraints as 0", () => {
      const schema = z.object({
        age: z.number().min(18),
        score: z.number().max(100),
        rating: z.number().min(1).max(5),
        price: z.number().positive(),
        count: z.number().int(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        age: 0,
        score: 0,
        rating: 0,
        price: 0,
        count: 0,
      });
    });
  });

  describe("complex schemas", () => {
    it("handles empty object schema", () => {
      const schema = z.object({});
      const result = getDefaultValues(schema);

      expect(result).toEqual({});
    });

    it("handles large schema with many fields", () => {
      const schema = z.object({
        // Personal info
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),

        // Demographics
        age: z.number().min(18),
        birthDate: z.date(),

        // Preferences
        newsletter: z.boolean(),
        theme: z.enum(["light", "dark"]).optional(),

        // Optional fields
        bio: z.string().optional(),
        website: z.string().url().optional(),
        avatar: z.string().nullable(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        firstName: "",
        lastName: "",
        email: "",
        phone: undefined,
        age: 0,
        birthDate: undefined,
        newsletter: false,
        theme: undefined,
        bio: undefined,
        website: undefined,
        avatar: undefined,
      });
    });

    it("handles schema with all optional fields", () => {
      const schema = z.object({
        name: z.string().optional(),
        age: z.number().optional(),
        active: z.boolean().optional(),
        date: z.date().optional(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        name: undefined,
        age: undefined,
        active: undefined,
        date: undefined,
      });
    });

    it("handles schema with all nullable fields", () => {
      const schema = z.object({
        name: z.string().nullable(),
        age: z.number().nullable(),
        active: z.boolean().nullable(),
        date: z.date().nullable(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        name: undefined,
        age: undefined,
        active: undefined,
        date: undefined,
      });
    });
  });

  describe("unknown and unsupported types", () => {
    it("handles unknown types as undefined", () => {
      const schema = z.object({
        anyField: z.any(),
        unknownField: z.unknown(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        anyField: undefined,
        unknownField: undefined,
      });
    });

    it("handles array types as undefined", () => {
      const schema = z.object({
        tags: z.array(z.string()),
        numbers: z.array(z.number()),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        tags: undefined,
        numbers: undefined,
      });
    });

    it("handles object types as undefined", () => {
      const schema = z.object({
        nested: z.object({ name: z.string() }),
        record: z.record(z.string()),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        nested: undefined,
        record: undefined,
      });
    });

    it("handles union types as undefined", () => {
      const schema = z.object({
        stringOrNumber: z.union([z.string(), z.number()]),
        stringOrNull: z.string().or(z.null()),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        stringOrNumber: undefined,
        stringOrNull: undefined,
      });
    });
  });

  describe("error handling", () => {
    it("returns empty object for non-object schemas", () => {
      const stringSchema = z.string();
      const result = getDefaultValues(stringSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for array schemas", () => {
      const arraySchema = z.array(z.string());
      const result = getDefaultValues(arraySchema);

      expect(result).toEqual({});
    });

    it("returns empty object for number schemas", () => {
      const numberSchema = z.number();
      const result = getDefaultValues(numberSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for union schemas", () => {
      const unionSchema = z.union([z.string(), z.number()]);
      const result = getDefaultValues(unionSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for null schema", () => {
      const nullSchema = z.null();
      const result = getDefaultValues(nullSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for undefined schema", () => {
      const undefinedSchema = z.undefined();
      const result = getDefaultValues(undefinedSchema);

      expect(result).toEqual({});
    });
  });

  describe("field name handling", () => {
    it("preserves field names exactly", () => {
      const schema = z.object({
        "field-with-dashes": z.string(),
        field_with_underscores: z.string(),
        "field with spaces": z.string(),
        camelCaseField: z.string(),
        PascalCaseField: z.string(),
        UPPER_CASE_FIELD: z.string(),
        "123numericStart": z.string(),
        "field.with.dots": z.string(),
      });

      const result = getDefaultValues(schema);

      expect(Object.keys(result)).toEqual([
        "field-with-dashes",
        "field_with_underscores",
        "field with spaces",
        "camelCaseField",
        "PascalCaseField",
        "UPPER_CASE_FIELD",
        "123numericStart",
        "field.with.dots",
      ]);

      Object.values(result).forEach((value) => {
        expect(value).toBe("");
      });
    });

    it("handles empty field names", () => {
      const schema = z.object({
        "": z.string(),
        normal: z.string(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        "": "",
        normal: "",
      });
    });
  });
});
