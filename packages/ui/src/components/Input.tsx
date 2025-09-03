import React from "react";
import {
  TextInput,
  TextInputProps,
  Textarea,
  TextareaProps,
} from "@mantine/core";
import { brainwaveTheme } from "@atomiton/theme";

interface BaseInputProps {
  label?: string;
  error?: string;
  validated?: boolean;
}

interface InputProps
  extends BaseInputProps,
    Omit<TextInputProps, "label" | "error"> {
  multiline?: false;
}

interface TextareaInputProps
  extends BaseInputProps,
    Omit<TextareaProps, "label" | "error"> {
  multiline: true;
}

export function Input({
  label,
  error,
  validated = false,
  multiline = false,
  ...inputProps
}: InputProps | TextareaInputProps) {
  const theme = brainwaveTheme;

  const commonStyles = {
    input: {
      height: multiline ? undefined : "48px", // h-12 from original Field component
      padding: `0 ${theme.spacing!["5.5"]}`, // px-5.5 from brainwave theme
      border: `1.5px solid ${theme.colors!.border![0]}`, // s-01 from brainwave theme
      borderRadius: theme.radius!.lg, // 12px
      fontSize: theme.fontSizes!["body-lg"], // body-lg from brainwave theme
      color: theme.colors!.shade![6], // primary text color from brainwave theme
      transition: `border-color ${theme.other!.transitionDuration} ease`,
      "&:focus": {
        borderColor: theme.colors!.border![1], // s-02 from brainwave theme
      },
      "&::placeholder": {
        color: theme.colors!.shade![5], // secondary from brainwave theme
      },
    },
    label: {
      marginBottom: theme.spacing!.sm,
      fontSize: theme.fontSizes!.heading, // heading size from brainwave theme
      fontWeight: theme.other!.fontWeights!.heading,
      color: theme.colors!.shade![6], // primary from brainwave theme
    },
    error: {
      fontSize: theme.fontSizes!["body-sm"], // body-sm from brainwave theme
      marginTop: theme.spacing!.sm,
    },
  };

  const rightSection = validated ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        fill="currentColor"
      />
    </svg>
  ) : undefined;

  if (multiline) {
    return (
      <Textarea
        label={label}
        error={error}
        rightSection={rightSection}
        styles={commonStyles}
        minRows={3}
        {...(inputProps as TextareaProps)}
      />
    );
  }

  return (
    <TextInput
      label={label}
      error={error}
      rightSection={rightSection}
      styles={commonStyles}
      {...(inputProps as TextInputProps)}
    />
  );
}
