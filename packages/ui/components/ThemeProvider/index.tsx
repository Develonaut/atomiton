"use client";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { theme } from "@atomiton/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
