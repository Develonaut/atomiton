import type { HTMLAttributes } from "react";

export type EditorRootProps = {
  children: React.ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;
