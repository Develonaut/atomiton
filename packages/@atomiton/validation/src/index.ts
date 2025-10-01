import { z } from 'zod';
import type {
  ZodType as ZodTypeImport,
  ZodTypeAny as ZodTypeAnyImport,
  ZodRawShape as ZodRawShapeImport,
  ZodObject as ZodObjectImport,
  SafeParseReturnType as SafeParseReturnTypeImport,
} from 'zod';

export const v = z;

export default v;

export type VType<T = unknown> = ZodTypeImport<T>;
export type VRawShape = ZodRawShapeImport;
export type VObject<T extends VRawShape = VRawShape> = ZodObjectImport<T>;
export type VParseResult<T> = SafeParseReturnTypeImport<unknown, T>;

export type VInfer<T> = T extends VType<infer U> ? U : never;
export type VTypeAny = ZodTypeAnyImport;

export type ZodType<T = unknown> = VType<T>;
export type ZodTypeAny = VTypeAny;
export type ZodRawShape = VRawShape;
export type ZodObject<T extends ZodRawShape = ZodRawShape> = VObject<T>;
export type SafeParseReturnType<Output> = VParseResult<Output>;
export type ZodInfer<T> = VInfer<T>;

/**
 * JSON string validator with schema validation
 * Parses a JSON string and validates it against the provided schema
 *
 * @example
 * const userSchema = v.object({ name: v.string(), age: v.number() });
 * const userJsonString = jsonString(userSchema);
 * userJsonString.parse('{"name": "Alice", "age": 30}'); // { name: "Alice", age: 30 }
 * userJsonString.parse('{"name": "Alice"}'); // throws - missing age
 * userJsonString.parse('invalid json'); // throws - invalid JSON
 */
export const jsonString = <T extends z.ZodTypeAny>(schema: T) =>
  v
    .string()
    .transform((str, ctx): z.infer<T> => {
      try {
        return JSON.parse(str);
      } catch (e) {
        ctx.addIssue({
          code: 'custom',
          message: e instanceof Error ? e.message : 'Invalid JSON',
        });
        return z.NEVER;
      }
    })
    .pipe(schema);

export const validators = {
  uuid: v.string().uuid(),
  email: v.string().email(),
  url: v.string().url(),
  semver: v
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      'Invalid semantic version'
    ),
} as const;
