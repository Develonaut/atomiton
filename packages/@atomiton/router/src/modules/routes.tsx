/**
 * Domain: Route Creation and Configuration
 *
 * Purpose: Handles TanStack route creation from config objects
 *
 * Responsibilities:
 * - Converting route configs to TanStack routes
 * - Path format conversion ($ params to TanStack format)
 * - Lazy component loading with proper error handling
 * - Route tree building and management
 */

import {
  createRootRoute,
  createRoute,
  createRouter as createTanStackRouter,
  Outlet,
  type Router,
} from "@tanstack/react-router";
import React from "react";
import type { RouteConfig, RouteComponent } from "../types";

/**
 * Creates the root route component that renders an Outlet
 */
export const createRootRouteInstance = () => {
  return createRootRoute({
    component: () => <Outlet />,
  });
};

/**
 * Converts a single route config to a TanStack route
 */
export const createRouteFromConfig = (
  routeConfig: RouteConfig,
  rootRoute: ReturnType<typeof createRootRouteInstance>,
  defaultPendingComponent?: React.ComponentType,
  defaultErrorComponent?: React.ComponentType,
) => {
  const { path, component, errorComponent, pendingComponent } = routeConfig;

  // Convert our path format to TanStack format
  const tanStackPath = path
    .replace(/\$([^/?]+)\?/g, "$$$1") // Optional params
    .replace(/\$([^/?]+)/g, "$$$1"); // Required params

  // Create the lazy component outside to avoid recreating on each render
  const LazyComponent = React.lazy(() => {
    const result = component();

    // If it's already a Promise, handle it
    if (result && typeof result === "object" && "then" in result) {
      return result.then(
        (module: { default: RouteComponent } | RouteComponent) =>
          typeof module === "object" && "default" in module
            ? module
            : { default: module },
      );
    }

    // If it's a direct component, wrap it in a resolved Promise
    return Promise.resolve({
      default: result as React.ComponentType,
    });
  });

  // Create a wrapper component
  const RouteComponent = () => {
    const FallbackComponent = pendingComponent || defaultPendingComponent;
    return (
      <React.Suspense
        fallback={
          FallbackComponent ? <FallbackComponent /> : <div>Loading...</div>
        }
      >
        <LazyComponent />
      </React.Suspense>
    );
  };

  return createRoute({
    getParentRoute: () => rootRoute,
    path: tanStackPath,
    component: RouteComponent,
    errorComponent: (errorComponent || defaultErrorComponent) as undefined,
  });
};

/**
 * Creates all TanStack routes from config array
 */
export const createRoutesFromConfig = (
  routes: readonly RouteConfig[],
  defaultPendingComponent?: React.ComponentType,
  defaultErrorComponent?: React.ComponentType,
) => {
  const rootRoute = createRootRouteInstance();

  const tanStackRoutes = routes.map((routeConfig) =>
    createRouteFromConfig(
      routeConfig,
      rootRoute,
      defaultPendingComponent,
      defaultErrorComponent,
    ),
  );

  return {
    rootRoute,
    tanStackRoutes,
    routeTree: rootRoute.addChildren(tanStackRoutes),
  };
};

/**
 * Creates the TanStack router instance
 */
export const createTanStackRouterInstance = (
  routeTree: ReturnType<typeof createRoutesFromConfig>["routeTree"],
  defaultErrorComponent?: React.ComponentType,
  defaultPendingComponent?: React.ComponentType,
): Router<any, any> => {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: defaultErrorComponent as undefined,
    defaultPendingComponent: defaultPendingComponent as undefined,
  });
};
