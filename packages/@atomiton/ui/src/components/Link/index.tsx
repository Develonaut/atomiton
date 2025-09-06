import type { PropsWithChildren } from "react";
import type { LinkProps as RouterLinkProps } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

export interface LinkProps extends Omit<RouterLinkProps, "to"> {
  href?: string;
  to?: string;
}

function Link({ href, to, children, ...props }: PropsWithChildren<LinkProps>) {
  const destination = href || to || "#";

  return (
    <RouterLink to={destination} {...props}>
      {children}
    </RouterLink>
  );
}

export default Link;
