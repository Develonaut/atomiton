import type { ButtonProps } from "#components/Button/Button.types";

/**
 * Button Props Resolver to convert Brainwave 2.0 Props to Atomoton UI Props.
 * TODO: Remove once we update all usages of Button to use Atomiton UI Props.
 */
function resolveButtonProps<T extends Record<string, unknown>>(props: T): T {
  const anyProps = props as Record<string, unknown>;

  // Start with all props, we'll remove legacy ones
  const result: ButtonProps = {
    ...props,
    as: anyProps.as === "link" ? "a" : anyProps.as || "button",
  };

  // Map legacy variant props to shadcn variants
  if (anyProps.isPrimary) {
    result.variant = "default";
    delete (result as Record<string, unknown>).isPrimary;
  } else if (anyProps.isSecondary) {
    result.variant = "secondary";
    delete (result as Record<string, unknown>).isSecondary;
  } else if (anyProps.isOrange) {
    result.variant = "destructive";
    delete (result as Record<string, unknown>).isOrange;
  } else if (anyProps.variant) {
    result.variant = anyProps.variant as ButtonProps["variant"];
  }

  // Map legacy size props
  if (anyProps.isSmall) {
    result.size = "sm";
    delete (result as Record<string, unknown>).isSmall;
  } else if (anyProps.isLarge) {
    result.size = "lg";
    delete (result as Record<string, unknown>).isLarge;
  } else if (anyProps.size) {
    result.size = anyProps.size as ButtonProps["size"];
  }

  return result as T;
}

export default resolveButtonProps;
