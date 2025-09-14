/**
 * Shell Command Node Logic
 *
 * Business logic for executing shell commands
 */

import { createNodeLogic } from "../../base/createNodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { ShellCommandParameters } from "./parameters";
import {
  createSuccessResult,
  createErrorResult,
  logNodeExecution,
  getInputValue,
} from "../../base/NodeUtils";

export type ShellCommandOutput = {
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  duration: number;
  success: boolean;
};

export const shellCommandLogic = createNodeLogic<ShellCommandParameters>({
  async execute(
    context: NodeExecutionContext,
    config: ShellCommandParameters,
  ): Promise<NodeExecutionResult> {
    try {
      const command =
        getInputValue<string>(context, "command") || config.command;
      const args = getInputValue<string[]>(context, "args") || config.args;
      const startTime = Date.now();

      logNodeExecution(context, "info", `Executing shell command: ${command}`, {
        args,
      });

      // Mock implementation for MVP - in real implementation would use child_process
      const mockOutput: ShellCommandOutput = {
        stdout: "Mock command output",
        stderr: "",
        exitCode: 0,
        command: `${command} ${args.join(" ")}`.trim(),
        duration: Date.now() - startTime,
        success: true,
      };

      logNodeExecution(
        context,
        "info",
        `Command completed with exit code ${mockOutput.exitCode}`,
      );
      return createSuccessResult(mockOutput);
    } catch (error) {
      logNodeExecution(context, "error", "Shell command execution failed", {
        error,
      });
      return createErrorResult(
        error instanceof Error ? error : new Error("Unknown error"),
      );
    }
  },
});
