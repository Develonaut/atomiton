import { styled } from "@atomiton/ui";

export interface CanvasElementsProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

const CanvasElementsStyled = styled("div", {
  name: "CanvasElements",
})("atomiton-canvas-elements");

/**
 * Canvas elements - nodes container
 */
export function CanvasElements({ children, ...props }: CanvasElementsProps) {
  return <CanvasElementsStyled {...props}>{children}</CanvasElementsStyled>;
}
