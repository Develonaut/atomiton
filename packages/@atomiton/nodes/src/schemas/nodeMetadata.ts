import v from "@atomiton/validation";

const nodeMetadataSchema = v.object({
  id: v.string().min(1),
  name: v.string().min(1),
  variant: v.enum([
    "code",
    "csv-reader",
    "file-system",
    "http-request",
    "image-composite",
    "loop",
    "parallel",
    "shell-command",
    "transform",
    "workflow",
    "pipeline",
    "orchestrator",
    "template",
    "test",
  ]),
  version: v.string().min(1),
  author: v.string().min(1),
  authorId: v.string().optional(),
  description: v.string().min(1),
  category: v.enum([
    "io",
    "data",
    "logic",
    "media",
    "system",
    "ai",
    "database",
    "analytics",
    "communication",
    "utility",
    "user",
    "composite",
  ]),
  icon: v.enum([
    // File & Data
    "file",
    "folder",
    "database",
    "table-2",
    // Network & Communication
    "cloud",
    "globe-2",
    "mail",
    "message-square",
    // Code & System
    "code-2",
    "terminal",
    "cpu",
    "git-branch",
    // Processing & Actions
    "wand-2",
    "zap",
    "filter",
    "search",
    "transform",
    "repeat",
    // Media
    "image",
    // Structure
    "layers",
    // Analytics
    "activity",
    "bar-chart",
    // Security
    "lock",
    "unlock",
    "shield",
    // Users
    "user",
    "users",
    // UI Controls
    "settings",
    "plus",
    "minus",
    "check",
    "x",
    // Status & Info
    "alert-triangle",
    "info",
    "help-circle",
  ]),
  source: v
    .enum(["system", "user", "community", "organization", "marketplace"])
    .optional(),
  keywords: v.array(v.string()).optional(),
  tags: v.array(v.string()).optional(),
  runtime: v
    .object({
      language: v.enum(["typescript", "python", "rust", "wasm", "golang"]),
    })
    .optional(),
  experimental: v.boolean().optional(),
  deprecated: v.boolean().optional(),
  documentationUrl: v.string().optional(),
  examples: v
    .array(
      v.object({
        name: v.string(),
        description: v.string(),
        config: v.record(v.unknown()),
      }),
    )
    .optional(),
});

export default nodeMetadataSchema;
