/**
 * Progress controller utilities for execution feedback
 */

import { delay } from "@atomiton/utils";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

type ProgressSteps = {
  steps: number[];
  messages: string[];
};

/**
 * Generate weight-based progress steps for dynamic progress tracking
 */
export function generateProgressSteps(weight: number): ProgressSteps {
  if (weight < 100) {
    // Fast operations: fewer steps, quicker feel
    return {
      steps: [0, 30, 70, 90],
      messages: [
        "Starting...",
        "Processing...",
        "Finalizing...",
        "Almost done...",
      ],
    };
  } else if (weight > 300) {
    // Slow operations: more steps, shows gradual progress
    return {
      steps: [0, 15, 30, 45, 60, 75, 90],
      messages: [
        "Starting...",
        "Initializing...",
        "Loading...",
        "Processing...",
        "Computing...",
        "Finalizing...",
        "Almost done...",
      ],
    };
  } else {
    // Standard progression for medium-weight operations
    return {
      steps: [0, 20, 40, 60, 80, 90],
      messages: [
        "Starting...",
        "Initializing...",
        "Processing...",
        "Computing...",
        "Finalizing...",
        "Almost done...",
      ],
    };
  }
}

/**
 * Create a progress controller for a node
 */
export function createProgressController(
  node: NodeDefinition,
  executionGraphStore: ExecutionGraphStore,
  slowMo: number,
): {
  start: () => Promise<void>;
  markComplete: () => Promise<void>;
  cancel: () => void;
} {
  const nodeState = executionGraphStore.getState().nodes.get(node.id);
  const weight = nodeState?.weight ?? 100;

  const { steps, messages } = generateProgressSteps(weight);
  let markedComplete = false;
  let cancelled = false;

  return {
    start: async () => {
      for (let i = 0; i < steps.length; i++) {
        // Check if progress was cancelled (e.g., due to error)
        if (cancelled) {
          break;
        }
        executionGraphStore.setNodeProgress(node.id, steps[i], messages[i]);
        if (i < steps.length - 1) {
          await delay(slowMo);
        }
      }
    },
    markComplete: async () => {
      if (!markedComplete) {
        executionGraphStore.setNodeProgress(node.id, 100, "Complete");
        // Wait for progress animation to complete (half of slowMo, min 300ms for CSS transition)
        await delay(Math.max(slowMo / 2, 300));
        executionGraphStore.setNodeState(node.id, "completed");
        markedComplete = true;
      }
    },
    cancel: () => {
      cancelled = true;
    },
  };
}
