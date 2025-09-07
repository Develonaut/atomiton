import { useState } from "react";
import { styled } from "@atomiton/ui";
import type { ToolbarToggleProps } from "./Toolbar.types";

const ToolbarToggleStyled = styled("button", {
  name: "ToolbarToggle",
})(
  [
    "atomiton-toolbar-toggle",
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded",
    "font-medium",
    "transition-all",
    "duration-200",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "h-6 w-6 text-xs",
        md: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
      },
      variant: {
        ghost: "hover:bg-surface-02 data-[state=on]:bg-surface-02",
        outline:
          "border border-s-01 hover:bg-surface-02 data-[state=on]:bg-accent-primary/20 data-[state=on]:border-accent-primary",
        default:
          "bg-surface-01 border border-s-01 hover:bg-surface-02 data-[state=on]:bg-accent-primary data-[state=on]:text-white",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "ghost",
    },
  },
);

/**
 * Toolbar toggle button component
 */
export function ToolbarToggle({
  children,
  className,
  icon,
  tooltip,
  size = "md",
  variant = "ghost",
  pressed: controlledPressed,
  defaultPressed = false,
  disabled = false,
  onPressedChange,
  ...props
}: ToolbarToggleProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);

  const isControlled = controlledPressed !== undefined;
  const pressed = isControlled ? controlledPressed : internalPressed;

  const handleToggle = () => {
    const newPressed = !pressed;
    if (!isControlled) {
      setInternalPressed(newPressed);
    }
    onPressedChange?.(newPressed);
  };

  return (
    <ToolbarToggleStyled
      size={size}
      variant={variant}
      className={className}
      disabled={disabled}
      onClick={handleToggle}
      title={tooltip}
      data-variant={variant}
      data-size={size}
      data-pressed={pressed || undefined}
      aria-pressed={pressed}
      {...props}
    >
      {icon && <span className="toolbar-toggle-icon">{icon}</span>}
      {children && <span className="toolbar-toggle-text">{children}</span>}
    </ToolbarToggleStyled>
  );
}
