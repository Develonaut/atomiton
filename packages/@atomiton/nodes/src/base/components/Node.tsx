import { memo } from "react";
import { NodeContainer } from "./NodeContainer";
import { NodeContent } from "./NodeContent";

/**
 * Generic node component props interface
 * This is UI-library agnostic and can work with any flow editor
 */
export interface NodeComponentProps {
  id?: string;
  data?: unknown;
  selected?: boolean;
  [key: string]: unknown; // Allow additional props from the flow library
}

/**
 * Creates a Node component with specific metadata baked in
 * This allows each node to have its icon and other metadata without
 * the editor needing to pass it around
 *
 * Note: Connection handles are not included as they are flow-library specific
 * The editor/flow library should add handles as needed
 */
export function createNodeComponent(icon: string, name?: string) {
  function NodeComponent({ selected }: NodeComponentProps) {
    return (
      <NodeContainer selected={!!selected}>
        <NodeContent selected={!!selected} iconName={icon} />
      </NodeContainer>
    );
  }

  NodeComponent.displayName = name ? `${name}Node` : "Node";
  return memo(NodeComponent);
}

/**
 * Default Node component (uses generic circle icon)
 */
export const Node = createNodeComponent("circle", "Default");
export default Node;
