/**
 * Button Props Resolver to convert Brainwave 2.0 Props to Atomoton UI Props.
 * TODO: Remove once we update all usages of Button to use Atomiton UI Props.
 */
export function resolveButtonProps<T extends Record<string, unknown>>(
  props: T,
): T {
  const anyProps = props as Record<string, unknown>;

  return {
    ...props,
    as: anyProps.as === "link" ? "a" : anyProps.as || "button",
    // Handle legacy Brainwave variant props
    variant: anyProps.isPrimary
      ? "primary"
      : anyProps.isSecondary
        ? "secondary"
        : anyProps.isOrange
          ? "destructive"
          : anyProps.variant || "primary",
    // Handle legacy size props
    size: anyProps.isSmall
      ? "sm"
      : anyProps.isLarge
        ? "lg"
        : anyProps.size || "md",
  };
}

export default resolveButtonProps;
