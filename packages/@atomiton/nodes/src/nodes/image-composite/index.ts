/**
 * Image Composite Node
 *
 * Node for image composition and manipulation
 */

import { createNode } from "../../base/createNode";
import { imageCompositeParameters } from "./parameters";
import { imageCompositeLogic } from "./logic";
import { imageCompositeMetadata } from "./metadata";
import { imageCompositePorts } from "./ports";

export const imageComposite = createNode({
  metadata: imageCompositeMetadata,
  parameters: imageCompositeParameters,
  logic: imageCompositeLogic,
  ports: imageCompositePorts,
});

export default imageComposite;
