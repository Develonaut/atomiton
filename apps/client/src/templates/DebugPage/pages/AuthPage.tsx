import { useAuthOperations } from "#templates/DebugPage/hooks/useAuthOperations";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { Button } from "@atomiton/ui";

export default function AuthPage() {
  const { addLog } = useDebugLogs();
  const {
    currentUser,
    authToken,
    login,
    logout,
    getCurrentUserInfo,
    refreshAuthToken,
  } = useAuthOperations(addLog);

  return (
    <div className="bg-white rounded-lg p-6 shadow mb-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={login}>Login</Button>
          <Button onClick={logout}>Logout</Button>
          <Button onClick={getCurrentUserInfo}>Get Current User</Button>
          <Button onClick={refreshAuthToken}>Refresh Token</Button>
        </div>

        {currentUser && (
          <div className="bg-gray-100 p-3 rounded">
            <p>
              <strong>User:</strong> {currentUser.username}
            </p>
            {currentUser.email && (
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
            )}
            {currentUser.roles && (
              <p>
                <strong>Roles:</strong> {currentUser.roles.join(", ")}
              </p>
            )}
          </div>
        )}

        {authToken && (
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-xs font-mono break-all">
              <strong>Token:</strong> {authToken.substring(0, 50)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
