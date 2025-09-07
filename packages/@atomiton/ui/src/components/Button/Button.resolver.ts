/**
 * Button Props Resolver to convert Brainwave 2.0 Props to Atomoton UI Props.
 * TODO: Remove once we update all usages of Button to use Atomiton UI Props.
 */
export function resolveButtonProps<T extends Record<string, unknown>>(
  props: T,
): T {
  const anyProps = props as Record<string, unknown>;

  const result = {
    ...props,
    as: anyProps.as === "link" ? "a" : anyProps.as || "button",
  } as T;

  // Map legacy variant props to shadcn variants
  if (anyProps.isPrimary) {
    result.variant = "default";
  } else if (anyProps.isSecondary) {
    result.variant = "secondary";
  } else if (anyProps.isOrange) {
    result.variant = "destructive";
  } else if (anyProps.variant) {
    result.variant = anyProps.variant;
  }

  // Map legacy size props
  if (anyProps.isSmall) {
    result.size = "sm";
  } else if (anyProps.isLarge) {
    result.size = "lg";
  } else if (anyProps.size) {
    result.size = anyProps.size;
  }

  return result as T;
}

export default resolveButtonProps;
