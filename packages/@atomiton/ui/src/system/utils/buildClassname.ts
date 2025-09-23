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

  return cn(
    baseClassName,
    styleClasses,
    systemClasses.join(" "),
    userClassName,
  );
}
