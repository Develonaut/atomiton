/**
 * Transform Configuration
 *
 * Configuration for transforming data, arrays, JSON, and templates
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig.js";

/**
 * Transform specific configuration schema
 */
const transformSchema = {
  operation: z
    .enum(["map", "filter", "template", "jsonPath", "custom"])
    .default("map")
    .describe("Type of transformation operation"),

  expression: z
    .string()
    .default("")
    .describe("JavaScript expression or template string for transformation"),

  templateVars: z
    .record(z.any())
    .optional()
    .describe("Variables available in template context"),

  jsonPath: z
    .string()
    .optional()
    .describe("JSONPath expression for extracting data"),
};

/**
 * Transform Configuration Class
 */
class TransformConfigClass extends NodeConfig<typeof transformSchema> {
  constructor() {
    super(
      transformSchema,
      {
        operation: "map" as const,
        expression: "",
      },
      {
        fields: {
          operation: {
            controlType: "select",
            label: "Transform Operation",
            helpText: "Select the type of transformation to perform",
            options: [
              { value: "map", label: "Map - Transform each item" },
              { value: "filter", label: "Filter - Select items by condition" },
              { value: "template", label: "Template - Apply template string" },
              {
                value: "jsonPath",
                label: "JSONPath - Extract data using path",
              },
              { value: "custom", label: "Custom - Custom JavaScript function" },
            ],
          },
          expression: {
            controlType: "textarea",
            label: "Expression/Template",
            placeholder: "item => item.value * 2",
            helpText:
              "JavaScript expression, template string, or JSONPath depending on operation type",
            rows: 4,
          },
          templateVars: {
            controlType: "json",
            label: "Template Variables",
            placeholder: '{"key": "value"}',
            helpText: "Variables available in template context (JSON format)",
          },
          jsonPath: {
            controlType: "text",
            label: "JSONPath Expression",
            placeholder: "$.data[*].items",
            helpText:
              "JSONPath expression for extracting data (e.g., $.data[*].items)",
          },
        },
      },
    );
  }
}

// Config instance is only used internally for type inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const transformConfig = new TransformConfigClass();

export type TransformConfig = z.infer<typeof transformConfig.schema>;
