/**
 * Image Composite Node Metadata
 *
 * Static metadata definition for the Image Composite node
 */

import { NodeMetadata } from "../../base/NodeMetadata";

/**
 * Image Composite Metadata Class
 */
class ImageCompositeNodeMetadata extends NodeMetadata {
  readonly id = "image-composite";
  readonly name = "Image Processor";
  readonly type = "image-composite";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Composite and manipulate images";
  readonly category = "media";
  readonly icon = "image-plus";

  // Keywords for search and discovery
  readonly keywords = [
    "image",
    "composite",
    "overlay",
    "merge",
    "process",
    "render",
    "media",
    "graphics",
  ];
  readonly tags = [
    "image",
    "composite",
    "overlay",
    "merge",
    "process",
    "render",
  ];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const imageCompositeMetadata = new ImageCompositeNodeMetadata();

// Export the metadata instance as default for consistency
export default imageCompositeMetadata;
