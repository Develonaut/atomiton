// Event names for conductor communication
export const CONDUCTOR_EVENTS = {
  // Execution events
  EXECUTE: "conductor:execute",
  RESULT: "conductor:result",
  PROGRESS: "conductor:progress",
  ERROR: "conductor:error",
  CANCEL: "conductor:cancel",

  // Composite events
  COMPOSITE_EXECUTE: "conductor:composite:execute",
  COMPOSITE_RESULT: "conductor:composite:result",
  COMPOSITE_PROGRESS: "conductor:composite:progress",

  // Queue events
  QUEUE_JOB_ADDED: "conductor:queue:job:added",
  QUEUE_JOB_STARTED: "conductor:queue:job:started",
  QUEUE_JOB_COMPLETED: "conductor:queue:job:completed",
  QUEUE_JOB_FAILED: "conductor:queue:job:failed",

  // Worker events
  WORKER_READY: "conductor:worker:ready",
  WORKER_BUSY: "conductor:worker:busy",
  WORKER_ERROR: "conductor:worker:error",
} as const;

export type ConductorEventName = typeof CONDUCTOR_EVENTS[keyof typeof CONDUCTOR_EVENTS];