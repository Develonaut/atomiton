import React from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

/**
 * Icon component using Lucide icons
 * Maps icon names to Lucide icon components
 */
export function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: IconProps) {
  // Convert kebab-case to PascalCase for Lucide icon names
  const iconName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // Get the icon component from Lucide
  const LucideIcon = (LucideIcons as any)[iconName] as LucideIcon | undefined;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    // Return a placeholder icon
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}

// Node-specific icon mapping
// Maps node types to appropriate Lucide icon names
export const NODE_ICON_MAP: Record<string, string> = {
  // Data Input/Output
  "csv-reader": "table",
  "file-system": "folder",

  // External Integration
  "http-request": "globe",
  "shell-command": "terminal",
  "image-composite": "image",

  // Data Processing
  transform: "code",
  code: "brackets",

  // Control Flow
  loop: "repeat",
  parallel: "git-branch",
  "if-else": "git-branch",

  // Common icons
  input: "arrow-right",
  output: "arrow-left",
  file: "file",
  "file-plus": "file-plus",
  text: "text",
  list: "list",
  filter: "filter",
  compress: "minimize-2",
  shuffle: "shuffle",
  clock: "clock",
  "git-merge": "git-merge",
  "git-pull-request": "git-pull-request",
  calculator: "calculator",
  "file-text": "file-text",
  search: "search",
  calendar: "calendar",
  lock: "lock",
  box: "box",
  anchor: "anchor",
  "message-square": "message-square",
  bug: "bug",
  "alert-triangle": "alert-triangle",
  database: "database",
  link: "link",
  mail: "mail",
};

/**
 * Get the appropriate icon name for a node type
 */
export function getNodeIcon(nodeType: string): string {
  return NODE_ICON_MAP[nodeType] || "circle";
}

export default Icon;
