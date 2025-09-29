/**
 * Image Composite Node Definition
 * Browser-safe configuration for image composition node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { imageCompositeFields } from "#definitions/image-composite/fields";
import {
  imageCompositeInputPorts,
  imageCompositeOutputPorts,
} from "#definitions/image-composite/ports";

/**
 * Default values for image composite parameters
 */
export const imageCompositeDefaults = {
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
 * Image Composite node definition (browser-safe)
 */
export const imageCompositeDefinition: NodeDefinition = createNodeDefinition({
  type: "image-composite",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "image-composite",
    name: "Image Composite",
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
  parameters: createNodeParameters(imageCompositeDefaults),
  fields: imageCompositeFields,
  inputPorts: imageCompositeInputPorts,
  outputPorts: imageCompositeOutputPorts,
});

export default imageCompositeDefinition;
