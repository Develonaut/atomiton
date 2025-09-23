/**
 * Image Composite Node Definition
 * Browser-safe configuration for image composition node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { imageCompositeFields } from "./fields";
import { imageCompositeInputPorts, imageCompositeOutputPorts } from "./ports";
import { imageCompositeDefaults, imageCompositeSchema } from "./schema";

/**
 * Image Composite node definition (browser-safe)
 */
export const imageCompositeDefinition: NodeDefinition = createNodeDefinition({
  type    : "atomic",
  metadata: createNodeMetadata({
    id         : "image-composite",
    name       : "Image Composite",
    variant    : "image-composite",
    version    : "1.0.0",
    author     : "Atomiton Core Team",
    description: "Combine, overlay, and manipulate images",
    category   : "media",
    icon       : "image",
    keywords   : [
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
    tags        : ["image", "media", "composite", "graphics", "manipulation"],
    experimental: false,
    deprecated  : false,
  }),
  parameters: createNodeParameters(
    imageCompositeSchema,
    imageCompositeDefaults,
    imageCompositeFields
  ),
  inputPorts : imageCompositeInputPorts,
  outputPorts: imageCompositeOutputPorts,
});

export default imageCompositeDefinition;

// Create the full schema with base parameters
const fullImageCompositeSchema = v.object({
  ...imageCompositeSchema,
  enabled    : v.boolean().default(true),
  timeout    : v.number().positive().default(30000),
  retries    : v.number().int().min(0).default(1),
  label      : v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type ImageCompositeParameters = VInfer<typeof fullImageCompositeSchema>;