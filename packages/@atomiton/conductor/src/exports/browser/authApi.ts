/**
 * Authentication API for browser conductor
 */

import type { ConductorTransport } from "#types";
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

      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "auth",
          "login",
          credentials,
        );
        const result =
          (response.result as AuthResult) || (response as AuthResult);

        if (result.token && window?.localStorage) {
          window.localStorage.setItem("auth_token", result.token);
        }

        return result;
      }

      throw new Error("No transport available for authentication");
    },

    async logout(): Promise<void> {
      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const token = window?.localStorage
          ? window.localStorage.getItem("auth_token")
          : null;
        await window.atomiton?.__bridge__.call("auth", "logout", { token });
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

      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "auth",
          "getCurrentUser",
        );
        return (response.result as UserInfo) || null;
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

      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "auth",
          "refreshToken",
          { token },
        );
        const result =
          (response.result as AuthResult) || (response as AuthResult);

        // Update stored token
        if (result.token && window?.localStorage) {
          window.localStorage.setItem("auth_token", result.token);
        }

        return result;
      }

      throw new Error("No transport available for authentication");
    },
  };
}
