/**
 * Image Node Definition
 * Browser-safe configuration for image processing node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { imageFields } from "#definitions/image/fields";
import { imageInputPorts, imageOutputPorts } from "#definitions/image/ports";

/**
 * Default values for image parameters
 */
export const imageDefaults = {
  operation: "overlay" as const,
  outputFormat: "png" as const,
  quality: 90,
  position: "center" as const,
  opacity: 1,
  blendMode: "normal" as const,
  backgroundColor: "transparent",
  maintainAspectRatio: true,
  padding: 0,
};

/**
 * Image node definition (browser-safe)
 */
export const imageDefinition: NodeDefinition = createNodeDefinition({
  type: "image",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "image",
    name: "Image",
    author: "Atomiton Core Team",
    description: "Combine, overlay, and manipulate images",
    category: "media",
    icon: "image",
    keywords: [
      "image",
      "composite",
      "overlay",
      "merge",
      "blend",
      "photo",
      "picture",
      "graphics",
      "media",
      "manipulation",
    ],
    tags: ["image", "media", "composite", "graphics", "manipulation"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(imageDefaults),
  fields: imageFields,
  inputPorts: imageInputPorts,
  outputPorts: imageOutputPorts,
});

export default imageDefinition;
