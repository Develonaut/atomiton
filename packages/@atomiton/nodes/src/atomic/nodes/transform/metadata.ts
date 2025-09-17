/**
 * Transform Node Metadata
 *
 * Static metadata definition for the Transform node
 */

import { createAtomicMetadata } from "../../createAtomicMetadata";

export const transformMetadata = createAtomicMetadata({
  id: "transform",
  name: "Transform",
  variant: "transform",
  description: "Transform and manipulate data arrays",
  category: "data",
  icon: "wand-2",
  keywords: [
    "transform",
    "map",
    "filter",
    "reduce",
    "sort",
    "group",
    "data",
    "array",
  ],
  tags: ["transform", "data", "array", "manipulation"],
});
