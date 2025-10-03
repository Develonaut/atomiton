/**
 * Default node weights by type
 * These are estimates in milliseconds for typical operations
 */
export const DEFAULT_NODE_WEIGHTS: Record<string, number> = {
  httpRequest: 500,
  transform: 50,
  condition: 10,
  loop: 20,
  delay: 1000,
  fileRead: 100,
  fileWrite: 200,
  database: 300,
  email: 800,
  default: 100,
};
