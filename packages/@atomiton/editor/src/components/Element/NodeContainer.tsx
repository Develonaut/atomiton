import { memo } from "react";
import {
  NodeContainer as StyledContainer,
  getContainerStyle,
} from "./Element.styles";
import type { NodeContainerProps } from "./Element.types";

function NodeContainerComponent({
  selected,
  children,
  onMouseEnter,
  onMouseLeave,
}: NodeContainerProps) {
  const containerStyle = getContainerStyle(selected);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow =
      "0 2px 8px -2px rgba(0, 0, 0, 0.12), 0 1px 3px -1px rgba(0, 0, 0, 0.08)";
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selected) {
      e.currentTarget.style.boxShadow =
        "0 2px 8px -2px rgba(0, 0, 0, 0.12), 0 1px 3px -1px rgba(0, 0, 0, 0.08)";
    } else {
      e.currentTarget.style.boxShadow = "none";
    }
    onMouseLeave?.(e);
  };

  return (
    <StyledContainer
      selected={selected}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </StyledContainer>
  );
}

export const NodeContainer = memo(NodeContainerComponent);
