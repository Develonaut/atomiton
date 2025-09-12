import { z } from "zod";
import type { FieldConfig, ZodSchema, UIControlType } from "../types.js";

/**
 * Maps a Zod schema type to a form control configuration
 * @param schema - The Zod schema to analyze
 * @param fieldName - The name of the field
 * @returns Field configuration with inferred control type
 */
export function mapZodTypeToControl(
  schema: ZodSchema,
  fieldName: string,
): Omit<FieldConfig, "label" | "placeholder" | "description" | "helpText"> {
  const baseField = {
    name: fieldName,
    type: "text" as UIControlType,
    required: !(
      (schema as any)._def?.typeName === "ZodOptional" ||
      (schema as any)._def?.typeName === "ZodNullable"
    ),
  };

  const typeName = (schema as any)._def?.typeName;

  if (typeName === "ZodString") {
    const checks = (schema as any)._def.checks || [];

    if (checks.some((check: any) => check.kind === "email")) {
      return { ...baseField, type: "email" };
    }
    if (checks.some((check: any) => check.kind === "url")) {
      return { ...baseField, type: "url" };
    }

    return baseField;
  }

  if (typeName === "ZodNumber") {
    const checks = (schema as any)._def.checks || [];
    const minCheck = checks.find((check: any) => check.kind === "min");
    const maxCheck = checks.find((check: any) => check.kind === "max");

    return {
      ...baseField,
      type: "number",
      min: minCheck?.value,
      max: maxCheck?.value,
    };
  }

  if (typeName === "ZodBoolean") {
    return { ...baseField, type: "boolean" };
  }

  if (typeName === "ZodEnum") {
    const values = (schema as any)._def.values;
    return {
      ...baseField,
      type: "select",
      options: values.map((value: string | number) => ({
        label: String(value),
        value,
      })),
    };
  }

  if (typeName === "ZodDate") {
    return { ...baseField, type: "date" };
  }

  if (typeName === "ZodOptional") {
    const result = mapZodTypeToControl(
      (schema as any)._def.innerType,
      fieldName,
    );
    return { ...result, required: false };
  }

  if (typeName === "ZodNullable") {
    const result = mapZodTypeToControl(
      (schema as any)._def.innerType,
      fieldName,
    );
    return { ...result, required: false };
  }

  return baseField;
}
