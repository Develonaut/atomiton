import { Children, Fragment } from "react";
import Box from "../Box";
import type { FlexProps } from "./Flex.types";

function Flex({
  direction = "row",
  gap,
  align,
  justify,
  wrap = false,
  divider,
  children,
  ...boxProps
}: FlexProps) {
  const childArray = Children.toArray(children).filter(Boolean);

  return (
    <Box
      display="flex"
      flexDirection={direction}
      gap={gap}
      alignItems={align}
      justifyContent={justify}
      flexWrap={wrap ? "wrap" : "nowrap"}
      {...boxProps}
    >
      {divider
        ? childArray.map((child, index) => (
            <Fragment key={index}>
              {child}
              {index < childArray.length - 1 && divider}
            </Fragment>
          ))
        : children}
    </Box>
  );
}

export default Flex;
