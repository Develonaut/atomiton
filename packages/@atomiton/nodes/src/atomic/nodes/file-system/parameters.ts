/**
 * File System Node Parameters
 *
 * Parameter schema for file system operations
 */

import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { createAtomicParameters } from "../../createAtomicParameters";

const fileSystemSchema = {
  operation: v
    .enum(["read", "write", "create", "list"])
    .default("read")
    .describe("Operation to perform"),

  path: v
    .string()
    .min(1, "Path is required")
    .describe("File or directory path"),

  content: v.string().optional().describe("Content to write to file"),

  encoding: v
    .enum(["utf8", "base64", "binary"])
    .default("utf8")
    .describe("File encoding"),

  createDirectories: v
    .boolean()
    .default(false)
    .describe("Create parent directories if they don't exist"),
};

export const fileSystemParameters = createAtomicParameters(
  fileSystemSchema,
  {
    operation: "read",
    path: "",
    encoding: "utf8",
    createDirectories: false,
  },
  {
    operation: {
      controlType: "select",
      label: "Operation",
      options: [
        { value: "read", label: "Read File" },
        { value: "write", label: "Write File" },
        { value: "create", label: "Create File" },
        { value: "list", label: "List Directory" },
      ],
    },
    path: {
      controlType: "file",
      label: "File Path",
      placeholder: "/path/to/file",
      helpText: "Path to the file or directory",
    },
    content: {
      controlType: "textarea",
      label: "File Content",
      placeholder: "Content to write to file",
      rows: 5,
      helpText: "For write operations only",
    },
    encoding: {
      controlType: "select",
      label: "Encoding",
      options: [
        { value: "utf8", label: "UTF-8" },
        { value: "base64", label: "Base64" },
        { value: "binary", label: "Binary" },
      ],
    },
    createDirectories: {
      controlType: "boolean",
      label: "Create Parent Directories",
      helpText: "Automatically create parent directories if they don't exist",
    },
  },
);

export type FileSystemParameters = VInfer<typeof fileSystemParameters.schema>;
