/**
 * File System Configuration
 *
 * Configuration for file system operations
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * File System specific configuration schema
 */
const fileSystemSchema = {
  operation: z
    .enum(["read", "write", "create", "list"])
    .default("read")
    .describe("Operation to perform"),

  path: z
    .string()
    .min(1, "Path is required")
    .describe("File or directory path"),

  content: z.string().optional().describe("Content to write to file"),

  encoding: z
    .enum(["utf8", "base64", "binary"])
    .default("utf8")
    .describe("File encoding"),

  createDirectories: z
    .boolean()
    .default(false)
    .describe("Create parent directories if they don't exist"),
};

/**
 * File System Configuration Class
 */
class FileSystemConfigClass extends NodeConfig<typeof fileSystemSchema> {
  constructor() {
    super(
      fileSystemSchema,
      {
        operation: "read",
        path: "",
        encoding: "utf8",
        createDirectories: false,
      },
      {
        fields: {
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
            helpText:
              "Automatically create parent directories if they don't exist",
          },
        },
      },
    );
  }
}

export const fileSystemConfig = new FileSystemConfigClass();

export type FileSystemConfig = z.infer<typeof fileSystemConfig.schema>;

export const FileSystemInputSchema = z.object({
  path: z.string().optional(),
  content: z.string().optional(),
  operation: z.enum(["read", "write", "create", "list"]).optional(),
});

export type FileSystemInput = z.infer<typeof FileSystemInputSchema>;

export const FileSystemOutputSchema = z.object({
  content: z.string().optional(),
  files: z.array(z.string()).optional(),
  success: z.boolean(),
  path: z.string(),
  size: z.number().optional(),
});

export type FileSystemOutput = z.infer<typeof FileSystemOutputSchema>;
