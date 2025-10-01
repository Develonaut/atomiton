import { z, type ZodType } from 'zod';

/**
 * Creates a Zod schema that accepts a JSON string and coerces it to the target schema type.
 * Useful for accepting JSON strings from UI inputs while maintaining type safety.
 *
 * @example
 * ```typescript
 * const recordSchema = z.record(z.string());
 * const coercedSchema = jsonStringCoercion(recordSchema);
 *
 * coercedSchema.parse('{"key": "value"}'); // { key: "value" }
 * ```
 */
export const jsonStringCoercion = <T extends ZodType>(schema: T) =>
  z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          message: `Invalid JSON - ${(error as Error).message}`,
          fatal: true,
        });
        return z.NEVER;
      }
    })
    .pipe(schema);

/**
 * Creates a Zod schema that accepts either the target schema type OR a JSON string
 * that will be coerced to the target type.
 *
 * @example
 * ```typescript
 * const recordSchema = z.record(z.string());
 * const flexibleSchema = objectOrJsonString(recordSchema);
 *
 * flexibleSchema.parse({ key: "value" }); // { key: "value" }
 * flexibleSchema.parse('{"key": "value"}'); // { key: "value" }
 * ```
 */
export const objectOrJsonString = <T extends ZodType>(schema: T) =>
  z.union([schema, jsonStringCoercion(schema)]);
