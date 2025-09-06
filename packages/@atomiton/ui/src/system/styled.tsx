import type { ComponentType, ElementType } from "react";
import { forwardRef } from "react";
import { extractSystemProps } from "./utils/extractSystemProps";
import { generateDataAttributes } from "./utils/generateDataAttributes";
import { filterDOMProps } from "./utils/filterDOMProps";
import { buildClassName } from "./utils/buildClassname";
import { calculateStyleProps } from "./utils/calculateStyleProps";

/**
 * The "styled" pattern - inspired by Chakra UI but for shadcn components
 *
 * Creates a component that:
 * 1. Accepts system props (m, p, bg, etc.)
 * 2. Applies transformations
 * 3. Merges everything cleanly
 *
 * @example
 * ```tsx
 * // Define once
 * const StyledButton = styled(ButtonPrimitive, {
 *   name: "button",
 *   props: resolveButtonProps,
 *   styles: buttonStyles
 * });
 *
 * // Use everywhere - super clean!
 * <StyledButton
 *   m={4}
 *   p={2}
 *   variant="primary"
 *   size="lg"
 *   onClick={handleClick}
 * >
 *   Click me
 * </StyledButton>
 * ```
 */

export interface StyledConfig {
  name?: string;
  props?: (props: Record<string, unknown>) => Record<string, unknown>;
  styles?: (props: Record<string, unknown>) => string;
}

export function styled<T extends ComponentType<Record<string, unknown>>>(
  Component: T,
  config: StyledConfig = {},
) {
  const StyledComponent = forwardRef<HTMLElement, Record<string, unknown>>(
    (inProps, ref) => {
      const { name, props: propsTransform, styles } = config;

      // 1. Apply prop transformations
      const resolvedProps = propsTransform ? propsTransform(inProps) : inProps;

      // 2. Handle polymorphic "as" prop
      const { as: asProp, ...propsWithoutAs } = resolvedProps;
      const FinalComponent = (asProp || Component) as ElementType;
      const isHTMLElement = typeof FinalComponent === "string";

      // 3. Extract system props
      const { systemClasses, restProps } = extractSystemProps(propsWithoutAs);

      // 4. Build className
      const styleProps = calculateStyleProps(restProps);
      const styleClasses = styles ? styles(styleProps) : undefined;
      const className = buildClassName({
        name,
        styleClasses,
        systemClasses,
        userClassName: restProps.className as string | undefined,
      });

      // 5. Generate data attributes
      const dataAttributes = generateDataAttributes(restProps);

      // 6. Filter props for DOM elements
      const finalProps = filterDOMProps(restProps, isHTMLElement);

      // 7. Render component
      return (
        <FinalComponent
          ref={ref}
          {...finalProps}
          {...dataAttributes}
          className={className}
        />
      );
    },
  );

  StyledComponent.displayName =
    config.name || `Styled(${Component.displayName || Component.name})`;

  return StyledComponent;
}
