import type { FlexProps } from "../Flex/Flex.types";

export type RowProps = {
  direction?: never; // Prevent direction prop from being used
} & Omit<FlexProps, "direction">;
