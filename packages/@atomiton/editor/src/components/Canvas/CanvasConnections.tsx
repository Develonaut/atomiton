import { styled } from "@atomiton/ui";

/**
 * Props for Canvas connections component
 */
export type CanvasConnectionsProps = {
  children?: React.ReactNode;
  className?: string;
  connectionLineType?:
    | "default"
    | "straight"
    | "step"
    | "smoothstep"
    | "bezier";
  selectable?: boolean;
  [key: string]: unknown; // Allow additional props to pass through
};

/**
 * Styled connections container
 */
const CanvasConnectionsStyled = styled("div", {
  name: "CanvasConnections",
})("");

/**
 * Canvas connections - edges container
 */
export function CanvasConnections({
  children,
  connectionLineType = "bezier",
  ...props
}: CanvasConnectionsProps) {
  return (
    <CanvasConnectionsStyled
      data-connection-line-type={connectionLineType}
      {...props}
    >
      {children}
    </CanvasConnectionsStyled>
  );
}
