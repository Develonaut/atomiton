/**
 * Code Node Parameters
 *
 * Parameter schema for executing custom JavaScript code
 */

import { z } from "zod";
import { createAtomicParameters } from "../../createAtomicParameters";

const codeSchema = {
  code: z
    .string()
    .default("// Write your JavaScript code here\nreturn data;")
    .describe("JavaScript code to execute"),

  inputParams: z
    .string()
    .default("data")
    .describe("Comma-separated list of parameter names"),

  returnType: z
    .enum(["any", "string", "number", "boolean", "object", "array"])
    .default("any")
    .describe("Expected return type"),

  async: z.boolean().default(false).describe("Enable async/await support"),
};

export const codeParameters = createAtomicParameters(
  codeSchema,
  {
    code: "// Write your JavaScript code here\nreturn data;",
    inputParams: "data",
    returnType: "any",
    async: false,
  },
  {
    code: {
      controlType: "code",
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
  },
);

export type CodeParameters = z.infer<typeof codeParameters.schema>;
