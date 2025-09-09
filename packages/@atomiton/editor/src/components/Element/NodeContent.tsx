import { memo } from "react";
import { InnerContent, StyledIcon, getInnerStyle } from "./Element.styles";
import type { NodeContentProps } from "./Element.types";

function NodeContentComponent({ iconName, selected }: NodeContentProps) {
  const innerStyle = getInnerStyle();

  return (
    <InnerContent style={innerStyle}>
      <StyledIcon name={iconName} size={32} selected={selected} />
    </InnerContent>
  );
}

export const NodeContent = memo(NodeContentComponent);
