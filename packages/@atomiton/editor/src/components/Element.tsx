import { Box, Icon, styled } from "@atomiton/ui";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

export interface ElementProps {
  icon?: string;
  label?: string;
  [key: string]: any;
}

const ElementStyled = styled(Box, {
  name: "Element",
})(
  [
    "atomiton-element",
    "relative",
    "flex",
    "items-center",
    "justify-center",
    "size-16",
    "rounded-2xl",
    "bg-surface-03",
    "border",
    "border-s-01",
    "transition-all",
    "duration-200",
    "cursor-pointer",
  ],
  {
    variants: {
      selected: {
        true: [
          "border-accent-primary",
          "shadow-lg",
          "shadow-accent-primary/20",
          "scale-105",
        ],
        false: ["hover:border-s-02", "hover:shadow-md"],
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

const HandleStyled = styled(Handle, {
  name: "ElementHandle",
})(["!w-2.5", "!h-2.5", "!border-2", "!border-white"], {
  variants: {
    type: {
      input: ["!bg-accent-secondary", "!-left-[5px]"],
      output: ["!bg-accent-primary", "!-right-[5px]"],
    },
  },
});

/**
 * Element - Lightweight node component for the canvas
 * Simple icon-centered design with connection handles
 * Uses @atomiton/ui styled system for consistent design
 */
function ElementComponent({ data, selected }: NodeProps<ElementProps>) {
  const iconName = data.icon || "circle";

  return (
    <ElementStyled selected={selected}>
      <HandleStyled type="target" position={Position.Left} $type="input" />

      <Icon name={iconName} size={28} className="text-secondary" />

      <HandleStyled type="source" position={Position.Right} $type="output" />
    </ElementStyled>
  );
}

export const Element = memo(ElementComponent);
