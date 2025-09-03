import React from "react";
import {
  Card as MantineCard,
  CardProps as MantineCardProps,
} from "@mantine/core";
import { brainwaveTheme } from "@atomiton/theme";

interface CardProps extends MantineCardProps {
  children?: React.ReactNode;
}

export function Card({ children, ...mantineProps }: CardProps) {
  const theme = brainwaveTheme;

  return (
    <MantineCard
      radius={theme.radius!["2xl"]}
      styles={(theme) => ({
        root: {
          backgroundColor: theme.colors!.surface![0], // surface-01 from brainwave theme
          border: `1px solid ${theme.colors!.border![0]}`, // s-01 from brainwave theme
          boxShadow: theme.shadows!["depth-01"], // depth-01 shadow from brainwave theme
        },
      })}
      {...mantineProps}
    >
      {children}
    </MantineCard>
  );
}

// Card sections for composition pattern
Card.Section = MantineCard.Section;
