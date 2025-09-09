import type { NodeProps } from "@xyflow/react";

export interface ElementData {
  icon?: string;
  label?: string;
  nodeType?: string;
  [key: string]: unknown;
}

export interface ElementProps extends NodeProps {}

export interface NodeContainerProps {
  selected: boolean;
  children: React.ReactNode;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export interface NodeContentProps {
  iconName: string;
  selected: boolean;
}

export interface NodeHandlesProps {
  selected: boolean;
}
