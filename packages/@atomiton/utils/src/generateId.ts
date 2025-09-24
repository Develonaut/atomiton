/**
 * ID generation utilities using uuid
 */
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a generic unique ID with optional prefix
 */
export function generateId(prefix?: string): string {
  const id = uuidv4();
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generates a unique execution ID
 */
export function generateExecutionId(prefix?: string): string {
  return generateId(prefix ? `exec_${prefix}` : "exec");
}

/**
 * Generates a unique job ID
 */
export function generateJobId(prefix?: string): string {
  return generateId(prefix ? `job_${prefix}` : "job");
}

/**
 * Generates a unique worker ID
 */
export function generateWorkerId(index: number, prefix?: string): string {
  return generateId(prefix ? `worker_${index}_${prefix}` : `worker_${index}`);
}

/**
 * Generates a unique node ID (for composite nodes)
 */
export function generateNodeId(prefix?: string): string {
  return generateId(prefix ? `node_${prefix}` : "node");
}

/**
 * Generates a unique edge ID (for composite nodes)
 * */
export function generateEdgeId(prefix?: string): string {
  return generateId(prefix ? `edge_${prefix}` : "edge");
}

/**
 * Generates a unique port ID (for node ports)
 */
export function generatePortId(prefix?: string): string {
  return generateId(prefix ? `port_${prefix}` : "edge");
}
