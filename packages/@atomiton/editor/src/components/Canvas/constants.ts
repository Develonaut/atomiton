import { getNodeTypes } from "@atomiton/nodes/browser";
import type { NodeTypes } from "@xyflow/react";
import Node from "../Node";

export const NODE_TYPES: NodeTypes = getNodeTypes().reduce<NodeTypes>(
  (acc, nodeType) => ({ ...acc, [nodeType]: Node }),
  {},
);

export const DELETE_KEY_CODES = ["Delete", "Backspace"];

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2;
