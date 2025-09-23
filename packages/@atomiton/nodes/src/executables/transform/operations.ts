/**
 * Transform Operations
 * Core transformation operation implementations
 */

import type { NodeExecutionContext } from "#core/types/executable";
import type { TransformParameters } from "#definitions/transform";
import {
  createSafeFunction,
  parseInitialValue,
  simpleGroupBy,
  simpleOrderBy,
  uniqueArray,
} from "./helpers";

/**
 * Execute map transformation
 */
export function executeMapTransform(
  data: unknown[],
  transformFunction: string,
  context: NodeExecutionContext
): unknown[] {
  try {
    const mapFn = createSafeFunction(transformFunction);
    return data.map((item) => mapFn(item as Record<string, unknown>));
  } catch (error) {
    context.log?.warn?.(
      "Function evaluation failed, using fallback transformation",
      {
        error: error instanceof Error ? error.message : String(error),
      }
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
  context: NodeExecutionContext
): unknown[] {
  try {
    const filterFn = createSafeFunction(filterCondition);
    return data.filter((item) => filterFn(item as Record<string, unknown>));
  } catch (error) {
    context.log?.warn?.(
      "Filter condition evaluation failed, filtering null/undefined values",
      {
        error: error instanceof Error ? error.message : String(error),
      }
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
  context: NodeExecutionContext
): unknown {
  try {
    const reduceFn = createSafeFunction(reduceFunction);
    const initialValue = parseInitialValue(reduceInitial);
    return data.reduce(
      (acc, item, index) => reduceFn({ acc, item, index }),
      initialValue
    );
  } catch (error) {
    context.log?.warn?.(
      "Reduce function evaluation failed, using sum fallback",
      {
        error: error instanceof Error ? error.message : String(error),
      }
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
  sortDirection: "asc" | "desc" = "asc"
): unknown[] {
  const sortKeys = sortKey ? [sortKey] : [(item: unknown) => item];
  const sortOrders: ("asc" | "desc")[] = [sortDirection];
  return simpleOrderBy(
    data,
    sortKeys as (string | ((item: unknown) => unknown))[],
    sortOrders
  );
}

/**
 * Execute group transformation
 */
export function executeGroupTransform(
  data: unknown[],
  groupBy: string
): Record<string, unknown[]> {
  return simpleGroupBy(data, groupBy);
}

/**
 * Execute flatten transformation
 */
export function executeFlattenTransform(
  data: unknown[],
  depth: number = 1
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
 * Main transformation dispatcher
 */
export function executeTransformation(
  operation: string,
  data: unknown[],
  config: TransformParameters,
  context: NodeExecutionContext,
  functionOverride?: string
): unknown {
  const transformFunction = functionOverride || config.transformFunction;

  switch (operation) {
    case "map":
      return executeMapTransform(data, transformFunction as string, context);

    case "filter": {
      const filterCondition = config.filterCondition || transformFunction;
      return executeFilterTransform(data, filterCondition as string, context);
    }

    case "reduce":
      return executeReduceTransform(
        data,
        config.reduceFunction as string,
        config.reduceInitial as string,
        context
      );

    case "sort":
      return executeSortTransform(
        data,
        config.sortKey,
        config.sortDirection as "asc" | "desc"
      );

    case "group": {
      if (!config.groupBy) {
        throw new Error("groupBy key is required for group operation");
      }
      return executeGroupTransform(data, config.groupBy);
    }

    case "flatten":
      return executeFlattenTransform(
        data,
        typeof config.flattenDepth === "number" ? config.flattenDepth : 1
      );

    case "unique":
      return executeUniqueTransform(data);

    case "reverse":
      return executeReverseTransform(data);

    default:
      return data;
  }
}