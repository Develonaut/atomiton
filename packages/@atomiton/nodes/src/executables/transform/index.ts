/**
 * Transform Node Executable
 * Node.js implementation with data transformation logic
 */

import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult
} from '../../core/types/executable';
import { createNodeExecutable } from '../../core/factories/createNodeExecutable';
import type { TransformParameters } from '../../definitions/transform';

// Types for transform operations
export type TransformOutput = {
  result: unknown;
  data: unknown;
  inputCount: number;
  outputCount: number;
  operation: string;
  success: boolean;
};

/**
 * Get input value safely
 */
function getInputValue<T>(context: NodeExecutionContext, key: string): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Simple group by implementation
 */
function simpleGroupBy<T>(array: T[], keyFn: string | ((item: T) => string)): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of array) {
    const key = typeof keyFn === 'string'
      ? String((item as any)[keyFn])
      : keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/**
 * Simple order by implementation
 */
function simpleOrderBy<T>(array: T[], keys: (string | ((item: T) => any))[], orders: ('asc' | 'desc')[]): T[] {
  return [...array].sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const order = orders[i] || 'asc';

      const aVal = typeof key === 'string' ? (a as any)[key] : key(a);
      const bVal = typeof key === 'string' ? (b as any)[key] : key(b);

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;

      if (comparison !== 0) {
        return order === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Safe function evaluation (simplified - in production, use a proper sandbox)
 */
function safeEval(func: string, context: Record<string, any> = {}): Function {
  try {
    // Simple function creation - in production, use a proper sandbox like vm2
    // This is a simplified version for demo purposes
    if (func.includes('=>')) {
      // Arrow function
      return new Function('return ' + func)();
    } else {
      // Regular function
      return new Function(...Object.keys(context), 'return ' + func)(...Object.values(context));
    }
  } catch (error) {
    throw new Error(`Invalid function: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse JSON value safely
 */
function parseInitialValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    // If JSON parsing fails, try to evaluate as a simple value
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(Number(value))) return Number(value);
    return value; // Return as string
  }
}

/**
 * Remove duplicates from array
 */
function uniqueArray<T>(array: T[]): T[] {
  return Array.from(new Set(array.map(item => JSON.stringify(item))))
    .map(item => JSON.parse(item));
}

/**
 * Transform node executable
 */
export const transformExecutable: NodeExecutable<TransformParameters> = createNodeExecutable({
  async execute(
    context: NodeExecutionContext,
    config: TransformParameters,
  ): Promise<NodeExecutionResult> {
    try {
      // Get input data
      const inputData = getInputValue<unknown[]>(context, "data") || [];
      const functionOverride = getInputValue<string>(context, "function");

      context.log?.info?.(`Performing ${config.operation} transformation`, {
        operation: config.operation,
        inputCount: Array.isArray(inputData) ? inputData.length : 0,
      });

      if (!Array.isArray(inputData)) {
        throw new Error("Input data must be an array for transformation");
      }

      let transformedData: unknown;
      const transformFunction = functionOverride || config.transformFunction;

      switch (config.operation) {
        case "map": {
          try {
            const mapFn = safeEval(transformFunction);
            transformedData = inputData.map((item, index) => mapFn(item, index));
          } catch (error) {
            // Fallback to simple transformation
            context.log?.warn?.('Function evaluation failed, using fallback transformation', {
              error: error instanceof Error ? error.message : String(error)
            });
            transformedData = inputData.map((item, index) => ({
              ...item,
              transformed: true,
              index,
            }));
          }
          break;
        }

        case "filter": {
          try {
            const filterCondition = config.filterCondition || transformFunction;
            const filterFn = safeEval(filterCondition);
            transformedData = inputData.filter((item, index) => filterFn(item, index));
          } catch (error) {
            // Fallback to null filtering
            context.log?.warn?.('Filter condition evaluation failed, filtering null/undefined values', {
              error: error instanceof Error ? error.message : String(error)
            });
            transformedData = inputData.filter((item) => item != null);
          }
          break;
        }

        case "reduce": {
          try {
            const reduceFn = safeEval(config.reduceFunction);
            const initialValue = parseInitialValue(config.reduceInitial);
            transformedData = inputData.reduce((acc, item, index) => reduceFn(acc, item, index), initialValue);
          } catch (error) {
            context.log?.warn?.('Reduce function evaluation failed, using sum fallback', {
              error: error instanceof Error ? error.message : String(error)
            });
            // Fallback to sum for numbers
            transformedData = inputData.reduce((acc: number, item: any) => {
              const num = typeof item === 'number' ? item : (typeof item === 'string' ? parseFloat(item) : 0);
              return acc + (isNaN(num) ? 0 : num);
            }, 0);
          }
          break;
        }

        case "sort": {
          const sortKeys = config.sortKey
            ? [config.sortKey]
            : [(item: unknown) => item];
          const sortOrders: ("asc" | "desc")[] = [config.sortDirection];
          transformedData = simpleOrderBy(inputData, sortKeys, sortOrders);
          break;
        }

        case "group": {
          if (!config.groupBy) {
            throw new Error("groupBy key is required for group operation");
          }
          transformedData = simpleGroupBy(inputData, config.groupBy);
          break;
        }

        case "flatten": {
          transformedData = inputData.flat(config.flattenDepth);
          break;
        }

        case "unique": {
          transformedData = uniqueArray(inputData);
          break;
        }

        case "reverse": {
          transformedData = [...inputData].reverse();
          break;
        }

        default:
          transformedData = inputData;
      }

      // Calculate output count
      let outputCount: number;
      if (Array.isArray(transformedData)) {
        outputCount = transformedData.length;
      } else if (transformedData && typeof transformedData === 'object') {
        outputCount = Object.keys(transformedData).length;
      } else {
        outputCount = 1;
      }

      const output: TransformOutput = {
        result: transformedData,
        data: transformedData,
        inputCount: inputData.length,
        outputCount,
        operation: config.operation,
        success: true,
      };

      context.log?.info?.(`Transformation completed: ${config.operation}`, {
        inputCount: inputData.length,
        outputCount,
      });

      return {
        success: true,
        outputs: output,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      context.log?.error?.('Transformation failed', {
        error: errorMessage,
        operation: config.operation,
      });

      return {
        success: false,
        error: errorMessage,
        outputs: {
          result: null,
          data: null,
          inputCount: 0,
          outputCount: 0,
          operation: config.operation,
          success: false,
        },
      };
    }
  },

  validateConfig(config: unknown): TransformParameters {
    // In a real implementation, this would validate using the schema
    // For now, just cast it
    return config as TransformParameters;
  },
});

export default transformExecutable;