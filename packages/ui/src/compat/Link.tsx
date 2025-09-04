import React from "react";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

interface LinkProps extends Omit<RouterLinkProps, "to"> {
  href: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, children, ...rest }) => {
  return (
    <RouterLink to={href} {...rest}>
      {children}
    </RouterLink>
  );
};

export default Link;
