/**
 * Transform Helper Functions
 * Extracted helper functions for transform operations
 */

/**
 * Simple group by implementation
 */
export function simpleGroupBy<T>(
  array: T[],
  keyFn: string | ((item: T) => string)
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of array) {
    const key =
      typeof keyFn === "string"
        ? String(
            item && typeof item === "object" && keyFn in item
              ? (item as Record<string, unknown>)[keyFn]
              : undefined
          )
        : keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/**
 * Simple order by implementation
 */
export function simpleOrderBy<T>(
  array: T[],
  keys: (string | ((item: T) => unknown))[],
  orders: ("asc" | "desc")[]
): T[] {
  return [...array].sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const order = orders[i] || "asc";

      const aVal =
        typeof key === "string"
          ? a && typeof a === "object" && key in a
            ? (a as Record<string, unknown>)[key]
            : undefined
          : key(a);
      const bVal =
        typeof key === "string"
          ? b && typeof b === "object" && key in b
            ? (b as Record<string, unknown>)[key]
            : undefined
          : key(b);

      let comparison = 0;
      // Safe comparison with type coercion
      const aString = String(aVal);
      const bString = String(bVal);
      const aNum = Number(aVal);
      const bNum = Number(bVal);

      // Try numeric comparison first if both are numbers
      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum < bNum) comparison = -1;
        else if (aNum > bNum) comparison = 1;
      } else {
        // Fall back to string comparison
        if (aString < bString) comparison = -1;
        else if (aString > bString) comparison = 1;
      }

      if (comparison !== 0) {
        return order === "asc" ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Create a safe function from a string expression
 * Only supports simple property access and basic operations
 */
export function createSafeFunction(
  expression: string
): (item: Record<string, unknown>) => unknown {
  // Remove any potentially dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /require\s*\(/,
    /import\s*\(/,
    /process\./,
    /global\./,
    /__proto__/,
    /constructor\./,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(expression)) {
      throw new Error(`Unsafe expression detected: ${pattern.source}`);
    }
  }

  // Parse arrow function syntax
  if (expression.includes("=>")) {
    const parts = expression.split("=>").map((s) => s.trim());
    if (parts.length !== 2) {
      throw new Error("Invalid arrow function syntax");
    }

    const param = parts[0].replace(/[()]/g, "").trim();
    const body = parts[1].trim();

    // Return a safe function that only accesses object properties
    return (item: Record<string, unknown>) => {
      try {
        // Simple property access evaluation
        return evaluateExpression(body, { [param]: item });
      } catch (error) {
        throw new Error(
          `Failed to evaluate expression: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };
  }

  // For non-arrow functions, treat as simple property accessor
  return (item: Record<string, unknown>) => {
    return evaluateExpression(expression, { item });
  };
}

/**
 * Safely evaluate a simple expression with property access
 */
export function evaluateExpression(
  expr: string,
  context: Record<string, unknown>
): unknown {
  // Handle simple property access like "item.name" or "x.value"
  const propertyAccessPattern = /^(\w+)(\.[\w.]+)?$/;
  const match = expr.match(propertyAccessPattern);

  if (match) {
    const [, varName, propertyPath] = match;
    let value = context[varName];

    if (propertyPath) {
      const properties = propertyPath.slice(1).split(".");
      for (const prop of properties) {
        if (value && typeof value === "object") {
          value = (value as Record<string, unknown>)[prop];
        } else {
          return undefined;
        }
      }
    }

    return value;
  }

  // For more complex expressions, throw an error
  throw new Error(
    `Complex expressions are not supported for security reasons: ${expr}`
  );
}

/**
 * Parse JSON value safely
 */
export function parseInitialValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    // If JSON parsing fails, try to evaluate as a simple value
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    if (!isNaN(Number(value))) return Number(value);
    return value; // Return as string
  }
}

/**
 * Remove duplicates from array
 */
export function uniqueArray<T>(array: T[]): T[] {
  return Array.from(new Set(array.map((item) => JSON.stringify(item)))).map(
    (item) => JSON.parse(item)
  );
}