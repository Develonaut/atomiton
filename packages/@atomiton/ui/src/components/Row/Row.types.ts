import type { FlexProps } from "#components/Flex/Flex.types";

export type RowProps = {
  direction?: never; // Prevent direction prop from being used
} & Omit<FlexProps, "direction">;
