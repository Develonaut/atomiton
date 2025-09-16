/**
 * Domain: Router Provider
 *
 * Purpose: Creates the RouterProvider component wrapper
 *
 * Responsibilities:
 * - RouterProvider component creation
 * - TanStack router integration
 * - Provider configuration
 */

import {
  RouterProvider as TanStackRouterProvider,
  type AnyRouter,
} from "@tanstack/react-router";
import React from "react";

/**
 * Creates the RouterProvider component
 */
export const createRouterProvider = (router: AnyRouter) => {
  const RouterProvider = () => {
    return <TanStackRouterProvider router={router} />;
  };
  RouterProvider.displayName = "RouterProvider";
  return RouterProvider;
};
