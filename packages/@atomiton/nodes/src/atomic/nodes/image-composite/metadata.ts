/**
 * Image Composite Node Metadata
 *
 * Static metadata definition for the Image Composite node
 */

import { createAtomicMetadata } from "../../createAtomicMetadata";

export const imageCompositeMetadata = createAtomicMetadata({
  id: "image-composite",
  name: "Image Processor",
  description: "Composite and manipulate images",
  category: "media",
  icon: "image",
  keywords: [
    "image",
    "composite",
    "overlay",
    "merge",
    "process",
    "render",
    "media",
    "graphics",
  ],
  tags: ["image", "composite", "overlay", "merge", "process", "render"],
});
