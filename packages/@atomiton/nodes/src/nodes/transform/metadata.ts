/**
 * Transform Node Metadata
 *
 * Static metadata definition for the Transform node
 */

import { createNodeMetadata } from "../../base/createNodeMetadata";

export const transformMetadata = createNodeMetadata({
  id: "transform",
  name: "Transform",
  type: "transform",
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
