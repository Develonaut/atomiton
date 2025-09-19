import { z } from 'zod';
import type {
  ZodType as ZodTypeImport,
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

export type ZodType<T = unknown> = VType<T>;
export type ZodRawShape = VRawShape;
export type ZodObject<T extends ZodRawShape = ZodRawShape> = VObject<T>;
export type SafeParseReturnType<Output> = VParseResult<Output>;
export type ZodInfer<T> = VInfer<T>;

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
