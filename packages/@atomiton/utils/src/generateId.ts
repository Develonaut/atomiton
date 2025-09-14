/**
 * ID generation utilities using uuid
 */
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique execution ID
 */
export function generateExecutionId(): string {
  return `exec_${uuidv4()}`;
}

/**
 * Generates a unique job ID
 */
export function generateJobId(): string {
  return `job_${uuidv4()}`;
}

/**
 * Generates a unique worker ID
 */
export function generateWorkerId(index: number): string {
  return `worker_${index}_${uuidv4()}`;
}

/**
 * Generates a generic unique ID with optional prefix
 */
export function generateId(prefix?: string): string {
  const id = uuidv4();
  return prefix ? `${prefix}_${id}` : id;
}
