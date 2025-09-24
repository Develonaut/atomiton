import Box from "#components/Box";
import type { FlexProps } from "#components/Flex/Flex.types";
import { Children, Fragment } from "react";

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
