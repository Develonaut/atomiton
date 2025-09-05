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

export interface StyledConfig<T> {
  name?: string;
  props?: (props: any) => any;
  styles?: (props: any) => string;
}

export function styled<T extends React.ComponentType<any>>(
  Component: T,
  config: StyledConfig<T> = {},
) {
  const StyledComponent = forwardRef<any, any>((inProps, ref) => {
    const { name, props: propsTransform, styles } = config;

    // 1. Apply prop transformations
    const resolvedProps = propsTransform ? propsTransform(inProps) : inProps;

    // 2. Handle polymorphic "as" prop
    const { as: asProp, ...propsWithoutAs } = resolvedProps;
    const FinalComponent = asProp || Component;
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
      userClassName: restProps.className,
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
  });

  StyledComponent.displayName =
    config.name || `Styled(${Component.displayName || Component.name})`;

  return StyledComponent;
}
