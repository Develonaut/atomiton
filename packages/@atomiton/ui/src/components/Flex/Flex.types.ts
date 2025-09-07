import type { StyleProps } from "@/utils/extractStyleProps";
import type { HTMLAttributes } from "react";

export interface FlexProps
  extends StyleProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof StyleProps> {
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  gap?: string | number;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean | "wrap" | "nowrap" | "wrap-reverse";
  divider?: React.ReactNode;
}
