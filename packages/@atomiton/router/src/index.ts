/**
 * @atomiton/router - Domain-agnostic router with auto-generated navigation
 */

export { Link } from "./components/Link";
export { createRouter } from "./createRouter";
export {
  buildPath,
  extractParams,
  joinPaths,
  normalizePath,
  validateParams,
} from "./utils/path";

export type {
  CreateRouterOptions,
  ExtractParams,
  LinkProps,
  NavigationMethod,
  NavigationMethods,
  NavigationOptions,
  OptionalParams,
  RouteComponent,
  RouteConfig,
  RouteParams,
  RouterInstance,
} from "./types";
