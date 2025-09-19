// Import Zod
import { z } from 'zod';
import type {
  ZodType as ZodTypeImport,
  ZodRawShape as ZodRawShapeImport,
  ZodObject as ZodObjectImport,
  SafeParseReturnType as SafeParseReturnTypeImport,
} from 'zod';

// Create v as a wrapper around z
export const v = z;

// Default export
export default v;

// Create our own aliased types to prevent Zod type leakage
export type VType<T = unknown> = ZodTypeImport<T>;
export type VRawShape = ZodRawShapeImport;
export type VObject<T extends VRawShape = VRawShape> = ZodObjectImport<T>;
export type VParseResult<T> = SafeParseReturnTypeImport<unknown, T>;

// Create our own aliased types that don't reference Zod
export type VInfer<T> = T extends VType<infer U> ? U : never;

// Legacy aliases for compatibility (will be deprecated)
export type ZodType<T = unknown> = VType<T>;
export type ZodRawShape = VRawShape;
export type ZodObject<T extends ZodRawShape = ZodRawShape> = VObject<T>;
export type SafeParseReturnType<Output> = VParseResult<Output>;
export type ZodInfer<T> = VInfer<T>;

// Essential validators only
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
