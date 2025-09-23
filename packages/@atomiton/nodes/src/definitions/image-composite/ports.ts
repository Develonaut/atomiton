/**
 * Image Composite Port Definitions
 * Input and output ports for image composite node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for image composite node
 */
export const imageCompositeInputPorts: NodePort[] = [
  createNodePort("input", {
    id         : "baseImage",
    name       : "Base Image",
    dataType   : "any",
    required   : false,
    multiple   : false,
    description: "Base image for overlay/composite operations",
  }),
  createNodePort("input", {
    id         : "overlayImage",
    name       : "Overlay Image",
    dataType   : "any",
    required   : false,
    multiple   : false,
    description: "Image to overlay on top of base",
  }),
  createNodePort("input", {
    id         : "images",
    name       : "Images",
    dataType   : "array",
    required   : false,
    multiple   : false,
    description: "Array of images for merge operations",
  }),
];

/**
 * Output ports for image composite node
 */
export const imageCompositeOutputPorts: NodePort[] = [
  createNodePort("output", {
    id         : "result",
    name       : "Result",
    dataType   : "string",
    required   : true,
    multiple   : false,
    description: "Path to output image file",
  }),
  createNodePort("output", {
    id         : "imagePath",
    name       : "Image Path",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Full path to the generated image",
  }),
  createNodePort("output", {
    id         : "width",
    name       : "Width",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "Width of output image in pixels",
  }),
  createNodePort("output", {
    id         : "height",
    name       : "Height",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "Height of output image in pixels",
  }),
  createNodePort("output", {
    id         : "format",
    name       : "Format",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Format of output image",
  }),
  createNodePort("output", {
    id         : "size",
    name       : "Size",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "File size in bytes",
  }),
  createNodePort("output", {
    id         : "success",
    name       : "Success",
    dataType   : "boolean",
    required   : false,
    multiple   : false,
    description: "Whether operation succeeded",
  }),
];