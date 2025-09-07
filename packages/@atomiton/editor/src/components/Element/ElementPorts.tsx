import { styled } from "@atomiton/ui";
import type { ElementPortsProps } from "./Element.types";

const ElementPortsStyled = styled("div", {
  name: "ElementPorts",
})(["atomiton-element-ports", "absolute", "flex", "gap-2"], {
  variants: {
    side: {
      top: "top-0 left-0 right-0 flex-row justify-center -translate-y-1/2",
      right: "right-0 top-0 bottom-0 flex-col justify-center translate-x-1/2",
      bottom: "bottom-0 left-0 right-0 flex-row justify-center translate-y-1/2",
      left: "left-0 top-0 bottom-0 flex-col justify-center -translate-x-1/2",
    },
  },
  defaultVariants: {
    side: "left",
  },
});

/**
 * Element ports container - connection points container
 */
export function ElementPorts({
  children,
  className,
  side = "left",
  ...props
}: ElementPortsProps) {
  return (
    <ElementPortsStyled
      side={side}
      className={className}
      data-side={side}
      {...props}
    >
      {children}
    </ElementPortsStyled>
  );
}
