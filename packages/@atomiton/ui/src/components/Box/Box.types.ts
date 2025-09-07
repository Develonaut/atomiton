import type { ComponentPropsWithoutRef, ElementType } from "react";
import type { StyleProps } from "@/utils/extractStyleProps";

export interface BoxOwnProps<T extends ElementType = "div"> extends StyleProps {
  as?: T;
}

export type BoxProps<T extends ElementType = "div"> = BoxOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof BoxOwnProps<T>>;
