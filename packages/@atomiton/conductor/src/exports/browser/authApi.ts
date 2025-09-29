/**
 * Authentication API for browser conductor
 */

import type { ConductorTransport } from "#types";
import { getBridge } from "#exports/browser/transport.js";
import type {
  AuthCredentials,
  AuthResult,
  UserInfo,
} from "#exports/browser/types.js";

/**
 * Create authentication API for login/logout/token management
 */
export function createAuthAPI(transport: ConductorTransport | undefined) {
  return {
    async login(credentials: AuthCredentials): Promise<AuthResult> {
      if (!credentials.username || !credentials.password) {
        throw new Error("Invalid credentials");
      }

      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          const response = await bridge.call<AuthResult>(
            "auth",
            "login",
            credentials,
          );
          const result = response.result || response;

          if (
            result.token &&
            typeof window !== "undefined" &&
            window?.localStorage
          ) {
            window.localStorage.setItem("auth_token", result.token);
          }

          return result;
        }
      }

      throw new Error("No transport available for authentication");
    },

    async logout(): Promise<void> {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          const token =
            typeof window !== "undefined" && window?.localStorage
              ? window.localStorage.getItem("auth_token")
              : null;
          await bridge.call("auth", "logout", { token });
        }
      }

      if (typeof window !== "undefined" && window?.localStorage) {
        window.localStorage.removeItem("auth_token");
      }
      if (typeof window !== "undefined" && window?.sessionStorage) {
        window.sessionStorage.clear();
      }
    },

    async getCurrentUser(): Promise<UserInfo | null> {
      const token =
        typeof window !== "undefined" && window?.localStorage
          ? window.localStorage.getItem("auth_token")
          : null;
      if (!token) return null;

      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          const response = await bridge.call<UserInfo>(
            "auth",
            "getCurrentUser",
          );
          return response.result || null;
        }
      }

      return null;
    },

    async refreshToken(): Promise<AuthResult> {
      const token =
        typeof window !== "undefined" && window?.localStorage
          ? window.localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("No token to refresh");
      }

      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          const response = await bridge.call<AuthResult>(
            "auth",
            "refreshToken",
            { token },
          );
          const result = response.result || response;

          // Update stored token
          if (
            result.token &&
            typeof window !== "undefined" &&
            window?.localStorage
          ) {
            window.localStorage.setItem("auth_token", result.token);
          }

          return result;
        }
      }

      throw new Error("No transport available for authentication");
    },
  };
}
