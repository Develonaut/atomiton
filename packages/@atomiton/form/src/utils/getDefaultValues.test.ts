import { getDefaultValues } from "#getDefaultValues";
import v from "@atomiton/validation";
import { describe, expect, it } from "vitest";

describe("getDefaultValues", () => {
  describe("basic type defaults", () => {
    it("generates defaults for string fields", () => {
      const schema = v.object({
        name: v.string(),
        title: v.string(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        name: "",
        title: "",
      });
    });

    it("generates defaults for number fields", () => {
      const schema = v.object({
        age: v.number(),
        score: v.number(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        age: 0,
        score: 0,
      });
    });

    it("generates defaults for boolean fields", () => {
      const schema = v.object({
        active: v.boolean(),
        verified: v.boolean(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        active: false,
        verified: false,
      });
    });

    it("generates defaults for date fields", () => {
      const schema = v.object({
        createdAt: v.date(),
        updatedAt: v.date(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("generates defaults for mixed types", () => {
      const schema = v.object({
        name: v.string(),
        age: v.number(),
        active: v.boolean(),
        birthDate: v.date(),
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
      const schema = v.object({
        name: v.string().optional(),
        age: v.number().optional(),
        active: v.boolean().optional(),
        birthDate: v.date().optional(),
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
      const schema = v.object({
        name: v.string().nullable(),
        age: v.number().nullable(),
        active: v.boolean().nullable(),
        birthDate: v.date().nullable(),
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
      const schema = v.object({
        requiredName: v.string(),
        optionalName: v.string().optional(),
        requiredAge: v.number(),
        optionalAge: v.number().optional(),
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
      const schema = v.object({
        email: v.string().email(),
        url: v.string().url(),
        minString: v.string().min(5),
        maxString: v.string().max(10),
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
      const schema = v.object({
        status: v.enum(["active", "inactive"]),
        priority: v.enum(["low", "medium", "high"]),
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
      const schema = v.object({
        age: v.number().min(18),
        score: v.number().max(100),
        rating: v.number().min(1).max(5),
        price: v.number().positive(),
        count: v.number().int(),
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
      const schema = v.object({});
      const result = getDefaultValues(schema);

      expect(result).toEqual({});
    });

    it("handles large schema with many fields", () => {
      const schema = v.object({
        // Personal info
        firstName: v.string(),
        lastName: v.string(),
        email: v.string().email(),
        phone: v.string().optional(),

        // Demographics
        age: v.number().min(18),
        birthDate: v.date(),

        // Preferences
        newsletter: v.boolean(),
        theme: v.enum(["light", "dark"]).optional(),

        // Optional fields
        bio: v.string().optional(),
        website: v.string().url().optional(),
        avatar: v.string().nullable(),
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
      const schema = v.object({
        name: v.string().optional(),
        age: v.number().optional(),
        active: v.boolean().optional(),
        date: v.date().optional(),
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
      const schema = v.object({
        name: v.string().nullable(),
        age: v.number().nullable(),
        active: v.boolean().nullable(),
        date: v.date().nullable(),
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
      const schema = v.object({
        anyField: v.any(),
        unknownField: v.unknown(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        anyField: undefined,
        unknownField: undefined,
      });
    });

    it("handles array types as undefined", () => {
      const schema = v.object({
        tags: v.array(v.string()),
        numbers: v.array(v.number()),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        tags: undefined,
        numbers: undefined,
      });
    });

    it("handles object types as undefined", () => {
      const schema = v.object({
        nested: v.object({ name: v.string() }),
        record: v.record(v.string()),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        nested: undefined,
        record: undefined,
      });
    });

    it("handles union types as undefined", () => {
      const schema = v.object({
        stringOrNumber: v.union([v.string(), v.number()]),
        stringOrNull: v.string().or(v.null()),
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
      const stringSchema = v.string();
      const result = getDefaultValues(stringSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for array schemas", () => {
      const arraySchema = v.array(v.string());
      const result = getDefaultValues(arraySchema);

      expect(result).toEqual({});
    });

    it("returns empty object for number schemas", () => {
      const numberSchema = v.number();
      const result = getDefaultValues(numberSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for union schemas", () => {
      const unionSchema = v.union([v.string(), v.number()]);
      const result = getDefaultValues(unionSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for null schema", () => {
      const nullSchema = v.null();
      const result = getDefaultValues(nullSchema);

      expect(result).toEqual({});
    });

    it("returns empty object for undefined schema", () => {
      const undefinedSchema = v.undefined();
      const result = getDefaultValues(undefinedSchema);

      expect(result).toEqual({});
    });
  });

  describe("field name handling", () => {
    it("preserves field names exactly", () => {
      const schema = v.object({
        "field-with-dashes": v.string(),
        field_with_underscores: v.string(),
        "field with spaces": v.string(),
        camelCaseField: v.string(),
        PascalCaseField: v.string(),
        UPPER_CASE_FIELD: v.string(),
        "123numericStart": v.string(),
        "field.with.dots": v.string(),
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
      const schema = v.object({
        "": v.string(),
        normal: v.string(),
      });

      const result = getDefaultValues(schema);

      expect(result).toEqual({
        "": "",
        normal: "",
      });
    });
  });
});
