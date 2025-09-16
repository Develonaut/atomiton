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
      // Use custom navigator if provided - last arg can be options
      (navigationMethods as Record<string, (...args: unknown[]) => void>)[
        methodName
      ] = (...args: unknown[]) => {
        // Check if last argument is navigation options
        const lastArg = args[args.length - 1];
        let options: NavigationOptions | undefined;
        let navigatorArgs = args;

        if (lastArg && typeof lastArg === "object" && !Array.isArray(lastArg)) {
          // Check if it looks like NavigationOptions
          const possibleOptions = lastArg as Record<string, unknown>;
          if (
            "state" in possibleOptions ||
            "replace" in possibleOptions ||
            "search" in possibleOptions ||
            "hash" in possibleOptions
          ) {
            options = possibleOptions as NavigationOptions;
            navigatorArgs = args.slice(0, -1);
          }
        }

        const path = route.navigator!(...navigatorArgs);
        navigate(path, options);
      };
    } else {
      // Auto-generate navigator based on path params
      const { required, optional } = extractParams(route.path);

      if (required.length === 0 && optional.length === 0) {
        // No params - accept optional navigation options
        (
          navigationMethods as Record<
            string,
            (options?: NavigationOptions) => void
          >
        )[methodName] = (options?: NavigationOptions) => {
          navigate(route.path, options);
        };
      } else {
        // Has params - accept params and optional navigation options
        (
          navigationMethods as Record<
            string,
            (
              params: Record<string, unknown>,
              options?: NavigationOptions,
            ) => void
          >
        )[methodName] = (
          params: Record<string, unknown>,
          options?: NavigationOptions,
        ) => {
          const path = buildPath(
            route.path,
            params as Record<string, string | number | boolean>,
          );
          navigate(path, options);
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
