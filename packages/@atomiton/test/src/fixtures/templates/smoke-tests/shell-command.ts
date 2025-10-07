/**
 * Shell Command Node Smoke Tests
 * Covers basic shell commands with security validations
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const shellCommandSmokeTests: SmokeTest[] = [
  {
    name: "simple echo",
    config: {
      program: "echo",
      args: JSON.stringify(["Hello", "World"]),
    },
  },
  {
    name: "echo with special characters",
    config: {
      program: "echo",
      args: JSON.stringify(["test; echo injected"]),
    },
  },
  {
    name: "ls command",
    config: {
      program: "ls",
      args: JSON.stringify(["-la"]),
    },
  },
  {
    name: "pwd command",
    config: {
      program: "pwd",
      args: JSON.stringify([]),
    },
  },
  {
    name: "git status",
    config: {
      program: "git",
      args: JSON.stringify(["status", "--short"]),
    },
  },
  {
    name: "printf with multiple args",
    config: {
      program: "printf",
      args: JSON.stringify(["arg1: %s, arg2: %s\\n", "first", "second"]),
    },
  },
];
