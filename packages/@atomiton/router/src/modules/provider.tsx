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
  type Router,
} from "@tanstack/react-router";
import React from "react";

/**
 * Creates the RouterProvider component
 */
export const createRouterProvider = (router: Router<any, any>) => {
  return () => {
    return <TanStackRouterProvider router={router} />;
  };
};
