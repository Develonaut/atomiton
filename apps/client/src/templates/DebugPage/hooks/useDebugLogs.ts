import { useDebugStore } from "#templates/DebugPage/store";

/**
 * Hook to access debug logs functionality
 * Provides access to logs, adding logs, and clearing logs
 */
export function useDebugLogs() {
  const logs = useDebugStore((state) => state.logs);
  const addLog = useDebugStore((state) => state.addLog);
  const clearLogs = useDebugStore((state) => state.clearLogs);

  return {
    logs,
    addLog,
    clearLogs,
  };
}
