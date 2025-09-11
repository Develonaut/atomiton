/**
 * Code Configuration
 *
 * Configuration for custom JavaScript execution for complex logic
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * Code specific configuration schema
 */
const codeSchema = {
  code: z
    .string()
    .default("// Write your JavaScript code here\nreturn data;")
    .describe("JavaScript code to execute"),

  inputParams: z
    .array(z.string())
    .default(["data"])
    .describe("Names of input parameters available in code"),

  returnType: z
    .enum(["any", "string", "number", "boolean", "object", "array"])
    .default("any")
    .describe("Expected return type"),

  async: z
    .boolean()
    .default(false)
    .describe("Enable async/await support in code"),

  timeout: z
    .number()
    .min(100)
    .max(30000)
    .default(5000)
    .describe("Maximum execution time in milliseconds"),
};

/**
 * Code Configuration Class
 */
class CodeConfigClass extends NodeConfig<typeof codeSchema> {
  constructor() {
    super(
      codeSchema,
      {
        code: "// Write your JavaScript code here\nreturn data;",
        inputParams: ["data"],
        returnType: "any" as const,
        async: false,
        timeout: 5000,
      },
      {
        fields: {
          code: {
            controlType: "textarea",
            label: "JavaScript Code",
            placeholder: "// Write your JavaScript code here\nreturn data;",
            helpText:
              "JavaScript code to execute. The 'data' parameter contains input from previous nodes.",
            rows: 10,
          },
          inputParams: {
            controlType: "text",
            label: "Input Parameters",
            placeholder: "data",
            helpText:
              "Comma-separated list of parameter names available in your code (e.g., data, context, utils)",
          },
          returnType: {
            controlType: "select",
            label: "Return Type",
            helpText: "Expected type of the value returned by your code",
            options: [
              { value: "any", label: "Any" },
              { value: "string", label: "String" },
              { value: "number", label: "Number" },
              { value: "boolean", label: "Boolean" },
              { value: "object", label: "Object" },
              { value: "array", label: "Array" },
            ],
          },
          async: {
            controlType: "boolean",
            label: "Enable Async/Await",
            helpText: "Enable async/await support for asynchronous operations",
          },
          timeout: {
            controlType: "number",
            label: "Timeout (ms)",
            helpText: "Maximum execution time in milliseconds",
            min: 100,
            max: 30000,
            step: 100,
          },
        },
        layout: {
          groups: {
            code: { label: "Code Settings", order: 1 },
            execution: { label: "Execution Settings", order: 2 },
          },
        },
      },
    );
  }
}

export const codeConfig = new CodeConfigClass();

export type CodeConfig = z.infer<typeof codeConfig.schema>;

// Input/Output schemas for external use
export const CodeInputSchema = z.object({
  data: z.any().optional(),
  params: z.record(z.any()).optional(),
});

export type CodeInput = z.infer<typeof CodeInputSchema>;

export const CodeOutputSchema = z.object({
  result: z.any(),
  success: z.boolean(),
  error: z.string().optional(),
  executionTime: z.number().optional(),
});

export type CodeOutput = z.infer<typeof CodeOutputSchema>;
