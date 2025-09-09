/**
 * Transform Configuration
 *
 * Configuration for transforming data, arrays, JSON, and templates
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

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
    super(transformSchema, {
      operation: "map" as const,
      expression: "",
    });
  }
}

// Create singleton instance
export const transformConfig = new TransformConfigClass();

// Export for backward compatibility and external use
export const transformConfigSchema = transformConfig.schema;
export const defaultTransformConfig = transformConfig.defaults;
export type TransformConfig = z.infer<typeof transformConfig.schema>;

// Input/Output schemas for external use
export const TransformInputSchema = z.object({
  data: z.any().optional(),
  template: z.string().optional(),
  context: z.record(z.any()).optional(),
});

export type TransformInput = z.infer<typeof TransformInputSchema>;

export const TransformOutputSchema = z.object({
  result: z.any(),
  success: z.boolean(),
});

export type TransformOutput = z.infer<typeof TransformOutputSchema>;
