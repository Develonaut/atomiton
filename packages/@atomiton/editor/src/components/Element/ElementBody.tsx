import { styled } from "@atomiton/ui";
import type { ElementBodyProps } from "./Element.types";

const ElementBodyStyled = styled("div", {
  name: "ElementBody",
})("atomiton-element-body", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

/**
 * Element body - main content area
 */
export function ElementBody({
  children,
  className,
  padding = "md",
  ...props
}: ElementBodyProps) {
  return (
    <ElementBodyStyled padding={padding} className={className} {...props}>
      {children}
    </ElementBodyStyled>
  );
}
