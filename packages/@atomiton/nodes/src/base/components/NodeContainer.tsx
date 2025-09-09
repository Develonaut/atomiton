import { styled } from "@atomiton/ui";
import { memo, type ReactNode } from "react";

interface NodeContainerProps {
  selected?: boolean;
  children?: ReactNode;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const StyledNodeContainer = styled("div", {
  name: "NodeContainer",
})(
  "relative w-20 h-20 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200",
  {
    variants: {
      selected: {
        true: "",
        false: "",
      },
    },
  },
);

function NodeContainerComponent({
  selected,
  children,
  onMouseEnter,
  onMouseLeave,
}: NodeContainerProps) {
  const containerStyle = {
    background: "#fafafa",
    border: selected
      ? "1px solid rgba(0, 0, 0, 0.2)"
      : "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: selected
      ? "0 2px 8px -2px rgba(0, 0, 0, 0.12), 0 1px 3px -1px rgba(0, 0, 0, 0.08)"
      : "none",
  };

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
    <StyledNodeContainer
      selected={selected}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </StyledNodeContainer>
  );
}

export const NodeContainer = memo(NodeContainerComponent);
