import { ComponentPropsWithoutRef, ElementType, ReactElement } from "react";

/**
 * T-shirt sizes used consistently across all components
 */
export type Size = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

/**
 * Common variant types (maximum 3-5 variants per component)
 */
export type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

/**
 * Common status for components
 */
export type Status = "idle" | "loading" | "success" | "error" | "disabled";

/**
 * Polymorphic component props using Material UI's "as" prop pattern
 */
export type PolymorphicProps<E extends ElementType = ElementType> = {
  as?: E;
};

/**
 * Props for polymorphic components
 */
export type PolymorphicComponentProps<
  E extends ElementType,
  Props = {},
> = PolymorphicProps<E> &
  Props &
  Omit<ComponentPropsWithoutRef<E>, keyof (PolymorphicProps<E> & Props)>;

/**
 * Extract the ref type for a polymorphic component
 */
export type PolymorphicRef<E extends ElementType> =
  ComponentPropsWithoutRef<E>["ref"];

/**
 * Common props for components that can have icons
 */
export interface WithIcons {
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
}

/**
 * Common props for components that can be loading
 */
export interface WithLoading {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Common props for components that can be disabled
 */
export interface WithDisabled {
  disabled?: boolean;
}

/**
 * Data attribute props for component state
 */
export interface DataAttributes {
  "data-state"?:
    | "open"
    | "closed"
    | "active"
    | "inactive"
    | "loading"
    | "error";
  "data-selected"?: boolean;
  "data-disabled"?: boolean;
  "data-focused"?: boolean;
  "data-pressed"?: boolean;
  "data-hovered"?: boolean;
  "data-checked"?: boolean;
  "data-indeterminate"?: boolean;
}

/**
 * Props for compound components that share context
 */
export interface CompoundComponentContext<T = any> {
  value?: T;
  onChange?: (value: T) => void;
}

/**
 * Re-export StyleProps from extractStyleProps
 */
export type { StyleProps } from "../utils/extractStyleProps";
