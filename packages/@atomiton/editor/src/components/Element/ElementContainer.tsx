import { styled } from "@atomiton/ui";
import type { ElementContainerProps } from "./Element.types";

const ElementContainerStyled = styled("div", {
  name: "ElementContainer",
})("atomiton-element-container absolute inset-0");

/**
 * Element container - positioned wrapper for absolute positioning
 */
export function ElementContainer({
  children,
  className,
  size = "md",
  state = "idle",
  selected = false,
  ...props
}: ElementContainerProps) {
  return (
    <ElementContainerStyled
      className={className}
      data-size={size}
      data-state={state}
      data-selected={selected || undefined}
      {...props}
    >
      {children}
    </ElementContainerStyled>
  );
}
