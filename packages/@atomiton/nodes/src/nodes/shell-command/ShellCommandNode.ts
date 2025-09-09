/**
 * Shell Command Node
 *
 * Node for executing system shell commands
 */

import { Node, NodeMetadata } from "../../base";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  defaultShellCommandConfig,
  shellCommandConfig,
  type ShellCommandConfig,
} from "./ShellCommandNodeConfig";
import { ShellCommandLogic } from "./ShellCommandNodeLogic";

/**
 * Shell Command Node Class
 */
class ShellCommandNode extends Node<ShellCommandConfig> {
  readonly metadata = new NodeMetadata({
    id: "shell-command",
    name: "Shell Command",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Execute system commands (Blender, ImageMagick)",
    category: "system",
    type: "shell-command",
    keywords: ["shell", "command", "blender", "script", "execute", "system"],
    icon: "terminal",
    experimental: false,
    deprecated: false,
  });

  readonly config = shellCommandConfig;

  readonly logic = new ShellCommandLogic();

  readonly definition: NodeDefinition = {
    id: "shell-command",
    name: "Shell Command",
    description: "Execute system commands (Blender, ImageMagick)",
    category: "system",
    type: "shell-command",
    version: "1.0.0",

    inputPorts: [
      {
        id: "command",
        name: "Command",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Command to execute",
      },
      {
        id: "args",
        name: "Arguments",
        type: "input",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Command arguments",
      },
      {
        id: "stdin",
        name: "Stdin",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Standard input",
      },
    ] as NodePortDefinition[],

    outputPorts: [
      {
        id: "stdout",
        name: "Stdout",
        type: "output",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Standard output",
      },
      {
        id: "stderr",
        name: "Stderr",
        type: "output",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Standard error",
      },
      {
        id: "exitCode",
        name: "Exit Code",
        type: "output",
        dataType: "number",
        required: true,
        multiple: false,
        description: "Process exit code",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Command success status",
      },
    ] as NodePortDefinition[],

    configSchema: shellCommandConfig.getShape() as unknown as Record<
      string,
      unknown
    >,
    defaultConfig: defaultShellCommandConfig,

    metadata: {
      executionSettings: {
        timeout: 300000,
        retries: 1,
        sandbox: false,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["shell", "command", "blender", "script", "execute", "system"],
      icon: "terminal",
    },

    execute: async (context) => {
      return shellCommand.execute(context);
    },
  };
}

// Export singleton instance
export const shellCommand = new ShellCommandNode();
export default shellCommand;

// Export types and schemas for external use
export {
  defaultShellCommandConfig,
  shellCommandConfigSchema,
} from "./ShellCommandNodeConfig";
export type { ShellCommandConfig } from "./ShellCommandNodeConfig";
export { ShellCommandLogic } from "./ShellCommandNodeLogic";
