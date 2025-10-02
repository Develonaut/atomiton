/**
 * Transform Operations
 * Core transformation operation implementations
 */

import type { NodeExecutionContext } from "#core/utils/executable";
import type { TransformParameters } from "#schemas/transform";
import {
  createSafeFunction,
  parseInitialValue,
  simpleGroupBy,
  simpleOrderBy,
  uniqueArray,
} from "#executables/transform/helpers";

/**
 * Execute map transformation
 */
export function executeMapTransform(
  data: unknown[],
  transformFunction: string,
  context: NodeExecutionContext,
): unknown[] {
  try {
    const mapFn = createSafeFunction(transformFunction);
    return data.map((item) => mapFn(item as Record<string, unknown>));
  } catch (error) {
    context.log?.warn?.(
      "Function evaluation failed, using fallback transformation",
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return data.map((item, index) => ({
      ...(typeof item === "object" && item !== null ? item : { value: item }),
      transformed: true,
      index,
    }));
  }
}

/**
 * Execute filter transformation
 */
export function executeFilterTransform(
  data: unknown[],
  filterCondition: string,
  context: NodeExecutionContext,
): unknown[] {
  try {
    const filterFn = createSafeFunction(filterCondition);
    return data.filter((item) => filterFn(item as Record<string, unknown>));
  } catch (error) {
    context.log?.warn?.(
      "Filter condition evaluation failed, filtering null/undefined values",
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return data.filter((item) => item != null);
  }
}

/**
 * Execute reduce transformation
 */
export function executeReduceTransform(
  data: unknown[],
  reduceFunction: string,
  reduceInitial: string,
  context: NodeExecutionContext,
): unknown {
  try {
    const reduceFn = createSafeFunction(reduceFunction);
    const initialValue = parseInitialValue(reduceInitial);
    return data.reduce(
      (acc, item, index) => reduceFn({ acc, item, index }),
      initialValue,
    );
  } catch (error) {
    context.log?.warn?.(
      "Reduce function evaluation failed, using sum fallback",
      {
        error: error instanceof Error ? error.message : String(error),
      },
    );
    // Fallback to sum for numbers
    return data.reduce((acc: number, item: unknown) => {
      const num =
        typeof item === "number"
          ? item
          : typeof item === "string"
            ? parseFloat(item)
            : 0;
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }
}

/**
 * Execute sort transformation
 */
export function executeSortTransform(
  data: unknown[],
  sortKey?: string,
  sortDirection: "asc" | "desc" = "asc",
): unknown[] {
  const sortKeys = sortKey ? [sortKey] : [(item: unknown) => item];
  const sortOrders: ("asc" | "desc")[] = [sortDirection];
  return simpleOrderBy(
    data,
    sortKeys as (string | ((item: unknown) => unknown))[],
    sortOrders,
  );
}

/**
 * Execute group transformation
 */
export function executeGroupTransform(
  data: unknown[],
  groupBy: string,
): Record<string, unknown[]> {
  return simpleGroupBy(data, groupBy);
}

/**
 * Execute flatten transformation
 */
export function executeFlattenTransform(
  data: unknown[],
  depth: number = 1,
): unknown[] {
  return data.flat(depth);
}

/**
 * Execute unique transformation
 */
export function executeUniqueTransform(data: unknown[]): unknown[] {
  return uniqueArray(data);
}

/**
 * Execute reverse transformation
 */
export function executeReverseTransform(data: unknown[]): unknown[] {
  return [...data].reverse();
}

/**
 * Execute limit transformation
 * Returns first N items from the array
 */
export function executeLimitTransform(
  data: unknown[],
  limitCount: number = 10,
): unknown[] {
  return data.slice(0, limitCount);
}

/**
 * Execute skip transformation
 * Skips first N items from the array
 */
export function executeSkipTransform(
  data: unknown[],
  skipCount: number = 0,
): unknown[] {
  return data.slice(skipCount);
}

/**
 * Execute slice transformation
 * Returns items between start and end indices
 */
export function executeSliceTransform(
  data: unknown[],
  sliceStart: number = 0,
  sliceEnd?: number,
): unknown[] {
  return data.slice(sliceStart, sliceEnd);
}

/**
 * Main transformation dispatcher
 */
export function executeTransformation(
  operation: string,
  data: unknown[],
  config: TransformParameters,
  context: NodeExecutionContext,
  functionOverride?: string,
): unknown {
  const transformFunction = functionOverride || config.transformFunction;

  switch (operation) {
    case "map":
      return executeMapTransform(data, transformFunction as string, context);

    case "filter": {
      // MVP: filterCondition removed, use transformFunction
      const filterCondition = transformFunction;
      return executeFilterTransform(data, filterCondition as string, context);
    }

    case "reduce":
      return executeReduceTransform(
        data,
        transformFunction as string,
        config.reduceInitial ?? "",
        context,
      );

    case "sort":
      return executeSortTransform(
        data,
        config.sortKey,
        config.sortDirection || "asc",
      );

    case "group": {
      const groupByKey = config.groupKey || config.sortKey;
      if (!groupByKey) {
        throw new Error("groupKey or sortKey is required for group operation");
      }
      return executeGroupTransform(data, groupByKey);
    }

    case "flatten":
      return executeFlattenTransform(
        data,
        typeof config.flattenDepth === "number" ? config.flattenDepth : 1,
      );

    case "unique":
      return executeUniqueTransform(data);

    case "reverse":
      return executeReverseTransform(data);

    case "limit":
      return executeLimitTransform(data, config.limitCount);

    case "skip":
      return executeSkipTransform(data, config.skipCount);

    case "slice":
      return executeSliceTransform(data, config.sliceStart, config.sliceEnd);

    default:
      return data;
  }
}
