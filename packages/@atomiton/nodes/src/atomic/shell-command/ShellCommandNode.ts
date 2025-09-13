/**
 * Shell Command Node
 *
 * Node for executing system shell commands
 */

import { Node } from "../../base/Node.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types.js";
import { ShellCommandLogic } from "./ShellCommandNodeLogic.js";

/**
 * Shell Command Node Class
 */
class ShellCommandNode extends Node {
  readonly id = "shell-command";
  readonly name = "Shell Command";
  readonly type = "shell-command";

  private logic = new ShellCommandLogic();

  /**
   * Execute the shell command node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing Shell Command node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the shell command logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "Shell Command execution completed", {
        result,
      });
      return result;
    } catch (error) {
      this.log(context, "error", "Shell Command execution failed", { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Input ports for this node
   */
  get inputPorts(): NodePortDefinition[] {
    return [
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
    ];
  }

  /**
   * Output ports for this node
   */
  get outputPorts(): NodePortDefinition[] {
    return [
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
    ];
  }

  /**
   * Get metadata for this node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: "system",
      description: "Execute system commands (Blender, ImageMagick)",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["shell", "command", "blender", "script", "execute", "system"],
      icon: "terminal",
    };
  }
}

export const shellCommand = new ShellCommandNode();

export default shellCommand;
