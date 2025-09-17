import {
  createRootRoute,
  createRoute,
  lazyRouteComponent,
  Outlet,
  type ErrorRouteComponent,
  type RouteComponent,
  type NotFoundRouteComponent,
} from "@tanstack/react-router";
import React, { type ComponentType } from "react";
import type { RouteConfig } from "./types";

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
    // Check if it's a function that could be a lazy loader
    // We check the function's toString() to see if it contains 'import(' or Vite's transformed version
    // This avoids calling the function and loading the module immediately
    if (typeof routeConfig.component === "function") {
      const fnString = routeConfig.component.toString();
      const isLazyLoader =
        fnString.includes("import(") ||
        fnString.includes('import("') ||
        fnString.includes("__vite_ssr_dynamic_import__");

      if (isLazyLoader) {
        return createRoute({
          getParentRoute: () => rootRoute,
          path: routeConfig.path,
          component: lazyRouteComponent(
            routeConfig.component as () => Promise<{ default: ComponentType }>,
          ),
        });
      }
    }

    // Direct component
    return createRoute({
      getParentRoute: () => rootRoute,
      path: routeConfig.path,
      component: routeConfig.component as RouteComponent,
    });
  });
}
