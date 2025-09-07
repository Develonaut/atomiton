import type { BoxProps } from "./Box.types";
import { extractStyleProps } from "@/utils/extractStyleProps";
import { cn } from "@/utils/cn";

function resolveBoxProps<T extends React.ElementType = "div">(
  props: BoxProps<T>,
) {
  const { as, className, ...otherProps } = props;
  const { styleClasses, restProps } = extractStyleProps(otherProps);

  return {
    ...restProps,
    as,
    className: cn(styleClasses, className),
  };
}

export default resolveBoxProps;
