import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { getHandleStyle } from "./Element.styles";
import type { NodeHandlesProps } from "./Element.types";

function NodeHandlesComponent({ selected }: NodeHandlesProps) {
  const handleStyle = getHandleStyle(selected);

  return (
    <>
      {/* Input handle - positioned after inner div to avoid clipping */}
      <Handle type="target" position={Position.Left} style={handleStyle} />

      {/* Output handle - positioned after inner div to avoid clipping */}
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  );
}

export const NodeHandles = memo(NodeHandlesComponent);
