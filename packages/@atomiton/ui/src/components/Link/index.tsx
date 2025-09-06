import React from "react";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

export interface LinkProps extends Omit<RouterLinkProps, "to"> {
  href?: string;
  to?: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, to, children, ...props }) => {
  const destination = href || to || "#";

  return (
    <RouterLink to={destination} {...props}>
      {children}
    </RouterLink>
  );
};

export default Link;
