import { styled } from "@atomiton/ui";
import type { ConnectionProps } from "./Connection.types";

const ConnectionStyled = styled("g", {
  name: "Connection",
})("atomiton-connection cursor-pointer");

/**
 * Connection component - represents links between elements
 * Designed for use within React Flow as custom edge components
 */
export function ConnectionRoot({
  className,
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  type = "default",
  state = "idle",
  selected = false,
  animated = false,
  label,
  data,
  style,
  markerEnd: _markerEnd = "arrow",
  markerStart: _markerStart = "none",
  onClick,
  onDoubleClick,
  children,
  ...props
}: ConnectionProps) {
  const handleOnClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick?.(event, {
      id,
      source,
      target,
      type,
      state,
      selected,
      data,
    } as ConnectionProps);
  };

  const handleOnDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDoubleClick?.(event, {
      id,
      source,
      target,
      type,
      state,
      selected,
      data,
    } as ConnectionProps);
  };

  return (
    <ConnectionStyled
      className={className}
      data-connection-id={id}
      data-connection-type={type}
      data-state={state}
      data-selected={selected || undefined}
      data-animated={animated || undefined}
      onClick={handleOnClick}
      onDoubleClick={handleOnDoubleClick}
      {...props}
    >
      {children}
    </ConnectionStyled>
  );
}
