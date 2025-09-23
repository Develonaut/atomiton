/**
 * Shell Command Node Definition
 * Browser-safe configuration for shell command execution node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { shellCommandFields } from "./fields";
import { shellCommandInputPorts, shellCommandOutputPorts } from "./ports";
import { shellCommandDefaults, shellCommandSchema } from "./schema";

/**
 * Shell Command node definition (browser-safe)
 */
export const shellCommandDefinition: NodeDefinition = createNodeDefinition({
  type    : "atomic",
  metadata: createNodeMetadata({
    id         : "shell-command",
    name       : "Shell Command",
    variant    : "shell-command",
    version    : "1.0.0",
    author     : "Atomiton Core Team",
    description: "Execute shell commands and scripts",
    category   : "system",
    icon       : "terminal",
    keywords   : [
      "shell",
      "command",
      "terminal",
      "bash",
      "script",
      "execute",
      "cli",
      "cmd",
      "powershell",
      "system",
    ],
    tags        : ["shell", "system", "terminal", "command", "script"],
    experimental: false,
    deprecated  : false,
  }),
  parameters: createNodeParameters(
    shellCommandSchema,
    shellCommandDefaults,
    shellCommandFields
  ),
  inputPorts : shellCommandInputPorts,
  outputPorts: shellCommandOutputPorts,
});

export default shellCommandDefinition;

// Create the full schema with base parameters
const fullShellCommandSchema = v.object({
  ...shellCommandSchema,
  enabled    : v.boolean().default(true),
  timeout    : v.number().positive().default(30000),
  retries    : v.number().int().min(0).default(1),
  label      : v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type ShellCommandParameters = VInfer<typeof fullShellCommandSchema>;