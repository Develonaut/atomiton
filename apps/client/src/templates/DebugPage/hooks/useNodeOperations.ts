import { useNodeExecution } from "#hooks/useNodeExecution";
import { createExecutionId } from "@atomiton/conductor/browser";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import {
  createSampleGroupNode,
  createSampleTransformNode,
  createTestWriteNode,
} from "#templates/DebugPage/utils/sampleNodes";
import { createLogger } from "@atomiton/logger/browser";
import {
  createNodeDefinition,
  getNodeDefinition,
  type NodeDefinition,
  type NodeFieldsConfig,
} from "@atomiton/nodes/definitions";
import {
  getNodeSchemaTypes,
  registerAllNodeSchemas,
} from "@atomiton/nodes/schemas";
import { useCallback, useEffect, useMemo, useState } from "react";

const logger = createLogger({ scope: "NODE_OPERATIONS" });

export type UseNodeOperationsReturn = {
  nodeContent: string;
  setNodeContent: (content: string) => void;
  isExecuting: boolean;
  currentExecutionId: string | null;
  validateNode: () => Promise<void>;
  executeNode: () => Promise<void>;
  cancelExecution: () => Promise<void>;
  createSampleNode: () => void;
  createGroupNode: () => void;
  createTestNode: () => void;
  selectedNodeType: string | null;
  setSelectedNodeType: (type: string | null) => void;
  availableNodeTypes: string[];
  nodeFieldsConfig: NodeFieldsConfig;
  nodeFieldValues: Record<string, unknown>;
  setNodeFieldValue: (key: string, value: unknown) => void;
  executeSelectedNode: () => Promise<void>;
};

export function useNodeOperations(): UseNodeOperationsReturn {
  const { addLog } = useDebugLogs();
  const [nodeContent, setNodeContent] = useState<string>("");
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(
    null,
  );

  // Use shared execution hook
  const { execute, validate, cancel, isExecuting } = useNodeExecution({
    validateBeforeRun: false, // Debug page handles validation explicitly
    onValidationError: (errors) => {
      addLog(`Validation errors: ${errors.join(", ")}`);
    },
  });

  // Dynamic node selection state
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [nodeFieldValues, setNodeFieldValues] = useState<
    Record<string, unknown>
  >({});

  const validateNode = useCallback(async () => {
    try {
      addLog("Validating node...");
      const nodeData = JSON.parse(nodeContent) as NodeDefinition;
      const result = await validate(nodeData);
      addLog(`Validation result: ${result.valid ? "Valid" : "Invalid"}`);
      if (!result.valid) {
        addLog(`Validation errors: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      addLog(`Validation error: ${error}`);
      logger.error("Validation error:", error);
    }
  }, [nodeContent, addLog, validate]);

  const executeNode = useCallback(async () => {
    try {
      addLog("Executing node...");
      const nodeData = JSON.parse(nodeContent) as NodeDefinition;
      const executionId = createExecutionId(`exec_${Date.now()}`);
      setCurrentExecutionId(executionId);

      const result = await execute(nodeData, { executionId });

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

      setCurrentExecutionId(null);
    } catch (error) {
      addLog(`❌ Execution error: ${error}`);
      logger.error("Execution error:", error);
      setCurrentExecutionId(null);
    }
  }, [nodeContent, addLog, execute]);

  const cancelExecution = useCallback(async () => {
    if (!currentExecutionId) {
      addLog("No execution to cancel");
      return;
    }

    try {
      addLog(`Canceling execution: ${currentExecutionId}`);
      await cancel();
      addLog("Execution canceled");
      setCurrentExecutionId(null);
    } catch (error) {
      addLog(`Cancel error: ${error}`);
      logger.error("Cancel error:", error);
    }
  }, [currentExecutionId, addLog, cancel]);

  const createSampleNode = useCallback(() => {
    const sampleNode = createSampleTransformNode();
    setNodeContent(JSON.stringify(sampleNode, null, 2));
    addLog("Sample node created");
  }, [addLog]);

  const createGroupNode = useCallback(() => {
    const groupNode = createSampleGroupNode();
    setNodeContent(JSON.stringify(groupNode, null, 2));
    addLog("Group node created");
  }, [addLog]);

  const createTestNode = useCallback(() => {
    const testNode = createTestWriteNode();
    setNodeContent(JSON.stringify(testNode, null, 2));
    addLog("Test node (write-file) created");
  }, [addLog]);

  // Get available node types from schema registry
  // Note: registerAllNodeSchemas() is called on module load for browser
  const availableNodeTypes = useMemo(() => {
    // Ensure schemas are registered before getting types
    registerAllNodeSchemas();
    return getNodeSchemaTypes();
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

    addLog(`🚀 Executing ${selectedNodeType} node...`);

    const executionId = createExecutionId(`exec_${Date.now()}`);
    const result = await execute(node, { executionId });

    addLog(`✅ ${selectedNodeType} execution complete`);
    addLog(JSON.stringify(result, null, 2));
  }, [buildNodeFromFields, selectedNodeType, addLog, execute]);

  // Initialize with first available node type
  useEffect(() => {
    if (!selectedNodeType && availableNodeTypes.length > 0) {
      setSelectedNodeType(availableNodeTypes[0]);
    }
  }, [availableNodeTypes, selectedNodeType]);

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
