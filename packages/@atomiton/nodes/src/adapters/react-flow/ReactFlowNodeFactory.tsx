/**
 * React Flow Node Factory - Theme-Aware Node Components
 *
 * Creates React Flow node components that leverage the injected theme system
 * and provide rich visual feedback without hardcoded colors.
 */

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import React from "react";

import type { AdapterTheme, DataType } from "../base/IVisualizationAdapter";

// Helper function to add alpha to colors
const addAlpha = (color: string, alpha: number): string => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  return (
    color +
    Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")
  );
};

interface AtomitonNodeData extends Record<string, unknown> {
  definition: {
    id: string;
    name: string;
    category: string;
    type: string;
    [key: string]: unknown;
  };
  label: string;
  description?: string;
  inputs: Array<{
    id: string;
    name: string;
    dataType: string;
    [key: string]: unknown;
  }>;
  outputs: Array<{
    id: string;
    name: string;
    dataType: string;
    [key: string]: unknown;
  }>;
  executing: boolean;
  completed: boolean;
  hasError: boolean;
  errorMessage?: string;
  hasWarning: boolean;
  warningMessage?: string;
  theme: AdapterTheme;
  categoryColor: string;
  statusColor: string;
  getPortStyle: (dataType: string) => Record<string, string | number | boolean>;
  getHandleStyle: () => Record<string, string | number | boolean>;
}

/**
 * Default Atomiton Node Component with theme injection
 */
export function DefaultAtomitonNode({ data, selected, dragging }: NodeProps) {
  if (!data || typeof data !== "object") {
    return <div>Invalid node data</div>;
  }

  const {
    theme,
    label,
    description,
    inputs,
    outputs,
    executing,
    completed,
    hasError,
    hasWarning,
    errorMessage,
    warningMessage,
    categoryColor,
    getPortStyle,
    getHandleStyle,
  } = data as AtomitonNodeData;

  const nodeStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    border: `2px solid ${hasError ? theme.getStatusColor("error") : categoryColor}`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    minWidth: "180px",
    maxWidth: "300px",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    boxShadow: selected ? theme.shadows.glow(categoryColor) : theme.shadows.sm,
    transition: "all 0.2s ease-in-out",
    position: "relative",
    cursor: dragging ? "grabbing" : "grab",
  };

  // Status indicator styles
  const statusIndicatorStyle: React.CSSProperties = {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: `2px solid ${theme.colors.background}`,
    display:
      executing || completed || hasError || hasWarning ? "block" : "none",
  };

  if (executing) {
    statusIndicatorStyle.backgroundColor = theme.getStatusColor("executing");
    statusIndicatorStyle.animation = "pulse 1.5s infinite";
  } else if (hasError) {
    statusIndicatorStyle.backgroundColor = theme.getStatusColor("error");
  } else if (hasWarning) {
    statusIndicatorStyle.backgroundColor = theme.getStatusColor("warning");
  } else if (completed) {
    statusIndicatorStyle.backgroundColor = theme.getStatusColor("completed");
  }

  return (
    <div style={nodeStyle} className="atomiton-node">
      {/* Status Indicator */}
      <div style={statusIndicatorStyle} />

      {/* Input Handles */}
      {inputs.map((input, index) => (
        <Handle
          key={`input-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{
            ...getHandleStyle(),
            top: `${30 + index * 25}px`,
            left: "-6px",
            backgroundColor: theme.getPortColor(input.dataType as DataType),
          }}
          title={`${input.name} (${input.dataType})`}
        />
      ))}

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <Handle
          key={`output-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{
            ...getHandleStyle(),
            top: `${30 + index * 25}px`,
            right: "-6px",
            backgroundColor: theme.getPortColor(output.dataType as DataType),
          }}
          title={`${output.name} (${output.dataType})`}
        />
      ))}

      {/* Node Header */}
      <div
        style={{
          marginBottom: theme.spacing.sm,
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: theme.spacing.xs,
        }}
      >
        <div
          style={{
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.bold,
            color: categoryColor,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.muted,
              marginTop: "2px",
              lineHeight: theme.typography.lineHeight.tight,
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* Input Ports */}
      {inputs.length > 0 && (
        <div style={{ marginBottom: theme.spacing.sm }}>
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.muted,
              marginBottom: "4px",
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            Inputs
          </div>
          {inputs.map((input) => (
            <div
              key={input.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "2px",
                fontSize: theme.typography.fontSize.xs,
              }}
            >
              <div
                style={{
                  ...getPortStyle(input.dataType),
                  marginRight: theme.spacing.xs,
                  width: "8px",
                  height: "8px",
                }}
              />
              <span style={{ color: theme.colors.foreground }}>
                {input.name}
              </span>
              <span
                style={{
                  color: theme.colors.muted,
                  marginLeft: "4px",
                  fontSize: "10px",
                }}
              >
                ({input.dataType})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Output Ports */}
      {outputs.length > 0 && (
        <div>
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.muted,
              marginBottom: "4px",
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            Outputs
          </div>
          {outputs.map((output) => (
            <div
              key={output.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                marginBottom: "2px",
                fontSize: theme.typography.fontSize.xs,
              }}
            >
              <span
                style={{
                  color: theme.colors.muted,
                  marginRight: "4px",
                  fontSize: "10px",
                }}
              >
                ({output.dataType})
              </span>
              <span style={{ color: theme.colors.foreground }}>
                {output.name}
              </span>
              <div
                style={{
                  ...getPortStyle(output.dataType),
                  marginLeft: theme.spacing.xs,
                  width: "8px",
                  height: "8px",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Error/Warning Messages */}
      {hasError && errorMessage && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.xs,
            backgroundColor: addAlpha
              ? addAlpha(theme.getStatusColor("error"), 0.1)
              : "#ff6b6b20",
            border: `1px solid ${theme.getStatusColor("error")}`,
            borderRadius: theme.radius.sm,
            fontSize: theme.typography.fontSize.xs,
            color: theme.getStatusColor("error"),
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {hasWarning && warningMessage && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.xs,
            backgroundColor: addAlpha
              ? addAlpha(theme.getStatusColor("warning"), 0.1)
              : "#ffd43b20",
            border: `1px solid ${theme.getStatusColor("warning")}`,
            borderRadius: theme.radius.sm,
            fontSize: theme.typography.fontSize.xs,
            color: theme.getStatusColor("warning"),
          }}
        >
          ℹ️ {warningMessage}
        </div>
      )}
    </div>
  );
}

/**
 * Input Node Component - specialized for data input nodes
 */
export function InputAtomitonNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as AtomitonNodeData;

  return (
    <div
      style={{
        border: `3px dashed ${nodeData.theme.getCategoryColor("input")}`,
        borderRadius: nodeData.theme.radius.lg,
      }}
    >
      <DefaultAtomitonNode {...props} />
    </div>
  );
}

/**
 * Output Node Component - specialized for data output nodes
 */
export function OutputAtomitonNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as AtomitonNodeData;

  return (
    <div
      style={{
        border: `3px solid ${nodeData.theme.getCategoryColor("output")}`,
        borderRadius: nodeData.theme.radius.lg,
        boxShadow: nodeData.theme.shadows.glow(
          nodeData.theme.getCategoryColor("output"),
        ),
      }}
    >
      <DefaultAtomitonNode {...props} />
    </div>
  );
}

/**
 * Group Node Component - for grouping related nodes
 */
export function GroupAtomitonNode(props: NodeProps) {
  const { data, selected } = props;
  const nodeData = data as AtomitonNodeData;

  return (
    <div
      style={{
        backgroundColor: addAlpha(nodeData.theme.colors.background, 0.8),
        border: `2px dashed ${nodeData.theme.colors.border}`,
        borderRadius: nodeData.theme.radius.lg,
        padding: nodeData.theme.spacing.lg,
        minWidth: "300px",
        minHeight: "200px",
        backdropFilter: "blur(10px)",
        boxShadow: selected
          ? nodeData.theme.shadows.lg
          : nodeData.theme.shadows.sm,
      }}
    >
      <div
        style={{
          fontSize: nodeData.theme.typography.fontSize.lg,
          fontWeight: nodeData.theme.typography.fontWeight.bold,
          color: nodeData.theme.colors.foreground,
          marginBottom: nodeData.theme.spacing.md,
          textAlign: "center",
        }}
      >
        {nodeData.label}
      </div>
      {nodeData.description && (
        <div
          style={{
            fontSize: nodeData.theme.typography.fontSize.sm,
            color: nodeData.theme.colors.muted,
            textAlign: "center",
          }}
        >
          {nodeData.description}
        </div>
      )}
    </div>
  );
}

/**
 * Node type registry for React Flow
 */
export const AtomitonNodeTypes = {
  default: DefaultAtomitonNode,
  input: InputAtomitonNode,
  output: OutputAtomitonNode,
  group: GroupAtomitonNode,
};

// Create proper ReactFlow Node type with our data
type AtomitonReactFlowNode = Node<AtomitonNodeData>;

/**
 * Factory function to create node components with theme injection
 */
export function createNodeComponents(_theme: AdapterTheme) {
  return {
    default: (props: NodeProps<AtomitonReactFlowNode>) => (
      <DefaultAtomitonNode {...props} />
    ),
    input: (props: NodeProps<AtomitonReactFlowNode>) => (
      <InputAtomitonNode {...props} />
    ),
    output: (props: NodeProps<AtomitonReactFlowNode>) => (
      <OutputAtomitonNode {...props} />
    ),
    group: (props: NodeProps<AtomitonReactFlowNode>) => (
      <GroupAtomitonNode {...props} />
    ),
  };
}

export default AtomitonNodeTypes;
