import conductor from "#lib/conductor";
import { createExecutionId } from "@atomiton/conductor/browser";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { nodeSmokeTests } from "@atomiton/test/fixtures/templates/node-smoke-tests";
import { createLogger } from "@atomiton/logger/browser";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { useCallback, useState } from "react";

const logger = createLogger({ scope: "NODE_SMOKE_TESTS" });

export function useNodeSmokeTests(selectedNodeType: string | null) {
  const { addLog, clearLogs } = useDebugLogs();
  const [isExecuting, setIsExecuting] = useState(false);

  const runSmokeTests = useCallback(async () => {
    if (!selectedNodeType) {
      addLog("⚠️ No node type selected");
      return;
    }

    const tests = nodeSmokeTests[selectedNodeType];
    if (!tests || tests.length === 0) {
      clearLogs();
      addLog(`⚠️ No smoke tests defined for ${selectedNodeType}`);
      return;
    }

    try {
      // Clear logs first for fresh slate
      clearLogs();

      addLog(
        `🧪 Running ${tests.length} smoke test${tests.length > 1 ? "s" : ""} for ${selectedNodeType}...`,
      );
      setIsExecuting(true);

      const results = [];

      for (const test of tests) {
        addLog(`\n▶ Running: ${test.name}`);

        const node = createNodeDefinition({
          type: selectedNodeType,
          id: `smoke_${test.name}_${Date.now()}`,
          parameters: test.config,
        });

        try {
          const executionId = createExecutionId(`smoke_${Date.now()}`);
          const result = await conductor.node.run(node, { executionId });

          // Check if execution was successful
          const success =
            result &&
            typeof result === "object" &&
            !("error" in result && result.error) &&
            !("success" in result && result.success === false);

          results.push({ name: test.name, success, result });

          if (success) {
            addLog(`✅ ${test.name}: PASS`, {
              testId: `smoke-test-${selectedNodeType}-${test.name.replace(/\s+/g, "-")}`,
              output: JSON.stringify(result),
              success: true,
            });
          } else {
            const errorMsg =
              result?.error?.message || result?.error || "Unknown error";
            addLog(`❌ ${test.name}: FAIL - ${errorMsg}`, {
              testId: `smoke-test-${selectedNodeType}-${test.name.replace(/\s+/g, "-")}`,
              output: JSON.stringify(result),
              success: false,
              error: errorMsg,
            });
          }
        } catch (error) {
          results.push({ name: test.name, success: false, error });
          addLog(`❌ ${test.name}: FAIL - ${error}`);
        }
      }

      // Summary
      const passed = results.filter((r) => r.success).length;
      const failed = results.length - passed;
      addLog(
        `\n📊 Results: ${passed}/${results.length} passed, ${failed} failed`,
      );

      return results;
    } catch (error) {
      addLog(`❌ Smoke test error: ${error}`);
      logger.error("Smoke test error:", error);
    } finally {
      setIsExecuting(false);
    }
  }, [selectedNodeType, addLog, clearLogs]);

  return {
    runSmokeTests,
    isExecuting,
  };
}
