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
  type AnyRouter,
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

// Cache for preloaded components
const componentCache = new Map<
  string,
  React.ComponentType | Promise<{ default: React.ComponentType }>
>();

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

  // Create a wrapper component that handles preloaded modules
  function RouteComponent() {
    const [LoadedComponent, setLoadedComponent] =
      React.useState<React.ComponentType | null>(() => {
        const cached = componentCache.get(path);
        // If we have a resolved component, use it immediately
        if (cached && typeof cached !== "object") {
          return cached as React.ComponentType;
        }
        return null;
      });

    React.useEffect(() => {
      if (!LoadedComponent) {
        const cached = componentCache.get(path);

        if (cached && typeof cached === "object" && "then" in cached) {
          // If we have a promise, wait for it
          cached.then((module) => {
            const Component = module.default;
            componentCache.set(path, Component);
            setLoadedComponent(() => Component);
          });
        } else if (!cached) {
          // If nothing cached, load it now
          const result = component();
          if (result && typeof result === "object" && "then" in result) {
            componentCache.set(path, result);
            result.then(
              (module: { default: RouteComponent } | RouteComponent) => {
                const Component =
                  typeof module === "object" && "default" in module
                    ? module.default
                    : (module as React.ComponentType);
                componentCache.set(path, Component);
                setLoadedComponent(() => Component);
              },
            );
          }
        }
      }
    }, [LoadedComponent]);

    const FallbackComponent = pendingComponent || defaultPendingComponent;

    if (LoadedComponent) {
      return <LoadedComponent />;
    }

    return FallbackComponent ? <FallbackComponent /> : <div>Loading...</div>;
  }

  return createRoute({
    getParentRoute: () => rootRoute,
    path: tanStackPath,
    component: RouteComponent,
    errorComponent: errorComponent || defaultErrorComponent,
    loader: async () => {
      // Preload the component
      try {
        const cached = componentCache.get(path);
        if (!cached) {
          const result = component();
          if (result && typeof result === "object" && "then" in result) {
            componentCache.set(path, result);
            await result;
          }
        }
      } catch {
        // Silently handle loading errors
      }
      return {};
    },
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
): AnyRouter => {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent,
    defaultPendingComponent,
  });
};
