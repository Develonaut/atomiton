import type { FlexProps } from "../Flex/Flex.types";

export interface RowProps extends Omit<FlexProps, "direction"> {
  direction?: never; // Prevent direction prop from being used
}
