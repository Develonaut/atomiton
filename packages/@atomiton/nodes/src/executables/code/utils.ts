// Dynamic import to handle Electron compatibility
let ivm: typeof import("isolated-vm");

/**
 * Secure code executor using isolated-vm
 * Provides true V8 isolation for JavaScript code execution
 */
export async function executeSecureCode(
  code: string,
  context: Record<string, unknown>,
  options: {
    memoryLimit?: number;
    timeoutMs?: number;
  } = {},
): Promise<unknown> {
  const { memoryLimit = 32, timeoutMs = 5000 } = options;

  // Dynamically import isolated-vm to handle Electron compatibility
  if (!ivm) {
    try {
      ivm = await import("isolated-vm");
    } catch (error) {
      throw new Error(
        `Failed to load isolated-vm: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Create isolated V8 instance
  const isolate = new ivm.Isolate({ memoryLimit });

  try {
    // Create execution context
    const vmContext = await isolate.createContext();

    // Set up context variables with safe copying
    for (const [key, value] of Object.entries(context)) {
      const safeCopy = await createSafeCopy(value);
      await vmContext.global.set(key, safeCopy);
    }

    // Create and compile the script
    const script = await isolate.compileScript(`
      (() => {
        return ${code};
      })()
    `);

    // Execute with timeout
    const result = await script.run(vmContext, { timeout: timeoutMs });

    // Copy result back to main context safely
    return await extractResult(result);
  } finally {
    // Clean up isolate
    isolate.dispose();
  }
}

/**
 * Create a safe copy of data for the isolated context
 */
async function createSafeCopy(value: unknown): Promise<any> {
  // Handle different types safely
  if (value === null || value === undefined) {
    return new ivm.ExternalCopy(value);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return new ivm.ExternalCopy(value);
  }

  if (Array.isArray(value)) {
    // Create safe copy of array
    const safeCopy = value.map((item) => {
      if (typeof item === "object" && item !== null) {
        return JSON.parse(JSON.stringify(item)); // Deep clone to prevent prototype pollution
      }
      return item;
    });
    return new ivm.ExternalCopy(safeCopy);
  }

  if (typeof value === "object") {
    // Create safe copy of object
    const safeCopy = JSON.parse(JSON.stringify(value)); // Deep clone to prevent prototype pollution
    return new ivm.ExternalCopy(safeCopy);
  }

  // For other types, convert to string
  return new ivm.ExternalCopy(String(value));
}

/**
 * Extract result from isolated context safely
 */
async function extractResult(result: unknown): Promise<unknown> {
  if (ivm && result instanceof ivm.ExternalCopy) {
    return result.copy();
  }

  // For primitive values
  return result;
}

/**
 * Type conversion utility
 */
export function convertToType(value: unknown, targetType: string): unknown {
  if (targetType === "auto") {
    return value;
  }

  switch (targetType) {
    case "string":
      return String(value ?? "");
    case "number": {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }
    case "boolean":
      return Boolean(value);
    case "object":
      if (typeof value === "object") return value;
      try {
        return JSON.parse(String(value));
      } catch {
        return {};
      }
    case "array":
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          return [value];
        }
      }
      return [value];
    default:
      return value;
  }
}

/**
 * Get actual type of a value
 */
export function getActualType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
