import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { codeSchema } from "#schemas/code";

/**
 * Field configuration for code execution parameters
 * MVP: Core code execution only
 *
 * Auto-derived from codeSchema with selective overrides for:
 * - code: textarea instead of text input
 * - returnType: custom labels for enum options
 * - context: textarea instead of json editor
 */
export const codeFields = createFieldsFromSchema(codeSchema, {
  code: {
    controlType: "textarea",
    label: "JavaScript Code",
    placeholder: "input.name || 'Default Value'",
    rows: 5,
  },
  returnType: {
    label: "Return Type",
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
    rows: 3,
  },
});
