import React from "react";
import { Button as ButtonPrimitive } from "@/primitives";
import { styled } from "@/system/styled";
import { buttonStyles } from "./Button.styles";
import resolveButtonProps from "./Button.resolver";
import type { ButtonProps } from "./Button.types";

const ButtonRoot = styled(ButtonPrimitive, {
  name: "Button",
  props: resolveButtonProps,
  styles: buttonStyles,
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
