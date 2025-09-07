import { styled } from "@atomiton/ui";
import type { ElementProps } from "./Element.types";
import { ElementContainer } from "./ElementContainer";
import { ElementBody } from "./ElementBody";
import { ElementHeader } from "./ElementHeader";
import { ElementPorts } from "./ElementPorts";
import { ElementPort } from "./ElementPort";
import { ElementBadge } from "./ElementBadge";
import { ElementOverlay } from "./ElementOverlay";

const ElementStyled = styled("div", {
  name: "Element",
})(
  [
    "atomiton-element",
    "relative",
    "rounded-lg",
    "border",
    "bg-surface-01",
    "shadow-sm",
    "transition-all",
    "duration-200",
    "cursor-pointer",
    "select-none",
  ],
  {
    variants: {
      size: {
        sm: "min-w-24 min-h-16",
        md: "min-w-32 min-h-20",
        lg: "min-w-40 min-h-24",
      },
      state: {
        idle: "border-s-01 hover:border-s-02",
        selected: "border-accent-primary shadow-accent-primary/20 shadow-md",
        connecting:
          "border-accent-secondary shadow-accent-secondary/20 shadow-md",
        error: "border-status-error shadow-status-error/20 shadow-md",
      },
      draggable: {
        true: "cursor-grab active:cursor-grabbing",
        false: "cursor-default",
      },
    },
    compoundVariants: [
      {
        state: "selected",
        class: "ring-2 ring-accent-primary/30",
      },
      {
        state: "connecting",
        class: "ring-2 ring-accent-secondary/30",
      },
      {
        state: "error",
        class: "ring-2 ring-status-error/30",
      },
    ],
    defaultVariants: {
      size: "md",
      state: "idle",
      draggable: true,
    },
  },
);

/**
 * Element component - represents individual items in the canvas
 * Designed for use within React Flow as custom node components
 */
export function Element({
  children,
  className,
  id,
  type,
  title,
  content,
  size = "md",
  state = "idle",
  selected = false,
  draggable = true,
  selectable = true,
  data,
  onClick,
  onDoubleClick,
  ...props
}: ElementProps) {
  const handleOnClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectable) {
      onClick?.(event, {
        id,
        type,
        title,
        content,
        size,
        state,
        selected,
        draggable,
        selectable,
        data,
      } as ElementProps);
    }
  };

  const handleOnDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDoubleClick?.(event, {
      id,
      type,
      title,
      content,
      size,
      state,
      selected,
      draggable,
      selectable,
      data,
    } as ElementProps);
  };

  return (
    <ElementStyled
      size={size}
      state={selected ? "selected" : state}
      draggable={draggable}
      className={className}
      data-element-id={id}
      data-element-type={type}
      data-size={size}
      data-state={state}
      data-selected={selected || undefined}
      data-draggable={draggable || undefined}
      data-selectable={selectable || undefined}
      onClick={handleOnClick}
      onDoubleClick={handleOnDoubleClick}
      {...props}
    >
      {children || (
        <>
          {title && <Element.Header title={title} />}
          <Element.Body>{content}</Element.Body>
        </>
      )}
    </ElementStyled>
  );
}

// Create compound component using Object.assign
Element.Container = ElementContainer;
Element.Body = ElementBody;
Element.Header = ElementHeader;
Element.Ports = ElementPorts;
Element.Port = ElementPort;
Element.Badge = ElementBadge;
Element.Overlay = ElementOverlay;

export default Element;
