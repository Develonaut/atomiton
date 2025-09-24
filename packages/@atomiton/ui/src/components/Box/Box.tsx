import type { BoxProps } from "#components/Box/Box.types";
import { Box as BoxPrimitive } from "#primitives";
import { styled } from "#system/styled";
import { type ElementType, forwardRef } from "react";

const BoxRoot = styled(BoxPrimitive, { name: "Box" })();

const Box = forwardRef<HTMLDivElement, BoxProps>(function Box<
  T extends ElementType = "div",
>(props: BoxProps<T>, ref: React.Ref<HTMLDivElement>) {
  const { as: Component = "div", ...restProps } = props;

  return <BoxRoot as={Component} ref={ref} {...restProps} />;
});

export default Box;
