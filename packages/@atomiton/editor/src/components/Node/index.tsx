import { core } from "@atomiton/core";
import { Icon } from "@atomiton/ui";
import {
  Handle,
  Position,
  type NodeProps as ReactFlowNodeProps,
} from "@xyflow/react";
import { memo } from "react";

/**
 * Custom Node component - focuses purely on content and functionality
 * Visual styling (borders, hover, selection) is handled at the canvas level
 */
function Node(props: ReactFlowNodeProps) {
  const nodeMetadata = core.nodes.getNodeMetadata(props.type as string);
  const icon = nodeMetadata?.icon || "circle";

  return (
    <div className="atomiton-node">
      <Handle type="target" position={Position.Left} isConnectable />
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
