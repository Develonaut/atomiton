/**
 * Data handling functions for composite execution
 */

import type { CompositeDefinition, NodeExecutionResult } from "@atomiton/nodes";
import type { ExecutionStore } from "../../store";

/**
 * Gathers inputs for a specific node from connected nodes
 */
export function gatherNodeInputs(
  nodeId: string,
  composite: CompositeDefinition,
  executionId: string,
  executionResults: Map<string, Map<string, NodeExecutionResult>>,
  executionStore: ExecutionStore,
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};

  // Find all connections that target this node
  const incomingConnections = composite.edges.filter(
    (conn) => conn.target.nodeId === nodeId,
  );

  for (const connection of incomingConnections) {
    executionStore.getExecution(executionId)?.nodeStates[
      connection.source.nodeId
    ];

    // Get results from the execution results map
    const executionResult = executionResults
      .get(executionId)
      ?.get(connection.source.nodeId);

    if (executionResult?.outputs) {
      const outputValue = executionResult.outputs[connection.source.portId];
      inputs[connection.target.portId] = outputValue;
    }
  }

  return inputs;
}

/**
 * Calculates final outputs for a composite execution
 */
export function calculateCompositeOutputs(
  composite: CompositeDefinition,
  nodeResults: Record<string, NodeExecutionResult>,
): Record<string, unknown> {
  const outputs: Record<string, unknown> = {};

  // For now, collect all outputs from all nodes
  // In the future, this could be more sophisticated based on composite output definitions
  for (const [nodeId, result] of Object.entries(nodeResults)) {
    if (result.success && result.outputs) {
      Object.entries(result.outputs).forEach(([key, value]) => {
        outputs[`${nodeId}.${key}`] = value;
      });
    }
  }

  return outputs;
}
