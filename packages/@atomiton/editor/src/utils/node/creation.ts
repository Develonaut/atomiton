import type {
  EditorNode,
  NodeData,
  NodePosition,
  EditorNodePort,
} from "#types/EditorNode";
import { getNodeDefinition, type NodePort } from "@atomiton/nodes/definitions";
import { generateNodeId } from "@atomiton/utils";
import { Position } from "@xyflow/react";

function calculatePortPositions(ports: NodePort[]): EditorNodePort[] {
  const count = ports.length;
  return ports.map((port, index) => ({
    ...port,
    position: {
      top: `${((index + 1) * 100) / (count + 1)}%`,
    },
  }));
}

function createEditorNodeData(nodeType: string): NodeData {
  const definition = getNodeDefinition(nodeType);

  if (!definition) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }

  const inputPorts = definition.inputPorts || [];
  const outputPorts = definition.outputPorts || [];

  return {
    name: definition.metadata?.name || definition.name,
    metadata: definition.metadata,
    parameters: definition.parameters?.defaults || {},
    fields: definition.parameters?.fields || {},
    inputPorts: calculatePortPositions(inputPorts),
    outputPorts: calculatePortPositions(outputPorts),
  };
}

type CreateEditorNodeOptions = {
  nodeId?: string;
  nodeType: string;
  position: NodePosition;
};

function createEditorNodeDefaults(
  options: CreateEditorNodeOptions,
): Omit<EditorNode, "data"> {
  const { nodeId, nodeType, position } = options;
  const nodeDefinition = getNodeDefinition(nodeType);

  if (!nodeDefinition) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }

  return {
    id: nodeId || generateNodeId(),
    type: nodeDefinition.type || nodeType,
    position,
    selected: true,
    draggable: true,
    selectable: true,
    connectable: true,
    deletable: true,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
}

export function createEditorNode(
  nodeType: string,
  position: NodePosition,
  nodeId?: string,
): EditorNode {
  try {
    const defaults = createEditorNodeDefaults({ nodeId, nodeType, position });
    const data = createEditorNodeData(nodeType);

    const editorNode: EditorNode = {
      ...defaults,
      data,
    };

    return editorNode;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to create node of type "${nodeType}": ${errorMessage}`,
    );
  }
}

export function createDefaultEditorNode(nodeType: string): EditorNode {
  return createEditorNode(nodeType, { x: 100, y: 100 });
}

export function createNode(
  nodeType: string,
  position: NodePosition,
  nodeId?: string,
): EditorNode {
  return createEditorNode(nodeType, position, nodeId);
}
