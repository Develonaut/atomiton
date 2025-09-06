/**
 * Base Node UI Component
 *
 * Provides common functionality for node UI implementations.
 * This is pure display logic with NO business logic or execution concerns.
 */

import {
  ActionIcon,
  Badge,
  Box,
  Collapse,
  Group,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { Handle, Position } from "@xyflow/react";
import React, { memo, useCallback, useState } from "react";

import { CATEGORY_COLORS, COLORS, STATUS_COLORS } from "@atomiton/ui";

import type { PortDefinition } from "../types";
import type { NodeUIProps } from "./NodePackage";

export { CATEGORY_COLORS, COLORS as DRACULA_COLORS, STATUS_COLORS };

/**
 * Base Node UI Props - Common props for all node components
 */
export interface BaseNodeUIProps
  extends NodeUIProps<{
    label: string;
    subtitle?: string;
    description?: string;
    category: keyof typeof CATEGORY_COLORS;
    icon?: string;
    status?: keyof typeof STATUS_COLORS;
  }> {}

/**
 * Base Node UI Configuration
 */
export interface BaseNodeUIConfig {
  /** Node definition for metadata */
  nodeDefinition: {
    name: string;
    description: string;
    version: string;
    inputPorts: PortDefinition[];
    outputPorts: PortDefinition[];
  };
  /** Default category color */
  categoryColor: string;
  /** Default icon component */
  defaultIcon: React.ComponentType<{ size?: number }>;
  /** Show configuration panel by default */
  showConfigByDefault?: boolean;
}

/**
 * Hook for managing node UI state
 */
export function useNodeUIState(initialConfig?: Record<string, unknown>) {
  const [configExpanded, setConfigExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState(initialConfig || {});

  const toggleConfig = useCallback(() => {
    setConfigExpanded((prev) => !prev);
  }, []);

  const updateConfig = useCallback((key: string, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    configExpanded,
    localConfig,
    toggleConfig,
    updateConfig,
  };
}

/**
 * Render connection handles based on port definitions
 */
export function renderNodeHandles(
  inputPorts: PortDefinition[],
  outputPorts: PortDefinition[],
  categoryColor: string,
) {
  const inputHandles = inputPorts.map((port, index) => (
    <Handle
      key={`input-${port.id}`}
      type="target"
      position={Position.Left}
      id={port.id}
      style={{
        background: categoryColor,
        width: port.required ? 10 : 8,
        height: port.required ? 10 : 8,
        border: `2px solid ${COLORS.bgLight}`,
        top: `${30 + index * 15}%`,
      }}
      title={port.description}
    />
  ));

  const outputHandles = outputPorts.map((port, index) => (
    <Handle
      key={`output-${port.id}`}
      type="source"
      position={Position.Right}
      id={port.id}
      style={{
        background: categoryColor,
        width: port.required ? 10 : 8,
        height: port.required ? 10 : 8,
        border: `2px solid ${COLORS.bgLight}`,
        top: `${30 + index * 15}%`,
      }}
      title={port.description}
    />
  ));

  return { inputHandles, outputHandles };
}

/**
 * Render node status badge
 */
export function renderStatusBadge(
  status?: keyof typeof STATUS_COLORS,
  progress?: number,
) {
  if (!status || status === "idle") return null;

  const statusColor = STATUS_COLORS[status];
  const label =
    progress !== undefined && status === "running"
      ? `${status} ${Math.round(progress)}%`
      : String(status).charAt(0).toUpperCase() + String(status).slice(1);

  return (
    <Badge
      size="xs"
      radius="xs"
      style={{
        backgroundColor: `${statusColor}22`,
        color: statusColor,
        border: `1px solid ${statusColor}44`,
      }}
    >
      {label}
    </Badge>
  );
}

/**
 * Render animated border for running status
 */
export function renderRunningAnimation(status?: keyof typeof STATUS_COLORS) {
  if (status !== "running") return null;

  return (
    <Box
      style={{
        position: "absolute",
        inset: -2,
        borderRadius: 14,
        background: `conic-gradient(from 0deg, ${COLORS.yellow}, ${COLORS.green}, ${COLORS.cyan}, ${COLORS.yellow})`,
        zIndex: -1,
        animation: "spin 2s linear infinite",
      }}
    />
  );
}

/**
 * Base Node Component Factory
 * Creates a standardized node component with common functionality
 */
export function createBaseNodeComponent(
  config: BaseNodeUIConfig,
  renderConfigPanel?: (props: {
    localConfig: Record<string, unknown>;
    updateConfig: (key: string, value: unknown) => void;
  }) => React.ReactNode,
): React.FC<BaseNodeUIProps> {
  const BaseNodeComponent: React.FC<BaseNodeUIProps> = memo(
    ({ data, selected, id: _id }) => {
      const { configExpanded, localConfig, toggleConfig, updateConfig } =
        useNodeUIState(data.config);

      const categoryColor =
        CATEGORY_COLORS[data.category as keyof typeof CATEGORY_COLORS] ||
        config.categoryColor;
      // const statusColor = STATUS_COLORS[(data.status as keyof typeof STATUS_COLORS) || 'idle'];

      const { inputHandles, outputHandles } = renderNodeHandles(
        config.nodeDefinition?.inputPorts || [],
        config.nodeDefinition?.outputPorts || [],
        categoryColor,
      );

      return (
        <Box
          style={{
            minWidth: 220,
            borderRadius: 12,
            border: `2px solid ${selected ? COLORS.purple : COLORS.selection}`,
            backgroundColor: COLORS.bgLight,
            boxShadow: selected
              ? `0 8px 32px rgba(189, 147, 249, 0.3), 0 0 0 1px rgba(189, 147, 249, 0.5)`
              : "0 4px 12px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            position: "relative",
          }}
          className={`base-node ${selected ? "selected" : ""}`}
        >
          {inputHandles}
          {outputHandles}
          <Box
            style={{
              background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}11)`,
              borderRadius: "10px 10px 0 0",
              padding: "12px 16px",
              borderBottom: `1px solid ${COLORS.selection}`,
            }}
          >
            <Group gap="xs" wrap="nowrap" justify="space-between">
              <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <ThemeIcon
                  size="md"
                  radius="md"
                  style={{
                    backgroundColor: categoryColor,
                    color: COLORS.background,
                  }}
                >
                  <config.defaultIcon size={16} />
                </ThemeIcon>

                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    size="sm"
                    fw={600}
                    c={COLORS.foreground}
                    style={{ lineHeight: 1.2 }}
                    truncate
                  >
                    {data.label ||
                      config.nodeDefinition?.name ||
                      "Unknown Node"}
                  </Text>
                  <Text
                    size="xs"
                    c={COLORS.comment}
                    style={{ lineHeight: 1.1 }}
                    truncate
                  >
                    v{config.nodeDefinition?.version || "1.0.0"}
                  </Text>
                </Box>
              </Group>

              {renderConfigPanel && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={toggleConfig}
                  style={{
                    color: COLORS.comment,
                    "&:hover": { color: COLORS.foreground },
                  }}
                >
                  {configExpanded ? (
                    <IconChevronDown size={14} />
                  ) : (
                    <IconChevronRight size={14} />
                  )}
                </ActionIcon>
              )}
            </Group>
          </Box>

          <Box style={{ padding: "12px 16px" }}>
            <Text
              size="xs"
              c={COLORS.comment}
              style={{
                lineHeight: 1.4,
                marginBottom: 8,
              }}
            >
              {data.description ||
                config.nodeDefinition?.description ||
                "No description"}
            </Text>

            {renderStatusBadge(data.status, data.progress)}
            {renderConfigPanel && (
              <Collapse in={configExpanded}>
                <Box
                  style={{
                    backgroundColor: COLORS.background,
                    borderRadius: 6,
                    padding: 12,
                    marginTop: 8,
                    border: `1px solid ${COLORS.selection}`,
                  }}
                >
                  {renderConfigPanel({ localConfig, updateConfig })}
                </Box>
              </Collapse>
            )}
          </Box>

          {renderRunningAnimation(data.status)}
        </Box>
      );
    },
  );

  BaseNodeComponent.displayName = "BaseNodeComponent";

  return BaseNodeComponent;
}
