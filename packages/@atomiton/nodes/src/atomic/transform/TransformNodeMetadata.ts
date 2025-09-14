/**
 * Transform Node Metadata
 *
 * Static metadata definition for the Transform node
 */

import { NodeMetadata } from "../../base/NodeMetadata";

/**
 * Transform Metadata Class
 */
class TransformNodeMetadata extends NodeMetadata {
  readonly id = "transform";
  readonly name = "Transform";
  readonly type = "transform";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Transform data with JS expressions";
  readonly category = "data";
  readonly icon = "wand-2";

  // Keywords for search and discovery
  readonly keywords = [
    "transform",
    "data",
    "map",
    "filter",
    "template",
    "javascript",
    "manipulation",
  ];
  readonly tags = [
    "transform",
    "data",
    "map",
    "filter",
    "template",
    "javascript",
  ];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const transformMetadata = new TransformNodeMetadata();

// Export the metadata instance as default for consistency
export default transformMetadata;
