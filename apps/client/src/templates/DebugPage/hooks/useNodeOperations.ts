import conductor from "#lib/conductor";
import {
  createNodeDefinition,
  getNodeDefinition,
  type NodeDefinition,
} from "@atomiton/nodes/definitions";
import {
  getNodeSchemaTypes,
  registerAllNodeSchemas,
} from "@atomiton/nodes/schemas";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useNodeOperations(addLog: (message: string) => void) {
  const [nodeContent, setNodeContent] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(
    null,
  );

  // Dynamic node selection state
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [nodeFieldValues, setNodeFieldValues] = useState<
    Record<string, unknown>
  >({});

  const validateNode = useCallback(async () => {
    try {
      addLog("Validating node...");
      const nodeData = JSON.parse(nodeContent) as NodeDefinition;
      const result = await conductor.node.validate(nodeData);
      addLog(`Validation result: ${result.valid ? "Valid" : "Invalid"}`);
      if (!result.valid) {
        addLog(`Validation errors: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      addLog(`Validation error: ${error}`);
      console.error("Validation error:", error);
    }
  }, [nodeContent, addLog]);

  const executeNode = useCallback(async () => {
    try {
      addLog("Executing node...");
      setIsExecuting(true);
      const nodeData = JSON.parse(nodeContent) as NodeDefinition;
      const executionId = `exec_${Date.now()}`;
      setCurrentExecutionId(executionId);

      const result = await conductor.node.run(nodeData, { executionId });

      // Log the full result for debugging
      addLog("Execution result:");
      addLog(JSON.stringify(result, null, 2));

      // Check execution status
      if (result && typeof result === "object") {
        if ("success" in result && result.success === false) {
          // Execution failed
          const errorMessage = result.error?.message || "Unknown error";
          const errorCode = result.error?.code || "UNKNOWN";
          addLog(`❌ Execution failed: ${errorMessage} (${errorCode})`);
        } else if ("error" in result && result.error) {
          // Alternative error format
          addLog(`❌ Execution error: ${result.error}`);
        } else if ("filePath" in result) {
          // File operation success
          addLog(`✅ File written to: ${result.filePath}`);
        } else {
          // Generic success
          addLog(`✅ Execution complete`);
        }
      } else {
        addLog(`❌ Execution error: No result returned`);
      }
    } catch (error) {
      addLog(`❌ Execution error: ${error}`);
      console.error("Execution error:", error);
    } finally {
      setIsExecuting(false);
      setCurrentExecutionId(null);
    }
  }, [nodeContent, addLog]);

  const cancelExecution = useCallback(async () => {
    if (!currentExecutionId) {
      addLog("No execution to cancel");
      return;
    }

    try {
      addLog(`Canceling execution: ${currentExecutionId}`);
      await conductor.node.cancel(currentExecutionId);
      addLog("Execution canceled");
      setIsExecuting(false);
      setCurrentExecutionId(null);
    } catch (error) {
      addLog(`Cancel error: ${error}`);
      console.error("Cancel error:", error);
    }
  }, [currentExecutionId, addLog]);

  const createSampleNode = useCallback(() => {
    const sampleNode = createNodeDefinition({
      type: "transform",
      id: "sample_transform",
      parameters: {
        code: "return { result: 'Hello from transform node!' };",
      },
    });
    setNodeContent(JSON.stringify(sampleNode, null, 2));
    addLog("Sample node created");
  }, [addLog]);

  const createGroupNode = useCallback(() => {
    const groupNode = createNodeDefinition({
      type: "group",
      id: "sample_group",
      nodes: [
        createNodeDefinition({
          type: "transform",
          id: "step1",
          parameters: {
            code: "return { step: 1, message: 'First step' };",
          },
        }),
        createNodeDefinition({
          type: "transform",
          id: "step2",
          parameters: {
            code: "return { step: 2, message: 'Second step' };",
          },
        }),
      ],
    });
    setNodeContent(JSON.stringify(groupNode, null, 2));
    addLog("Group node created");
  }, [addLog]);

  const createTestNode = useCallback(() => {
    const isoTimestamp = new Date().toISOString();
    const testNode = createNodeDefinition({
      type: "file-system",
      id: "test_write_file",
      parameters: {
        operation: "write",
        path: ".tmp/test_output.txt",
        content: `Debug test executed at ${isoTimestamp}\n\nTest data: Hello from Debug Page!\n\nThis file was written by the Conductor via IPC.\nTimestamp: ${isoTimestamp}`,
        encoding: "utf8",
        createDirectories: true,
        overwrite: true,
      },
    });
    setNodeContent(JSON.stringify(testNode, null, 2));
    addLog("Test node (write-file) created");
  }, [addLog]);

  const testNode = useCallback(async () => {
    try {
      addLog("🧪 Starting test node execution...");
      setIsExecuting(true);

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const filePath = `.tmp/debug-test-${timestamp}.txt`;

      // Create content that matches E2E test expectations
      const isoTimestamp = new Date().toISOString();
      const content = `Debug test executed at ${isoTimestamp}\n\nTest data: Hello from Debug Page!\n\nThis file was written by the Conductor via IPC.\nTimestamp: ${isoTimestamp}`;

      // Create and execute the write-file test node
      const testNode = createNodeDefinition({
        type: "file-system",
        id: "test_write_file_" + timestamp,
        parameters: {
          operation: "write",
          path: filePath,
          content: content,
          encoding: "utf8",
          createDirectories: true,
          overwrite: true,
        },
      });

      addLog("📝 Executing write-file node...");
      const result = await conductor.node.run(testNode, {
        executionId: `test_${timestamp}`,
      });

      // Log detailed result for debugging
      addLog("Test execution result:");
      addLog(JSON.stringify(result, null, 2));

      // Check if the execution was successful
      if (result && typeof result === "object") {
        if ("success" in result && result.success === false) {
          // Execution failed
          const errorMessage = result.error?.message || "Unknown error";
          const errorCode = result.error?.code || "UNKNOWN";
          addLog(`❌ File write test error: ${errorMessage} (${errorCode})`);
        } else if ("error" in result && result.error) {
          // Alternative error format
          addLog(`❌ File write test error: ${result.error}`);
        } else if ("filePath" in result) {
          // Success with file path in result
          addLog(`✅ File write test completed: ${result.filePath}`);
        } else {
          // Assume success if no error indicators
          addLog(`✅ File write test completed: ${filePath}`);
        }
      } else {
        // No result object
        addLog(`❌ File write test error: No result returned`);
      }
    } catch (error) {
      addLog(`❌ File write test error: ${error}`);
      console.error("Test node error:", error);
    } finally {
      setIsExecuting(false);
    }
  }, [addLog]);

  // Get available node types from schema registry
  // Note: registerAllNodeSchemas() is called on module load for browser
  const availableNodeTypes = useMemo(() => {
    // Ensure schemas are registered before getting types
    registerAllNodeSchemas();
    const types = getNodeSchemaTypes();
    console.log("[useNodeOperations] Available node types:", types);
    return types;
  }, []);

  // Get fields config from node definition (pre-built from createFieldsFromSchema)
  const nodeFieldsConfig = useMemo(() => {
    if (!selectedNodeType) return {};

    // Get the node definition which includes pre-built field configs
    const nodeDefinition = getNodeDefinition(selectedNodeType);

    // Return the fields from the definition, or empty object if not found
    return nodeDefinition?.fields || {};
  }, [selectedNodeType]);

  // Update field value
  const setNodeFieldValue = useCallback((key: string, value: unknown) => {
    setNodeFieldValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Build node from field values
  const buildNodeFromFields = useCallback(() => {
    if (!selectedNodeType) return null;

    // Filter out undefined/null values
    const cleanedValues = Object.entries(nodeFieldValues).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    return createNodeDefinition({
      type: selectedNodeType,
      id: `${selectedNodeType}_${Date.now()}`,
      parameters: cleanedValues,
    });
  }, [selectedNodeType, nodeFieldValues]);

  // Execute node built from fields
  const executeSelectedNode = useCallback(async () => {
    const node = buildNodeFromFields();
    if (!node) {
      addLog("❌ No node configured");
      return;
    }

    try {
      addLog(`🚀 Executing ${selectedNodeType} node...`);
      setIsExecuting(true);

      const executionId = `exec_${Date.now()}`;
      const result = await conductor.node.run(node, { executionId });

      addLog(`✅ ${selectedNodeType} execution complete`);
      addLog(JSON.stringify(result, null, 2));
    } catch (error) {
      addLog(`❌ Execution error: ${error}`);
      console.error("Execution error:", error);
    } finally {
      setIsExecuting(false);
    }
  }, [buildNodeFromFields, selectedNodeType, addLog]);

  // Reset field values when node type changes
  useEffect(() => {
    setNodeFieldValues({});
  }, [selectedNodeType]);

  return {
    nodeContent,
    setNodeContent,
    isExecuting,
    currentExecutionId,
    validateNode,
    executeNode,
    cancelExecution,
    createSampleNode,
    createGroupNode,
    createTestNode,
    testNode,
    // Dynamic node selection
    selectedNodeType,
    setSelectedNodeType,
    availableNodeTypes,
    nodeFieldsConfig,
    nodeFieldValues,
    setNodeFieldValue,
    executeSelectedNode,
  };
}
