import type { ComponentType } from "react";
import type { NotFoundRouteComponent } from "@tanstack/react-router";

export type RouteComponent =
  | ComponentType
  | (() => Promise<{ default: ComponentType }>);

export type RouteConfig = {
  name: string;
  path: string;
  component: RouteComponent;
  errorComponent?: ComponentType;
  pendingComponent?: ComponentType;
  children?: RouteConfig[];
};

export type CreateRouterOptions = {
  routes: RouteConfig[];
  basePath?: string;
  defaultPendingComponent?: ComponentType;
  defaultErrorComponent?: ComponentType;
  defaultNotFoundComponent?: NotFoundRouteComponent;
  enableDevtools?: boolean;
};
