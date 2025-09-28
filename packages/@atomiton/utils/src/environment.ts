/**
 * Simple environment detection for Atomiton
 */

/**
 * Detect if we're running in an Electron environment
 * Simple check based on atomitonRPC presence that we control in preload
 */
export function isElectronEnvironment(): boolean {
  return !!(window as Window & { atomitonRPC?: unknown })?.atomitonRPC;
}
