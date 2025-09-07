import type { HTMLAttributes } from "react";

export interface EditorRootProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
