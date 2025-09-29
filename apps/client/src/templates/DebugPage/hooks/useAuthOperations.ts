import { useState, useCallback } from "react";
import conductor from "#lib/conductor";
type UserInfo = {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
};

export function useAuthOperations(addLog: (message: string) => void) {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [authToken, setAuthToken] = useState<string>("");

  const login = useCallback(async () => {
    try {
      addLog("Logging in...");
      const result = await conductor.auth.login({
        username: "testuser",
        password: "testpass",
      });
      if (result.token) {
        setAuthToken(result.token);
        setCurrentUser(result.user || null);
        addLog(`Login successful. Token: ${result.token.substring(0, 20)}...`);
      } else {
        addLog("Login failed: No token received");
      }
    } catch (error) {
      addLog(`Login error: ${error}`);
      console.error("Login error:", error);
    }
  }, [addLog]);

  const logout = useCallback(async () => {
    try {
      addLog("Logging out...");
      await conductor.auth.logout();
      setAuthToken("");
      setCurrentUser(null);
      addLog("Logout successful");
    } catch (error) {
      addLog(`Logout error: ${error}`);
      console.error("Logout error:", error);
    }
  }, [addLog]);

  const getCurrentUserInfo = useCallback(async () => {
    try {
      addLog("Getting current user...");
      const user = await conductor.auth.getCurrentUser();
      setCurrentUser(user);
      addLog(`Current user: ${user ? user.username : "Not logged in"}`);
    } catch (error) {
      addLog(`Get user error: ${error}`);
      console.error("Get user error:", error);
    }
  }, [addLog]);

  const refreshAuthToken = useCallback(async () => {
    try {
      addLog("Refreshing token...");
      const result = await conductor.auth.refreshToken();
      if (result.token) {
        setAuthToken(result.token);
        addLog(`Token refreshed: ${result.token.substring(0, 20)}...`);
      } else {
        addLog("Token refresh failed: No token received");
      }
    } catch (error) {
      addLog(`Token refresh error: ${error}`);
      console.error("Token refresh error:", error);
    }
  }, [addLog]);

  return {
    currentUser,
    authToken,
    login,
    logout,
    getCurrentUserInfo,
    refreshAuthToken,
  };
}
