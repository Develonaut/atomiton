/**
 * Image Composite Node
 *
 * Node for image composition and manipulation
 */

import { createAtomicNode } from "../../createAtomicNode";
import { imageCompositeParameters } from "./parameters";
import { imageCompositeExecutable } from "./executable";
import { imageCompositeMetadata } from "./metadata";
import { imageCompositePorts } from "./ports";

export const imageComposite = createAtomicNode({
  metadata: imageCompositeMetadata,
  parameters: imageCompositeParameters,
  executable: imageCompositeExecutable,
  ports: imageCompositePorts,
});

export default imageComposite;
