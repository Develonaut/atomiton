
import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for code execution parameters
 */
export const codeFields: NodeFieldsConfig = {
  code: {
    controlType: "textarea",
    label      : "JavaScript Code",
    placeholder: "input.name || 'Default Value'",
    helpText   : "JavaScript expression to execute (supports safe property access)",
    rows       : 5,
    required   : true,
  },
  timeout: {
    controlType: "number",
    label      : "Timeout (ms)",
    helpText   : "Maximum execution time in milliseconds",
    min        : 100,
    max        : 30000,
    step       : 100,
  },
  returnType: {
    controlType: "select",
    label      : "Return Type",
    helpText   : "Expected type of the return value",
    options    : [
      { value: "auto", label: "Auto-detect" },
      { value: "string", label: "String" },
      { value: "number", label: "Number" },
      { value: "boolean", label: "Boolean" },
      { value: "object", label: "Object" },
      { value: "array", label: "Array" },
    ],
  },
  memoryLimit: {
    controlType: "number",
    label      : "Memory Limit (MB)",
    helpText   : "Memory limit for isolated execution environment",
    min        : 8,
    max        : 128,
    step       : 8,
  },
};