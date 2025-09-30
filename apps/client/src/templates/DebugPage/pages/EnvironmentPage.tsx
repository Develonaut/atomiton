import { useEnvironment } from "#templates/DebugPage/hooks/useEnvironment";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";

export default function EnvironmentPage() {
  const { addLog } = useDebugLogs();
  const environment = useEnvironment(addLog);

  return (
    <div>
      {environment && (
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <div className="space-y-2 text-sm">
            <div>
              <strong>Runtime:</strong>{" "}
              {environment.isElectron ? "Electron" : "Browser"}
            </div>
            <div>
              <strong>Conductor:</strong>{" "}
              {environment.conductorAvailable
                ? "✓ Available"
                : "✗ Not Available"}
            </div>
            <div>
              <strong>Environment:</strong> {environment.env}
            </div>
            <div>
              <strong>Platform:</strong> {environment.platform}
            </div>
            {environment.electronVersion && (
              <div>
                <strong>Electron:</strong> {environment.electronVersion}
              </div>
            )}
            {environment.nodeVersion && (
              <div>
                <strong>Node:</strong> {environment.nodeVersion}
              </div>
            )}
            <div>
              <strong>Available APIs:</strong>
              <ul className="ml-4 mt-1">
                {environment.apiMethods.map((method, idx) => (
                  <li key={idx}>• {method}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
