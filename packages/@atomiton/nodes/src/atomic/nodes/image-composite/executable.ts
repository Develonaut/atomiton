/**
 * Image Composite Node Logic
 *
 * Business logic for image composition and manipulation operations
 */

import { createAtomicExecutable } from "../../createAtomicExecutable";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../../exports/executable/execution-types";
import type { ImageCompositeParameters } from "./parameters";
import { createSuccessResult, logNodeExecution } from "../../../utils";

export type ImageCompositeOutput = {
  imagePath: string;
  width: number;
  height: number;
  format: string;
  size: number;
  success: boolean;
};

export const imageCompositeExecutable =
  createAtomicExecutable<ImageCompositeParameters>({
    async execute(
      context: NodeExecutionContext,
      config: ImageCompositeParameters,
    ): Promise<NodeExecutionResult> {
      try {
        // These will be used when mock implementation is replaced
        // const baseImage = getInputValue(context, "baseImage");
        // const overlayImage = getInputValue(context, "overlayImage");
        // const images = getInputValue(context, "images") || [];

        logNodeExecution(
          context,
          "info",
          `Performing ${config.operation} operation on images`,
        );

        // Mock implementation for MVP
        const outputPath = generateOutputPath(config.outputFormat);
        const mockResult: ImageCompositeOutput = {
          imagePath: outputPath,
          width: config.width || 1920,
          height: config.height || 1080,
          format: config.outputFormat,
          size: 2048000,
          success: true,
        };

        logNodeExecution(
          context,
          "info",
          `Image composite completed: ${outputPath}`,
        );
        return createSuccessResult(mockResult);
      } catch (error) {
        logNodeExecution(context, "error", "Image composite operation failed", {
          error: String(error),
        });

        return createSuccessResult({
          imagePath: "",
          width: 0,
          height: 0,
          format: "png",
          size: 0,
          success: false,
        });
      }
    },
  });

function generateOutputPath(format: string): string {
  const timestamp = Date.now();
  return `/tmp/composite_${timestamp}.${format}`;
}
