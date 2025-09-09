import { Icon, styled } from "@atomiton/ui";
import { memo } from "react";

interface NodeContentProps {
  selected?: boolean;
  iconName?: string;
}

const InnerContent = styled("div", {
  name: "InnerContent",
})("bg-white rounded-lg relative flex items-center justify-center");

const StyledIcon = styled(Icon, {
  name: "StyledIcon",
})("transition-colors duration-200", {
  variants: {
    selected: {
      true: "text-gray-700",
      false: "text-gray-500",
    },
  },
});

function NodeContentComponent({ selected, iconName }: NodeContentProps) {
  const innerStyle = {
    width: "calc(100% - 6px)",
    height: "calc(100% - 6px)",
    margin: "3px",
  };

  return (
    <InnerContent style={innerStyle}>
      <StyledIcon name={iconName || "circle"} size={24} selected={selected} />
    </InnerContent>
  );
}

export const NodeContent = memo(NodeContentComponent);
