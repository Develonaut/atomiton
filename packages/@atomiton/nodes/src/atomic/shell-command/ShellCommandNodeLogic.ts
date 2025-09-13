import { NodeLogic } from "../../base/NodeLogic.js";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types.js";
import type {
  ShellCommandConfig,
  ShellCommandInput,
  ShellCommandOutput,
} from "./ShellCommandNodeConfig.js";
import { shellCommandConfig } from "./ShellCommandNodeConfig.js";

export class ShellCommandLogic extends NodeLogic<ShellCommandConfig> {
  getConfigSchema() {
    return shellCommandConfig.schema;
  }

  async execute(
    context: NodeExecutionContext,
    config: ShellCommandConfig,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const input = context.inputs as ShellCommandInput;

    try {
      const command = input.command || config.command;
      const args = input.args || config.args;
      const workingDirectory =
        input.workingDirectory || config.workingDirectory;

      if (!command) {
        throw new Error("Command is required for shell execution");
      }

      this.log(
        context,
        "info",
        `Executing shell command: ${command} ${args.join(" ")}`,
      );

      const result = await this.executeCommand(command, args, {
        cwd: workingDirectory,
        timeout: config.timeout,
        shell: config.shell,
        env: config.inheritEnv
          ? ({ ...process.env, ...config.environment } as Record<
              string,
              string
            >)
          : config.environment,
        input: input.stdin,
      });

      const duration = Date.now() - startTime;

      const output: ShellCommandOutput = {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        success: result.exitCode === 0,
        command: `${command} ${args.join(" ")}`.trim(),
        duration,
        pid: result.pid,
      };

      this.log(
        context,
        "info",
        `Command completed in ${duration}ms with exit code ${result.exitCode}`,
      );
      return this.createSuccessResult(output);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(context, "error", "Shell command execution failed", {
        error: String(error),
      });

      return this.createSuccessResult({
        stdout: "",
        stderr: error instanceof Error ? error.message : "Unknown error",
        exitCode: -1,
        success: false,
        command: input.command || config.command || "",
        duration,
        pid: undefined,
      });
    }
  }

  private async executeCommand(
    command: string,
    args: string[],
    options: {
      cwd?: string;
      timeout: number;
      shell?: string;
      env: Record<string, string>;
      input?: string;
    },
  ): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    pid?: number;
  }> {
    // Dynamic import for Node.js module
    const { spawn } = await import("child_process");

    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: options.cwd,
        shell: options.shell || true,
        env: options.env,
        stdio: ["pipe", "pipe", "pipe"],
        timeout: options.timeout,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      child.on("close", (code: number) => {
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 0,
          pid: child.pid,
        });
      });

      child.on("error", (error: Error) => {
        reject(error);
      });

      // Send stdin if provided
      if (options.input && child.stdin) {
        child.stdin.write(options.input);
        child.stdin.end();
      }

      // Handle timeout
      const timeoutId = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error(`Command timed out after ${options.timeout}ms`));
      }, options.timeout);

      child.on("exit", () => {
        clearTimeout(timeoutId);
      });
    });
  }
}
