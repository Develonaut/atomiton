/**
 * Domain: Navigation Method Generation
 *
 * Purpose: Generates typed navigation methods from route configurations
 *
 * Responsibilities:
 * - Auto-generating navigation methods for each route
 * - Parameter extraction and validation
 * - Custom navigator support
 * - Base navigation method creation (to, back, forward, replace)
 */

import { capitalize } from "@atomiton/utils";
import type {
  NavigationMethods,
  NavigationOptions,
  RouteConfig,
} from "../types";
import { buildPath, extractParams } from "../utils/path";

/**
 * Generates navigation methods for all routes
 */
export const generateNavigationMethods = <
  TRoutes extends readonly RouteConfig[],
>(
  routes: TRoutes,
  navigate: (path: string, options?: NavigationOptions) => void,
): NavigationMethods<TRoutes> => {
  const navigationMethods = {} as NavigationMethods<TRoutes>;

  routes.forEach((route) => {
    const methodName =
      `to${capitalize(route.name)}` as keyof NavigationMethods<TRoutes>;

    if (route.navigator) {
      // Use custom navigator if provided
      (navigationMethods as Record<string, (...args: unknown[]) => void>)[
        methodName
      ] = (...args: unknown[]) => {
        const path = route.navigator!(...args);
        navigate(path);
      };
    } else {
      // Auto-generate navigator based on path params
      const { required, optional } = extractParams(route.path);

      if (required.length === 0 && optional.length === 0) {
        // No params
        (navigationMethods as Record<string, () => void>)[methodName] = () => {
          navigate(route.path);
        };
      } else {
        // Has params
        (
          navigationMethods as Record<
            string,
            (params: Record<string, unknown>) => void
          >
        )[methodName] = (params: Record<string, unknown>) => {
          const path = buildPath(
            route.path,
            params as Record<string, string | number | boolean>,
          );
          navigate(path);
        };
      }
    }
  });

  return navigationMethods;
};

/**
 * Creates the complete navigate object with generated methods and base methods
 */
export const createNavigateObject = <TRoutes extends readonly RouteConfig[]>(
  routes: TRoutes,
  navigationMethods: NavigationMethods<TRoutes>,
  navigateBase: (path: string, options?: NavigationOptions) => void,
  back: () => void,
  forward: () => void,
  replace: (path: string, options?: NavigationOptions) => void,
) => {
  return {
    ...navigationMethods,
    to: navigateBase,
    back,
    forward,
    replace,
  };
};
