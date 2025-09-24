/**
 * Node Parameters Schema
 * Validates the serializable NodeParameters structure
 */

import v from "@atomiton/validation";

/**
 * Schema for UI field configuration
 */
const nodeFieldConfigSchema = v.object({
  controlType: v.enum([
    "text",
    "textarea",
    "password",
    "email",
    "url",
    "number",
    "range",
    "boolean",
    "select",
    "date",
    "datetime",
    "file",
    "color",
    "json",
    "code",
    "markdown",
    "rich-text",
  ]),
  label: v.string(),
  placeholder: v.string().optional(),
  helpText: v.string().optional(),
  required: v.boolean().optional(),
  min: v.number().optional(),
  max: v.number().optional(),
  step: v.number().optional(),
  rows: v.number().optional(),
  options: v
    .array(
      v.object({
        value: v.string(),
        label: v.string(),
      }),
    )
    .optional(),
});

/**
 * Schema for the serializable NodeParameters structure
 * This validates the data structure stored in definitions
 */
const nodeParametersSchema = v.object({
  defaults: v.record(v.unknown()),
  fields: v.record(nodeFieldConfigSchema),
});

export default nodeParametersSchema;
