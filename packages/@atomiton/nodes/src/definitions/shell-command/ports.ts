/**
 * Shell Command Port Definitions
 * Input and output ports for shell command node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for shell command node
 */
export const shellCommandInputPorts: NodePort[] = [
  createNodePort("input", {
    id         : "command",
    name       : "Command",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Command to execute (overrides config)",
  }),
  createNodePort("input", {
    id         : "args",
    name       : "Arguments",
    dataType   : "array",
    required   : false,
    multiple   : false,
    description: "Command arguments as array",
  }),
  createNodePort("input", {
    id         : "stdin",
    name       : "Stdin",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Data to pipe to stdin",
  }),
  createNodePort("input", {
    id         : "env",
    name       : "Environment",
    dataType   : "object",
    required   : false,
    multiple   : false,
    description: "Environment variables",
  }),
  createNodePort("input", {
    id         : "workingDirectory",
    name       : "Working Directory",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Working directory path",
  }),
];

/**
 * Output ports for shell command node
 */
export const shellCommandOutputPorts: NodePort[] = [
  createNodePort("output", {
    id         : "result",
    name       : "Result",
    dataType   : "object",
    required   : true,
    multiple   : false,
    description: "Complete execution result",
  }),
  createNodePort("output", {
    id         : "stdout",
    name       : "Stdout",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Standard output",
  }),
  createNodePort("output", {
    id         : "stderr",
    name       : "Stderr",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Standard error output",
  }),
  createNodePort("output", {
    id         : "exitCode",
    name       : "Exit Code",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "Process exit code",
  }),
  createNodePort("output", {
    id         : "success",
    name       : "Success",
    dataType   : "boolean",
    required   : false,
    multiple   : false,
    description: "Whether command succeeded (exit code 0)",
  }),
  createNodePort("output", {
    id         : "duration",
    name       : "Duration",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "Execution duration in milliseconds",
  }),
  createNodePort("output", {
    id         : "killed",
    name       : "Killed",
    dataType   : "boolean",
    required   : false,
    multiple   : false,
    description: "Whether process was killed",
  }),
  createNodePort("output", {
    id         : "pid",
    name       : "PID",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "Process ID",
  }),
];