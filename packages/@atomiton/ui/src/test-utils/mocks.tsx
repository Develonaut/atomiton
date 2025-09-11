import type { ComponentProps } from "react";
import { forwardRef } from "react";

/**
 * Mock Button component for testing
 */
export const MockButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button">
>((props, ref) => <button ref={ref} {...props} />);
MockButton.displayName = "MockButton";

/**
 * Mock Link component for testing
 */
export const MockLink = forwardRef<HTMLAnchorElement, ComponentProps<"a">>(
  (props, ref) => <a ref={ref} {...props} />,
);
MockLink.displayName = "MockLink";

/**
 * Mock Div component for testing
 */
export const MockDiv = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  (props, ref) => <div ref={ref} {...props} />,
);
MockDiv.displayName = "MockDiv";

/**
 * Mock Span component for testing
 */
export const MockSpan = forwardRef<HTMLSpanElement, ComponentProps<"span">>(
  (props, ref) => <span ref={ref} {...props} />,
);
MockSpan.displayName = "MockSpan";

/**
 * Mock component with custom props for testing
 */
export type MockComponentProps = {
  variant?: string;
  size?: string;
  testProp?: string;
} & ComponentProps<"div">;

export const MockComponent = forwardRef<HTMLDivElement, MockComponentProps>(
  ({ variant, size, testProp, ...props }, ref) => (
    <div
      ref={ref}
      data-variant={variant}
      data-size={size}
      data-test-prop={testProp}
      {...props}
    />
  ),
);
MockComponent.displayName = "MockComponent";

/**
 * Mock props resolver for testing
 */
export const mockPropsResolver = <T extends Record<string, unknown>>(
  props: T,
): T => {
  const { as, ...rest } = props as T & { as?: unknown };
  return {
    ...rest,
    // Convert "link" to "a" like the Button resolver does
    as: as === "link" ? "a" : as,
  } as unknown as T;
};

/**
 * Mock props resolver that transforms variant names
 */
export const mockVariantResolver = <T extends Record<string, unknown>>(
  props: T,
): T => {
  const { variant, ...rest } = props as T & { variant?: unknown };
  return {
    ...rest,
    // Transform variant names
    variant:
      variant === "primary"
        ? "transformed-primary"
        : variant === "secondary"
          ? "transformed-secondary"
          : variant,
  } as unknown as T;
};
