import { useEditorStore } from "#hooks/useEditorStore";
import type { EditorNode } from "#types/EditorNode";
import { getNodeDefinition } from "@atomiton/nodes/definitions";
import { Icon } from "@atomiton/ui";
import {
  Handle,
  Position,
  type NodeProps as ReactFlowNodeProps,
} from "@xyflow/react";
import { memo, useMemo } from "react";

/**
 * Node Component
 *
 * A reusable, performant node component for the editor that:
 * - Follows CVA patterns for styling
 * - Uses Bento Box architecture
 * - Optimizes re-renders with memo and selective subscriptions
 * - Dynamically renders handles based on port definitions
 */
function NodeComponent(props: ReactFlowNodeProps<EditorNode>) {
  // TODO: Variant, size, and state could be passed via props or derived from data
  // // Extract variant props from data if provided
  // const variant =
  //   ((props.data as Record<string, unknown>)?.variant as
  //     | "default"
  //     | "active"
  //     | "error"
  //     | "success") || "default";
  // const size =
  //   ((props.data as Record<string, unknown>)?.size as "sm" | "md" | "lg") ||
  //   "md";
  // const state =
  //   ((props.data as Record<string, unknown>)?.state as
  //     | "error"
  //     | "idle"
  //     | "running"
  //     | "complete") || "idle";

  // Efficient first node check with shallow comparison
  const isFirstNode = useEditorStore((state) => {
    const firstNode = state.nodeLookup.values().next().value;
    return firstNode?.id === props.id;
  });

  // Extract port definitions
  const data = useMemo(() => props.data as EditorNode, [props.data]);
  const inputPorts = useMemo(() => data?.inputPorts || [], [data]);
  const outputPorts = useMemo(() => data?.outputPorts || [], [data]);

  // Get icon with fallback
  const icon = useMemo(
    () =>
      data?.metadata?.icon ||
      getNodeDefinition(props.type)?.metadata?.icon ||
      "zap",
    [props.type, data?.metadata?.icon],
  );

  // Calculate handle positions once
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

  // Get icon size based on node size
  const iconSize = 24; // Default to medium size

  return (
    <div
      data-testid={`node-${props.type}-${props.id}`}
      data-node-type={props.type}
      data-node-id={props.id}
    >
      {/* Input handles */}
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

      {/* Node icon */}
      <Icon name={icon} size={iconSize} data-icon={icon} />

      {/* Output handles */}
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

      {/* Fallback handles */}
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

// Memoize to prevent unnecessary re-renders
export const Node = memo(NodeComponent);

// Default export for React Flow
export default Node;
