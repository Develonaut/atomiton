import type { RouteConfig } from "#types";
import {
  createRootRoute,
  createRoute,
  lazyRouteComponent,
  Outlet,
  type ErrorRouteComponent,
  type NotFoundRouteComponent,
  type RouteComponent,
  type AnyRoute,
} from "@tanstack/react-router";
import React, { type ComponentType } from "react";

export function createRootRouteInstance(
  errorComponent?: ComponentType,
  notFoundComponent?: NotFoundRouteComponent,
) {
  return createRootRoute({
    component: () => React.createElement(Outlet),
    errorComponent: errorComponent as ErrorRouteComponent | undefined,
    notFoundComponent: notFoundComponent,
  });
}

export function createTanStackRoutes(
  routes: RouteConfig[],
  rootRoute: ReturnType<typeof createRootRouteInstance>,
  _defaultPendingComponent?: ComponentType,
) {
  return routes.map((routeConfig) => {
    // Create the route
    const route = createRouteFromConfig(routeConfig, rootRoute);

    // If this route has children, create them and attach
    if (routeConfig.children && routeConfig.children.length > 0) {
      const childRoutes = createChildRoutes(routeConfig.children, route);
      return route.addChildren(childRoutes);
    }

    return route;
  });
}

function createRouteFromConfig(
  routeConfig: RouteConfig,
  parentRoute: AnyRoute,
): ReturnType<typeof createRoute> {
  // Check if it's a function that could be a lazy loader
  if (typeof routeConfig.component === "function") {
    const fnString = routeConfig.component.toString();
    const isLazyLoader =
      fnString.includes("import(") ||
      fnString.includes('import("') ||
      fnString.includes("__vite_ssr_dynamic_import__");

    if (isLazyLoader) {
      return createRoute({
        getParentRoute: () => parentRoute,
        path: routeConfig.path,
        component: lazyRouteComponent(
          routeConfig.component as () => Promise<{ default: ComponentType }>,
        ),
      });
    }
  }

  // Direct component
  return createRoute({
    getParentRoute: () => parentRoute,
    path: routeConfig.path,
    component: routeConfig.component as RouteComponent,
  });
}

function createChildRoutes(
  children: RouteConfig[],
  parentRoute: AnyRoute,
): AnyRoute[] {
  return children.map((childConfig) => {
    const childRoute = createRouteFromConfig(childConfig, parentRoute);

    // Recursively handle nested children
    if (childConfig.children && childConfig.children.length > 0) {
      const grandchildRoutes = createChildRoutes(
        childConfig.children,
        childRoute,
      );
      return childRoute.addChildren(grandchildRoutes);
    }

    return childRoute;
  });
}
