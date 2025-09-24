export type QueueJob<T = unknown> = {
  id: string;
  priority: number;
  data: T;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
};

export type QueueOptions = {
  concurrency?: number;
  interval?: number;
  intervalCap?: number;
  timeout?: number;
  throwOnTimeout?: boolean;
};

export type JobResult<T = unknown> = {
  jobId: string;
  success: boolean;
  result?: T;
  error?: string;
  duration: number;
};
