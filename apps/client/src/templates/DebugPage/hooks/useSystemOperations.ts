import { useCallback } from "react";
import conductor from "#lib/conductor";
import { createLogger } from "@atomiton/logger/browser";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";

const logger = createLogger({ scope: "SYSTEM_OPERATIONS" });

export function useSystemOperations() {
  const { addLog } = useDebugLogs();

  const checkHealth = useCallback(async () => {
    try {
      addLog("🏓 Sending health check ping...");
      const result = await conductor.system.health();

      if (result) {
        const statusEmoji = result.status === "ok" ? "✅" : "❌";
        addLog(`${statusEmoji} Health check pong received!`);

        if (result.message) {
          addLog(`Status: ${result.message}`);
        }

        // Log timestamp for debugging
        const responseTime = new Date(result.timestamp).toLocaleTimeString();
        addLog(`Response time: ${responseTime}`);
      } else {
        addLog("❌ No response from health check");
      }
    } catch (error) {
      addLog(`❌ Health check failed: ${error}`);
      addLog("IPC connection may be disconnected");
      logger.error("Health check error:", error);
    }
  }, [addLog]);

  const restartSystem = useCallback(async () => {
    try {
      addLog("Restarting system...");
      await conductor.system.restart();
      addLog("System restart initiated");
    } catch (error) {
      addLog(`Restart error: ${error}`);
      logger.error("Restart error:", error);
    }
  }, [addLog]);

  const testExecute = useCallback(async () => {
    try {
      addLog("Testing conductor.node.run...");
      const result = await conductor.node.run(
        createNodeDefinition({
          type: "transform",
          id: "test_execute",
          parameters: {
            code: "return { test: 'execute method works!' };",
          },
        }),
      );
      addLog(`Execute result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Execute error: ${error}`);
      logger.error("Execute error:", error);
    }
  }, [addLog]);

  const testHealthShortcut = useCallback(async () => {
    try {
      addLog("Testing conductor.system.health...");
      const result = await conductor.system.health();
      addLog(`Health result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Health error: ${error}`);
      logger.error("Health error:", error);
    }
  }, [addLog]);

  return {
    checkHealth,
    restartSystem,
    testExecute,
    testHealthShortcut,
  };
}
