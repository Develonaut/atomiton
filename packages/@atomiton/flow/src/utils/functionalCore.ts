import type { ExecutionResult } from "#types";

export const compose = <T>(...fns: Array<(arg: T) => T>): ((arg: T) => T) => {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
};

export const pipe = <T>(...fns: Array<(arg: T) => T>): ((arg: T) => T) => {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
};

export const combineResults = <T>(
  ...results: ExecutionResult<T>[]
): ExecutionResult<T[]> => {
  const success = results.every((r) => r.success);
  const data = results
    .map((r) => r.data)
    .filter((d): d is T => d !== undefined);
  const errors = results
    .map((r) => r.error)
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  return {
    success,
    data: data.length > 0 ? data : undefined,
    error: errors.length > 0 ? errors[0] : undefined,
    duration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
  };
};
