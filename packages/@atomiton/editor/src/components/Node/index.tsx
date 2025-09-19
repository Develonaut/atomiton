import { getNodeByType } from "@atomiton/nodes/browser";
import { Icon } from "@atomiton/ui";
import {
  Handle,
  Position,
  type NodeProps as ReactFlowNodeProps,
  useNodes,
} from "@xyflow/react";
import { memo, useMemo } from "react";
import type { EditorNode } from "../../types/EditorNode";

/**
 * Custom Node component - focuses purely on content and functionality
 * Visual styling (borders, hover, selection) is handled at the canvas level
 */
function Node(props: ReactFlowNodeProps) {
  const nodes = useNodes();
  const isFirstNode = nodes.length > 0 && nodes[0].id === props.id;

  const icon = getNodeByType(props.type)?.metadata.icon || "zap";

  // Extract port definitions from node data
  const data = useMemo(() => props.data as EditorNode, [props.data]);
  const inputPorts = useMemo(() => data?.inputPorts || [], [data]);
  const outputPorts = useMemo(() => data?.outputPorts || [], [data]);

  // Calculate handle positions for multiple ports
  const inputHandlePositions = useMemo(
    () =>
      inputPorts.map((_, index) => ({
        top: `${((index + 1) * 100) / (inputPorts.length + 1)}%`,
      })),
    [inputPorts],
  );

  const outputHandlePositions = useMemo(
    () =>
      outputPorts.map((_, index) => ({
        top: `${((index + 1) * 100) / (outputPorts.length + 1)}%`,
      })),
    [outputPorts],
  );

  return (
    <div
      className="atomiton-node"
      data-testid={`node-${props.type}-${props.id}`}
      data-node-type={props.type}
      data-node-id={props.id}
    >
      {/* Input handles - dynamic based on inputPorts */}
      {inputPorts.map((port, index) => (
        <Handle
          key={`input-${port.id}`}
          id={port.id}
          type="target"
          position={Position.Left}
          style={inputHandlePositions[index]}
          isConnectable={!isFirstNode}
          data-testid={`handle-input-${port.id}`}
        />
      ))}

      <Icon
        name={icon}
        size={32}
        className="transition-colors duration-200 text-gray-500"
      />

      {/* Output handles - dynamic based on outputPorts */}
      {outputPorts.map((port, index) => (
        <Handle
          key={`output-${port.id}`}
          id={port.id}
          type="source"
          position={Position.Right}
          style={outputHandlePositions[index]}
          isConnectable
          data-testid={`handle-output-${port.id}`}
        />
      ))}

      {/* Fallback handles when no ports are defined */}
      {inputPorts.length === 0 && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={!isFirstNode}
          data-testid="handle-input-default"
        />
      )}
      {outputPorts.length === 0 && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable
          data-testid="handle-output-default"
        />
      )}
    </div>
  );
}

export default memo(Node);
