/**
 * Image Composite Node Ports
 *
 * Input and output port definitions for the Image Composite node
 */

import { createAtomicPorts } from "../../createAtomicPorts";

export const imageCompositePorts = createAtomicPorts({
  input: [
    {
      id: "baseImage",
      name: "Base Image",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Base image path",
    },
    {
      id: "overlayImage",
      name: "Overlay Image",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Overlay image path",
    },
    {
      id: "images",
      name: "Images",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of image paths",
    },
  ],
  output: [
    {
      id: "imagePath",
      name: "Image Path",
      dataType: "string",
      required: true,
      multiple: false,
      description: "Output image path",
    },
    {
      id: "width",
      name: "Width",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Image width",
    },
    {
      id: "height",
      name: "Height",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Image height",
    },
    {
      id: "format",
      name: "Format",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Image format",
    },
    {
      id: "size",
      name: "Size",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Image file size",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: true,
      multiple: false,
      description: "Operation success status",
    },
  ],
});
