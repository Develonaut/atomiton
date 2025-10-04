/**
 * Shared types for Debug page components
 */

/** Flow execution progress tracking */
export type ExecutionProgress = {
  currentNode: number;
  totalNodes: number;
  currentNodeName?: string;
  graphProgress: number; // Overall weighted progress (0-100)
};

/** Node state in execution trace */
export type ExecutionTraceNode = {
  id: string;
  name: string;
  state: string;
};

/** Progress event data in execution trace */
export type ProgressEventData = {
  progress: number;
  message: string;
  nodes: ExecutionTraceNode[];
};

/** Started event data in execution trace */
export type StartedEventData = {
  executionId: string;
  flowName: string;
  totalNodes: number;
  slowMo: number;
  startTime: number;
};

/** Complete event data in execution trace */
export type CompleteEventData = {
  nodeId: string;
  executionId: string;
};

/** Error event data in execution trace */
export type ErrorEventData = {
  error: unknown;
  nodeId: string;
};

/** Execution trace event types */
export type ExecutionTraceEvent =
  | {
      timestamp: number;
      type: "started";
      data: StartedEventData;
    }
  | {
      timestamp: number;
      type: "progress";
      data: ProgressEventData;
    }
  | {
      timestamp: number;
      type: "complete";
      data: CompleteEventData;
    }
  | {
      timestamp: number;
      type: "error";
      data: ErrorEventData;
    };
