/**
 * Image Composite Node
 *
 * Node for image composition and manipulation
 */

import { Node, NodeMetadata } from "../../base";
import { createNodeComponent } from "../../base/components";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  defaultImageCompositeConfig,
  imageCompositeConfig,
  type ImageCompositeConfig,
} from "./ImageCompositeNodeConfig";
import { ImageCompositeLogic } from "./ImageCompositeNodeLogic";

/**
 * Image Composite Node Class
 */
class ImageCompositeNode extends Node<ImageCompositeConfig> {
  readonly component = createNodeComponent("image-plus", "Image Processor");

  readonly metadata = new NodeMetadata({
    id: "image-composite",
    name: "Image Processor",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Composite and manipulate images",
    category: "media",
    type: "image-composite",
    keywords: ["image", "composite", "overlay", "merge", "process", "render"],
    icon: "image-plus",
    experimental: false,
    deprecated: false,
  });

  readonly config = imageCompositeConfig;

  readonly logic = new ImageCompositeLogic();

  readonly definition: NodeDefinition = {
    id: "image-composite",
    name: "Image Processor",
    description: "Composite and manipulate images",
    category: "media",
    type: "image-composite",
    version: "1.0.0",

    inputPorts: [
      {
        id: "baseImage",
        name: "Base Image",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Base image path",
      },
      {
        id: "overlayImage",
        name: "Overlay Image",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Overlay image path",
      },
      {
        id: "images",
        name: "Images",
        type: "input",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Array of image paths",
      },
    ] as NodePortDefinition[],

    outputPorts: [
      {
        id: "imagePath",
        name: "Image Path",
        type: "output",
        dataType: "string",
        required: true,
        multiple: false,
        description: "Output image path",
      },
      {
        id: "dimensions",
        name: "Dimensions",
        type: "output",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Image dimensions",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Operation success status",
      },
    ] as NodePortDefinition[],

    configSchema: imageCompositeConfig.getShape() as unknown as Record<
      string,
      unknown
    >,
    defaultConfig: defaultImageCompositeConfig,

    metadata: {
      executionSettings: {
        timeout: 60000,
        retries: 1,
        sandbox: false,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["image", "composite", "overlay", "merge", "process", "render"],
      icon: "image-plus",
    },

    execute: async (context) => {
      return imageComposite.execute(context);
    },
  };
}

// Export singleton instance
export const imageComposite = new ImageCompositeNode();
export default imageComposite;

// Export types and schemas for external use
export {
  defaultImageCompositeConfig,
  imageCompositeConfigSchema,
} from "./ImageCompositeNodeConfig";
export type { ImageCompositeConfig } from "./ImageCompositeNodeConfig";
export { ImageCompositeLogic } from "./ImageCompositeNodeLogic";
