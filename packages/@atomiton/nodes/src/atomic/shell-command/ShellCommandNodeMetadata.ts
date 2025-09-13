/**
 * Shell Command Node Metadata
 *
 * Static metadata definition for the Shell Command node
 */

import { NodeMetadata } from "../../base/NodeMetadata.js";

/**
 * Shell Command Metadata Class
 */
class ShellCommandNodeMetadata extends NodeMetadata {
  readonly id = "shell-command";
  readonly name = "Shell Command";
  readonly type = "shell-command";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Execute system commands (Blender, ImageMagick)";
  readonly category = "system";
  readonly icon = "terminal";

  // Keywords for search and discovery
  readonly keywords = [
    "shell",
    "command",
    "blender",
    "script",
    "execute",
    "system",
    "cli",
    "terminal",
  ];
  readonly tags = [
    "shell",
    "command",
    "blender",
    "script",
    "execute",
    "system",
  ];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const shellCommandMetadata = new ShellCommandNodeMetadata();

// Export the metadata instance as default for consistency
export default shellCommandMetadata;
