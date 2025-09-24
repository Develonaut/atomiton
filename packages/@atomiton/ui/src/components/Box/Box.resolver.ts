import type { BoxProps } from "#components/Box/Box.types";
import { cn } from "#utils/cn";
import { extractStyleProps } from "#utils/extractStyleProps";

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
