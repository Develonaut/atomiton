import React from "react";
import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
} from "@mantine/core";
import { brainwaveTheme } from "@atomiton/theme";

interface ButtonProps extends MantineButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "default";
}

export function Button({
  children,
  variant = "default",
  ...mantineProps
}: ButtonProps) {
  const theme = brainwaveTheme;

  let mantineVariant: MantineButtonProps["variant"];
  let color: MantineButtonProps["color"];

  switch (variant) {
    case "primary":
      mantineVariant = "filled";
      color = "shade";
      break;
    case "secondary":
      mantineVariant = "outline";
      color = "shade";
      break;
    case "danger":
      mantineVariant = "filled";
      color = "red";
      break;
    default:
      mantineVariant = "default";
      color = "shade";
      break;
  }

  return (
    <MantineButton
      variant={mantineVariant}
      color={color}
      radius={theme.radius!.xl}
      h={40}
      px={theme.spacing!.lg}
      styles={(theme) => ({
        root: {
          fontSize: theme.fontSizes!["heading-str"],
          fontWeight: theme.other!.fontWeights!["heading-str"],
          letterSpacing: theme.other!.letterSpacings!["heading-str"],
          "&:hover": {
            transform: "none", // Disable default Mantine transform
          },
        },
      })}
      {...mantineProps}
    >
      {children}
    </MantineButton>
  );
}
