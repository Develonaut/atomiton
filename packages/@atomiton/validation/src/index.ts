// Import Zod
import { z } from 'zod';

// Create v as a wrapper around z
export const v = z;

// Default export
export default v;

// Create our own aliased types to prevent Zod type leakage
export type VType<T = any> = import('zod').ZodType<T>;
export type VRawShape = import('zod').ZodRawShape;
export type VObject<T extends VRawShape = VRawShape> = import('zod').ZodObject<T>;
export type VParseResult<T> = import('zod').SafeParseReturnType<unknown, T>;

// Create our own aliased types that don't reference Zod
export type VInfer<T> = T extends VType<infer U> ? U : never;

// Legacy aliases for compatibility (will be deprecated)
export type ZodType<T = any> = VType<T>;
export type ZodRawShape = VRawShape;
export type ZodObject<T extends ZodRawShape = ZodRawShape> = VObject<T>;
export type SafeParseReturnType<Input, Output> = VParseResult<Output>;
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
