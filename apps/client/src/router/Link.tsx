// Link component for Vite/React Router compatibility
// Provides the same API as Next.js Link component

import React from "react";
import type { LinkProps as RouterLinkProps } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

interface LinkProps extends Omit<RouterLinkProps, "to"> {
  href: string;
  children: React.ReactNode;
}

function Link({ href, children, ...props }: LinkProps) {
  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
}

export default Link;
