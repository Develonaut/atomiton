import type { EditorNodePort, NodeData } from "#types/EditorNode";
import { useNodeExecutionState } from "#hooks/useNodeExecutionState";
import { Icon } from "@atomiton/ui";
import {
  Handle,
  Position,
  type NodeProps as ReactFlowNodeProps,
  useNodes,
} from "@xyflow/react";
import { memo } from "react";

/**
 * Custom Node component - focuses purely on content and functionality
 * Visual styling (borders, hover, selection) is handled at the canvas level via CSS
 * Supports optional execution state visualization via data attributes
 */
function Node(props: ReactFlowNodeProps) {
  const nodes = useNodes();
  const isFirstNode = nodes.length > 0 && nodes[0].id === props.id;
  const data = props.data as NodeData | undefined;
  const metadata = data?.metadata;
  const inputPorts = data?.inputPorts || [];
  const outputPorts = data?.outputPorts || [];
  const icon = metadata?.icon || "frown";

  // Subscribe to execution progress and update DOM attributes
  const nodeRef = useNodeExecutionState(props.id);

  return (
    <div
      ref={nodeRef}
      className="atomiton-node"
      data-testid={`node-${props.type}-${props.id}`}
      data-node-type={props.type}
      data-node-id={props.id}
    >
      <Icon
        name={icon}
        size={32}
        className="transition-colors duration-200 text-gray-500"
      />

      {inputPorts.map((port: EditorNodePort) => (
        <Handle
          key={`input-${port.id}`}
          id={port.id}
          type="target"
          position={Position.Left}
          style={port.position}
          isConnectable={!isFirstNode}
          data-testid={`handle-input-${port.id}`}
        />
      ))}

      {outputPorts.map((port: EditorNodePort) => (
        <Handle
          key={`output-${port.id}`}
          id={port.id}
          type="source"
          position={Position.Right}
          style={port.position}
          isConnectable
          data-testid={`handle-output-${port.id}`}
        />
      ))}
    </div>
  );
}

export default memo(Node);
