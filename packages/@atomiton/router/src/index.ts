/**
 * @atomiton/router - Domain-agnostic router with auto-generated navigation
 */

export { createRouter } from "./createRouter";
export { Link } from "./components/Link";
export { createNavigationStore } from "./navigation/store";
export {
  buildPath,
  extractParams,
  validateParams,
  normalizePath,
  joinPaths,
} from "./utils/path";

export type {
  RouteConfig,
  RouterInstance,
  NavigationOptions,
  LinkProps,
  CreateRouterOptions,
  NavigationMethods,
  NavigationMethod,
  RouteParams,
  OptionalParams,
  ExtractParams,
  RouteComponent,
} from "./types";

export type { NavigationStore } from "./navigation/store";
