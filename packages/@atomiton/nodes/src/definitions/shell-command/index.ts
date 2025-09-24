/**
 * Shell Command Node Definition
 * Browser-safe configuration for shell command execution node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { shellCommandFields } from "#definitions/shell-command/fields";
import {
  shellCommandInputPorts,
  shellCommandOutputPorts,
} from "#definitions/shell-command/ports";

/**
 * Default values for shell command parameters
 */
export const shellCommandDefaults = {
  command: "",
  shell: "bash" as const,
  env: {},
  timeout: 30000,
  captureOutput: true,
  encoding: "utf8" as const,
  throwOnError: false,
  maxBuffer: 10485760,
  killSignal: "SIGTERM",
  args: [],
  environment: {},
  inheritStdio: false,
};

/**
 * Shell Command node definition (browser-safe)
 */
export const shellCommandDefinition: NodeDefinition = createNodeDefinition({
  metadata: createNodeMetadata({
    id: "shell-command",
    name: "Shell Command",
    type: "shell-command",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Execute shell commands and scripts",
    category: "system",
    icon: "terminal",
    keywords: [
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
    tags: ["shell", "system", "terminal", "command", "script"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(shellCommandDefaults, shellCommandFields),
  inputPorts: shellCommandInputPorts,
  outputPorts: shellCommandOutputPorts,
});

export default shellCommandDefinition;
