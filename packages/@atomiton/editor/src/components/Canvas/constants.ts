import Node from "#components/Node";
import { getAllNodeDefinitions } from "@atomiton/nodes/definitions";
import type { NodeTypes } from "@xyflow/react";

export const NODE_TYPES: NodeTypes = getAllNodeDefinitions().reduce<NodeTypes>(
  (acc, nodeDefinition) => ({ ...acc, [nodeDefinition.metadata.type]: Node }),
  {},
);

export const DELETE_KEY_CODES = ["Delete", "Backspace"];

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2;
