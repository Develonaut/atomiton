import { Link as TanStackLink } from "@tanstack/react-router";
import React from "react";
import type { LinkProps } from "../types";

export function Link({
  to,
  children,
  className,
  activeClassName,
  onClick,
  replace = false,
  state,
  search,
  hash,
}: LinkProps) {
  return (
    <TanStackLink
      to={to}
      className={className}
      activeProps={{ className: activeClassName }}
      onClick={onClick}
      replace={replace}
      state={state as undefined}
      search={search}
      hash={hash}
    >
      {children}
    </TanStackLink>
  );
}
