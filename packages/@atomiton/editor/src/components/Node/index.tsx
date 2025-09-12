import { core, type NodeType } from "@atomiton/core";
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

  const nodeMetadata = core.nodes.getNodeMetadata(props.type as NodeType);
  const icon = nodeMetadata?.icon || "circle";

  return (
    <div className="atomiton-node">
      {isFirstNode ? (
        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            isConnectable
            style={{ opacity: 0 }}
          />
          <Icon
            name="flash"
            size={16}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      ) : (
        <Handle type="target" position={Position.Left} isConnectable />
      )}
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
