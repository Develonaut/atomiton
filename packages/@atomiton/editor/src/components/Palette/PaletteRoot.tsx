import { styled } from "@atomiton/ui";
import type { PaletteProps, NodeType } from "./Palette.types";

const PaletteStyled = styled("div", {
  name: "Palette",
})([
  "atomiton-palette",
  "flex",
  "flex-col",
  "h-full",
  "bg-surface-01",
  "border-r",
  "border-s-01",
  "overflow-hidden",
]);

// Default available nodes - should come from @atomiton/core
const defaultNodes: NodeType[] = [
  { type: "input", label: "Input", category: "IO" },
  { type: "output", label: "Output", category: "IO" },
  { type: "process", label: "Process", category: "Transform" },
  { type: "decision", label: "Decision", category: "Control" },
  { type: "loop", label: "Loop", category: "Control" },
  { type: "api", label: "API Call", category: "Integration" },
  { type: "database", label: "Database", category: "Integration" },
  { type: "function", label: "Function", category: "Custom" },
];

/**
 * Palette component - element library for draggable items
 * Used for browsing and adding elements to the canvas
 */
export function PaletteRoot({
  children,
  className,
  nodes: _nodes = defaultNodes,
  categories,
  searchQuery: _searchQuery = "",
  onSearchChange,
  onNodeDragStart,
  onNodeSelect,
  ...props
}: PaletteProps) {
  return (
    <PaletteStyled className={className} {...props}>
      {children}
    </PaletteStyled>
  );
}
