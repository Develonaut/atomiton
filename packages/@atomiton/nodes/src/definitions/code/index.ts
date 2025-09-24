import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { codeFields } from "#definitions/code/fields";
import { codeInputPorts, codeOutputPorts } from "#definitions/code/ports";
import { codeDefaults, codeSchema } from "#definitions/code/schema";

/**
 * Code execution node definition (browser-safe)
 */
export const codeDefinition: NodeDefinition = createNodeDefinition({
  metadata: createNodeMetadata({
    id: "code",
    name: "Code",
    type: "code",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Execute safe JavaScript expressions with input data",
    category: "logic",
    icon: "code-2",
    keywords: [
      "code",
      "javascript",
      "js",
      "expression",
      "evaluate",
      "script",
      "logic",
      "function",
      "calculate",
      "transform",
    ],
    tags: ["code", "logic", "javascript", "expression"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(codeSchema, codeDefaults, codeFields),
  inputPorts: codeInputPorts,
  outputPorts: codeOutputPorts,
});

export default codeDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullCodeSchema = v.object({
  ...codeSchema,
  enabled: v.boolean().default(true),
  timeout: v.number().positive().default(5000),
  retries: v.number().int().min(0).default(1),
  label: v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type CodeParameters = VInfer<typeof fullCodeSchema>;
