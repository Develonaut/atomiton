import { getNodeByType } from "@atomiton/nodes";
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
 * Visual styling (borders, hover, selection) is handled at the canvas level
 */
function Node(props: ReactFlowNodeProps) {
  const nodes = useNodes();
  const isFirstNode = nodes.length > 0 && nodes[0].id === props.id;

  const icon = getNodeByType(props.type)?.metadata.icon || "zap";

  return (
    <div
      className="atomiton-node"
      data-testid={`node-${props.type}-${props.id}`}
      data-node-type={props.type}
      data-node-id={props.id}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={!isFirstNode}
      />
      <Icon
        name={icon}
        size={32}
        className="transition-colors duration-200 text-gray-500"
      />
      <Handle type="source" position={Position.Right} isConnectable />
    </div>
  );
}

export default memo(Node);
