import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, type CSSProperties } from "react";

/**
 * Wraps node components from @atomiton/nodes with ReactFlow-specific features
 * This allows the nodes package to remain UI-library agnostic while the editor
 * adds flow-specific functionality like connection handles
 */
export function withFlowHandles(
  NodeComponent: React.ComponentType,
): React.ComponentType<NodeProps> {
  function NodeWithHandles(props: NodeProps) {
    const handleStyle: CSSProperties = {
      background: props.selected ? "#6b7280" : "#d1d5db",
      width: 12,
      height: 12,
      border: "2px solid #fafafa",
      borderRadius: "50%",
      transition: "all 0.2s ease",
      zIndex: 10,
    };

    return (
      <>
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyle}
          isConnectable
        />
        <NodeComponent {...(props as any)} />
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyle}
          isConnectable
        />
      </>
    );
  }

  NodeWithHandles.displayName = `${NodeComponent.displayName || "Node"}WithHandles`;
  return memo(NodeWithHandles);
}

/**
 * Takes node components from @atomiton/nodes and wraps them with ReactFlow handles
 */
export function wrapNodeComponents(
  components: Record<string, React.ComponentType>,
): Record<string, React.ComponentType<NodeProps>> {
  const wrapped: Record<string, React.ComponentType<NodeProps>> = {};

  for (const [key, Component] of Object.entries(components)) {
    wrapped[key] = withFlowHandles(Component);
  }

  return wrapped;
}
