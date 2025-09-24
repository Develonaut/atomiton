/**
 * Shell Command Schema
 * Parameter validation schema for shell command node
 */

import v from "@atomiton/validation";

/**
 * Shell command parameter schema
 */
export const shellCommandSchema = {
  command: v
    .string()
    .min(1, "Command is required")
    .describe("Shell command to execute"),

  shell: v
    .enum(["bash", "sh", "zsh", "powershell", "cmd"])
    .default("bash")
    .describe("Shell to use for execution"),

  workingDirectory: v
    .string()
    .optional()
    .describe("Working directory for command execution"),

  env: v
    .record(v.string())
    .default({})
    .describe("Environment variables to set"),

  timeout: v
    .number()
    .min(1000)
    .max(3600000)
    .default(30000)
    .describe("Command timeout in milliseconds"),

  captureOutput: v
    .boolean()
    .default(true)
    .describe("Whether to capture command output"),

  encoding: v
    .enum(["utf8", "base64", "binary", "ascii", "hex"])
    .default("utf8")
    .describe("Output encoding"),

  throwOnError: v
    .boolean()
    .default(false)
    .describe("Whether to throw on non-zero exit codes"),

  stdin: v.string().optional().describe("Data to pipe to stdin"),

  maxBuffer: v
    .number()
    .min(1024)
    .max(104857600) // 100MB
    .default(10485760) // 10MB
    .describe("Maximum buffer size for stdout/stderr"),

  killSignal: v
    .string()
    .default("SIGTERM")
    .describe("Signal to use when killing the process"),

  args: v.array(v.string()).default([]).describe("Command arguments as array"),

  environment: v
    .record(v.string())
    .default({})
    .describe("Additional environment variables"),

  inheritStdio: v
    .boolean()
    .default(false)
    .describe("Whether to inherit parent process stdio"),
};

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
