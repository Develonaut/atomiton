import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentType, ElementType } from "react";
import { forwardRef } from "react";

/**
 * Configuration for the styled function
 */
export interface StyledConfig<TProps = Record<string, unknown>> {
  /**
   * Component display name for debugging
   */
  name?: string;
  /**
   * Props resolver to transform props before passing to component
   */
  props?: (props: TProps) => TProps;
}

/**
 * Creates a styled component with CVA variants
 * Similar to Material-UI's styled API but using CVA for zero-runtime performance
 *
 * @example
 * ```tsx
 * // Simple case - single string
 * const Container = styled("div")("flex items-center gap-4 p-4");
 *
 * // Complex case - array for readability
 * const ButtonRoot = styled(ButtonPrimitive, {
 *   name: "Button",
 *   props: resolveButtonProps,
 * })([
 *   "relative",
 *   "inline-flex",
 *   "justify-center",
 *   "rounded-xl",
 * ], {
 *   variants: {
 *     variant: {
 *       primary: "bg-primary text-white hover:bg-primary-dark",
 *       secondary: ["bg-secondary", "text-black", "hover:bg-secondary-dark"],
 *     },
 *     size: {
 *       sm: "h-8 px-3 text-sm",
 *       md: "h-10 px-4 text-base",
 *     }
 *   },
 *   defaultVariants: {
 *     variant: "primary",
 *     size: "md",
 *   }
 * });
 *
 * // With just variants, no base classes
 * const Text = styled("span")("", {
 *   variants: {
 *     size: {
 *       sm: "text-sm",
 *       md: "text-base",
 *       lg: "text-lg",
 *     }
 *   }
 * });
 * ```
 */
export function styled<
  T extends ComponentType<Record<string, unknown>> | ElementType,
  TProps extends Record<string, unknown> = Record<string, unknown>,
>(Component: T, config: StyledConfig<TProps> = {}) {
  return function createStyledComponent<
    V extends Record<string, unknown> = Record<string, unknown>,
  >(baseClasses: string | string[], variantConfig?: V) {
    // Generate automatic class name from config.name
    const autoClassName = config.name
      ? `atomiton-${config.name
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .replace(/^-/, "")}`
      : null;

    // Combine auto class name with base classes
    const finalBaseClasses = autoClassName
      ? Array.isArray(baseClasses)
        ? [autoClassName, ...baseClasses]
        : baseClasses
          ? [autoClassName, baseClasses]
          : autoClassName
      : baseClasses;

    // Normalize baseClasses to always be a string or array
    // CVA accepts both, so we just pass it through
    const variants = cva(
      finalBaseClasses,
      variantConfig as Parameters<typeof cva>[1],
    );

    // Extract variant keys for prop filtering
    const variantKeys = new Set<string>(
      variantConfig?.variants ? Object.keys(variantConfig.variants) : [],
    );

    // Add defaultVariants keys too
    if (variantConfig?.defaultVariants) {
      Object.keys(variantConfig.defaultVariants).forEach((key) =>
        variantKeys.add(key),
      );
    }

    // Create the styled component
    const StyledComponent = forwardRef<
      HTMLElement,
      TProps &
        VariantProps<typeof variants> & { className?: string; as?: ElementType }
    >((inProps, ref) => {
      // Apply props resolver if provided (before extracting as prop)
      const resolvedProps = config.props
        ? config.props(inProps as TProps)
        : inProps;

      // Now extract the as prop and className from resolved props
      const { as: asProp, className, ...props } = resolvedProps;

      // Separate variant props from other props
      const variantProps: Record<string, unknown> = {};
      const restProps: Record<string, unknown> = {};

      Object.entries(props).forEach(([key, value]) => {
        if (variantKeys.has(key)) {
          variantProps[key] = value;
        } else {
          restProps[key] = value;
        }
      });

      // Generate the final className
      const finalClassName = cn(
        variants(variantProps as Parameters<typeof variants>[0]),
        className as string,
      );

      // Determine the component to render
      const FinalComponent = (asProp || Component) as React.ElementType;

      return (
        <FinalComponent ref={ref} className={finalClassName} {...restProps} />
      );
    });

    // Set display name for debugging
    if (config.name) {
      StyledComponent.displayName = config.name;
    }

    return StyledComponent;
  };
}

export default styled;
