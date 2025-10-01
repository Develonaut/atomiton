import { cn } from "#utils/cn";

export type BuildClassNameConfig = {
  name?: string;
  styleClasses?: string;
  systemClasses: string[];
  userClassName?: string;
};

/**
 * Build the final className from all sources
 * Pure function that combines base, style, system, and user classes
 */
export function buildClassName(config: BuildClassNameConfig): string {
  const { name, styleClasses, systemClasses, userClassName } = config;

  const baseClassName = name ? `atomiton-${name.toLowerCase()}` : undefined;

  // Normalize whitespace in string inputs by splitting and rejoining
  const normalizedStyleClasses = styleClasses
    ?.split(/\s+/)
    .filter(Boolean)
    .join(" ");
  const normalizedUserClassName = userClassName
    ?.split(/\s+/)
    .filter(Boolean)
    .join(" ");

  return cn(
    baseClassName,
    normalizedStyleClasses,
    systemClasses.filter(Boolean).join(" "),
    normalizedUserClassName,
  );
}
