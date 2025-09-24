import v from "@atomiton/validation";

/**
 * Code execution parameter schema
 */
export const codeSchema = {
  code: v
    .string()
    .min(1, "Code expression is required")
    .describe("JavaScript expression to execute"),

  timeout: v
    .number()
    .min(100)
    .max(30000)
    .default(5000)
    .describe("Execution timeout in milliseconds"),

  returnType: v
    .enum(["auto", "string", "number", "boolean", "object", "array"])
    .default("auto")
    .describe("Expected return type"),

  memoryLimit: v
    .number()
    .min(8)
    .max(128)
    .default(32)
    .describe("Memory limit for isolated execution in MB"),
};

/**
 * Default values for code execution parameters
 */
export const codeDefaults = {
  code: "input.value",
  timeout: 5000,
  returnType: "auto" as const,
  memoryLimit: 32,
};
