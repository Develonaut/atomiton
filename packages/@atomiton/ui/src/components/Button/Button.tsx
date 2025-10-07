import resolveButtonProps from "#components/Button/Button.resolver";
import {
  BUTTON_STYLES,
  buttonCompoundVariants,
  buttonLoading,
  buttonSizes,
  buttonVariants,
} from "#components/Button/Button.styles";
import type { ButtonProps } from "#components/Button/Button.types";
import { Button as ButtonPrimitive } from "#primitives";
import { styled } from "#system/styled";

const ButtonRoot = styled(ButtonPrimitive, {
  name: "Button",
  props: resolveButtonProps,
})(BUTTON_STYLES.base, {
  variants: {
    variant: buttonVariants,
    size: buttonSizes,
    loading: buttonLoading,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
  compoundVariants: buttonCompoundVariants,
});

function Button(props: ButtonProps) {
  return (
    <ButtonRoot {...props} disabled={props.disabled || props.loading}>
      <span className="relative z-2 flex items-center gap-2">
        {props.loading ? (
          <>
            <span className="opacity-0 contents">{props.children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </span>
          </>
        ) : (
          props.children
        )}
      </span>
    </ButtonRoot>
  );
}

export default Button;
