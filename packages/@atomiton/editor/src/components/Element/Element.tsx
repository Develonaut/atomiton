import { getNodeIcon } from "@atomiton/ui";
import { memo } from "react";
import type { ElementProps } from "./Element.types";
import { NodeContainer } from "./NodeContainer";
import { NodeContent } from "./NodeContent";
import { NodeHandles } from "./NodeHandles";

/**
 * Element - Custom node component for React Flow canvas
 * Square node with styled components
 */
function ElementComponent({ data, selected }: ElementProps) {
  const nodeType = (data?.nodeType || data?.label || "default") as string;
  const iconName = getNodeIcon(nodeType);

  return (
    <NodeContainer selected={!!selected}>
      <NodeContent iconName={iconName} selected={!!selected} />
      <NodeHandles selected={!!selected} />
    </NodeContainer>
  );
}

export const Element = memo(ElementComponent);
