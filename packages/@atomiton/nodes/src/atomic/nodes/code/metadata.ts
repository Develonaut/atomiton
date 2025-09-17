/**
 * Code Node Metadata
 *
 * Static metadata definition for the Code node
 */

import { createAtomicMetadata } from "../../createAtomicMetadata";

export const codeMetadata = createAtomicMetadata({
  id: "code",
  name: "Code",
  variant: "code",
  version: "1.0.0",
  author: "Atomiton Core Team",
  description: "Execute custom JavaScript/TypeScript code",
  category: "logic",
  icon: "code-2",
  keywords: [
    "code",
    "javascript",
    "typescript",
    "script",
    "custom",
    "function",
    "logic",
  ],
  tags: ["code", "javascript", "typescript", "scripting"],
  experimental: false,
  deprecated: false,
});
