import type { ComponentPropsWithoutRef, ElementType } from "react";
import type { StyleProps } from "#utils/extractStyleProps";

export type BoxOwnProps<T extends ElementType = "div"> = {
  as?: T;
} & StyleProps;

export type BoxProps<T extends ElementType = "div"> = BoxOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof BoxOwnProps<T>>;
