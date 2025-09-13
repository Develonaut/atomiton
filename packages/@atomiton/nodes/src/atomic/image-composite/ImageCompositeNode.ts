/**
 * Image Composite Node
 *
 * Node for image composition and manipulation
 */

import { Node } from "../../base/Node";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types";
import { ImageCompositeLogic } from "./ImageCompositeNodeLogic";

/**
 * Image Composite Node Class
 */
class ImageCompositeNode extends Node {
  readonly id = "image-composite";
  readonly name = "Image Processor";
  readonly type = "image-composite";

  private logic = new ImageCompositeLogic();

  /**
   * Execute the image composite node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing Image Composite node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the image composite logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "Image Composite execution completed", {
        result,
      });
      return result;
    } catch (error) {
      this.log(context, "error", "Image Composite execution failed", { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Input ports for this node
   */
  get inputPorts(): NodePortDefinition[] {
    return [
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
    ];
  }

  /**
   * Output ports for this node
   */
  get outputPorts(): NodePortDefinition[] {
    return [
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
    ];
  }

  /**
   * Get metadata for this node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: "media",
      description: "Composite and manipulate images",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["image", "composite", "overlay", "merge", "process", "render"],
      icon: "image-plus",
    };
  }
}

export const imageComposite = new ImageCompositeNode();
