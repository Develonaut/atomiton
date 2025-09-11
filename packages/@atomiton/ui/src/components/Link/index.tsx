import type { PropsWithChildren } from "react";
import type { LinkProps as RouterLinkProps } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

export type LinkProps = {
  href?: string;
  to?: string;
} & Omit<RouterLinkProps, "to">;

function Link({ href, to, children, ...props }: PropsWithChildren<LinkProps>) {
  const destination = href || to || "#";

  return (
    <RouterLink to={destination} {...props}>
      {children}
    </RouterLink>
  );
}

export default Link;
