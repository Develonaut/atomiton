import { styled } from "@atomiton/ui";

export type CanvasNodesProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

const CanvasNodesStyled = styled("div", {
  name: "CanvasNodes",
})("atomiton-canvas-nodes");

/**
 * Canvas nodes - nodes container
 */
export function CanvasNodes({ children, ...props }: CanvasNodesProps) {
  return <CanvasNodesStyled {...props}>{children}</CanvasNodesStyled>;
}
