/**
 * Execution trace management for tracking node execution history
 */

import type { ExecutionTrace, NodeExecutionTrace } from "#types";
import { createExecutionId, createNodeId } from "#types/branded";
import { generateExecutionId } from "@atomiton/utils";
import type { ExecutionGraph } from "@atomiton/nodes/graph";
import type { NodeExecutionState } from "#execution/types";

/**
 * Manages execution trace collection during graph execution
 */
export class ExecutionTraceManager {
  private trace: ExecutionTrace;
  private nodeTraces: Map<string, NodeExecutionTrace>;

  constructor() {
    this.trace = {
      executionId: createExecutionId(),
      rootNodeId: createNodeId(),
      startTime: 0,
      events: [],
      nodes: [],
      config: {},
    };
    this.nodeTraces = new Map();
  }

  /**
   * Initialize trace for a new execution
   */
  initializeTrace(graph: ExecutionGraph): void {
    this.trace.executionId = createExecutionId(generateExecutionId());
    this.trace.rootNodeId = createNodeId(
      Array.from(graph.nodes.values())[0]?.id || "unknown",
    );
    this.trace.startTime = Date.now();
    this.trace.config = {};

    // Record start event
    this.trace.events.push({
      timestamp: Date.now(),
      type: "started",
      data: {
        totalNodes: graph.nodes.size,
        totalWeight: graph.totalWeight,
        criticalPath: graph.criticalPath,
      },
    });

    // Initialize node traces
    graph.nodes.forEach((node) => {
      this.nodeTraces.set(node.id, {
        nodeId: createNodeId(node.id),
        nodeName: node.name,
        nodeType: node.type,
        startTime: 0,
        state: "pending",
        progress: 0,
        events: [],
      });
    });
  }

  /**
   * Record node state change
   */
  recordNodeStateChange(
    nodeId: string,
    state: NodeExecutionState,
    error?: string,
  ): void {
    const nodeTrace = this.nodeTraces.get(nodeId);
    if (!nodeTrace) return;

    const timestamp = Date.now();

    if (state === "executing" && nodeTrace.startTime === 0) {
      nodeTrace.startTime = timestamp;
    }

    if (state === "completed" || state === "error") {
      nodeTrace.endTime = timestamp;
      nodeTrace.duration = timestamp - nodeTrace.startTime;
    }

    nodeTrace.state = state;
    nodeTrace.events.push({
      timestamp,
      type: "state-change",
      data: { state, errorMessage: error },
    });

    this.trace.events.push({
      timestamp,
      type: "state-change",
      data: { nodeId, state, errorMessage: error },
    });
  }

  /**
   * Record node progress update
   */
  recordNodeProgress(
    nodeId: string,
    progress: number,
    message?: string,
    overallProgress?: number,
    allNodes?: Array<{
      id: string;
      name: string;
      state: string;
      progress: number;
    }>,
  ): void {
    const nodeTrace = this.nodeTraces.get(nodeId);
    if (nodeTrace) {
      nodeTrace.progress = progress;
      nodeTrace.events.push({
        timestamp: Date.now(),
        type: "progress",
        data: { progress, message },
      });
    }

    this.trace.events.push({
      timestamp: Date.now(),
      type: "progress",
      data: {
        nodeId,
        progress: overallProgress ?? progress,
        message: message || "",
        allNodes: allNodes || [],
      },
    });
  }

  /**
   * Complete the execution trace
   */
  completeTrace(): void {
    this.trace.endTime = Date.now();
    this.trace.duration = this.trace.endTime - this.trace.startTime;
    this.trace.nodes = Array.from(this.nodeTraces.values());

    this.trace.events.push({
      timestamp: Date.now(),
      type: "completed",
      data: {
        totalDuration: this.trace.duration,
        nodesCompleted: this.trace.nodes.filter((n) => n.state === "completed")
          .length,
        nodesErrored: this.trace.nodes.filter((n) => n.state === "error")
          .length,
      },
    });
  }

  /**
   * Get the current trace (returns a copy)
   */
  getTrace(): ExecutionTrace {
    return {
      ...this.trace,
      events: [...this.trace.events],
      nodes: [...this.trace.nodes],
    };
  }

  /**
   * Reset trace for new execution
   */
  reset(): void {
    this.trace = {
      executionId: createExecutionId(),
      rootNodeId: createNodeId(),
      startTime: 0,
      events: [],
      nodes: [],
      config: {},
    };
    this.nodeTraces.clear();
  }
}
