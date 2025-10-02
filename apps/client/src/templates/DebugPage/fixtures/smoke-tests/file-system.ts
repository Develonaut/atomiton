/**
 * File System Node Smoke Tests
 * Covers write, read, list, exists, and delete operations
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const fileSystemSmokeTests: SmokeTest[] = [
  {
    name: "write file",
    config: {
      operation: "write",
      path: "./.tmp/smoke-test-write.txt",
      content: "Test content written by smoke test",
      encoding: "utf8",
      createDirectories: true,
      overwrite: true,
    },
  },
  {
    name: "write file without overwrite",
    config: {
      operation: "write",
      path: "./.tmp/smoke-test-no-overwrite.txt",
      content: "Content without overwrite",
      encoding: "utf8",
      createDirectories: true,
      overwrite: false,
    },
  },
  {
    name: "list directory",
    config: {
      operation: "list",
      path: "./.tmp",
    },
  },
  {
    name: "read file",
    config: {
      operation: "read",
      path: "./.tmp/smoke-test-write.txt",
      encoding: "utf8",
    },
  },
  {
    name: "check if file exists",
    config: {
      operation: "exists",
      path: "./.tmp/smoke-test-write.txt",
    },
  },
  {
    name: "write file to delete",
    config: {
      operation: "write",
      path: "./.tmp/smoke-test-to-delete.txt",
      content: "File to be deleted",
      encoding: "utf8",
      createDirectories: true,
      overwrite: true,
    },
  },
  {
    name: "delete file",
    config: {
      operation: "delete",
      path: "./.tmp/smoke-test-to-delete.txt",
    },
  },
  {
    name: "write JSON content",
    config: {
      operation: "write",
      path: "./.tmp/smoke-test.json",
      content: JSON.stringify({ test: true, timestamp: Date.now() }),
      encoding: "utf8",
      createDirectories: true,
      overwrite: true,
    },
  },
];
