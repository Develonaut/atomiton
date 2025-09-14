/**
 * Code Node Metadata
 *
 * Static metadata definition for the Code node
 */

import { NodeMetadata } from "../../base/NodeMetadata";

/**
 * Code Metadata Class
 */
class CodeNodeMetadata extends NodeMetadata {
  readonly id = "code";
  readonly name = "Code";
  readonly type = "code";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Execute custom JavaScript/TypeScript code";
  readonly category = "logic";
  readonly icon = "code-2";

  // Keywords for search and discovery
  readonly keywords = [
    "code",
    "javascript",
    "typescript",
    "script",
    "custom",
    "function",
    "logic",
  ];
  readonly tags = ["code", "javascript", "typescript", "scripting"];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const codeMetadata = new CodeNodeMetadata();

// Export the metadata instance as default for consistency
export default codeMetadata;
