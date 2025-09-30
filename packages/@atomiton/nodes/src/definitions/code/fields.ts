import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for code execution parameters
 * MVP: Core code execution only
 */
export const codeFields: NodeFieldsConfig = {
  code: {
    controlType: "textarea",
    label: "JavaScript Code",
    placeholder: "input.name || 'Default Value'",
    helpText: "JavaScript expression to execute",
    rows: 5,
    required: true,
  },
  returnType: {
    controlType: "select",
    label: "Return Type",
    helpText: "Expected type of the return value",
    options: [
      { value: "auto", label: "Auto" },
      { value: "string", label: "String" },
      { value: "number", label: "Number" },
      { value: "boolean", label: "Boolean" },
      { value: "object", label: "Object" },
      { value: "array", label: "Array" },
    ],
  },
  context: {
    controlType: "textarea",
    label: "Context (optional)",
    placeholder: '{"key": "value"}',
    helpText: "Variables to make available in code",
    rows: 3,
  },
};
