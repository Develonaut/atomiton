/**
 * Node Execution Weights
 *
 * Weights represent relative execution complexity/time for progress calculation.
 * Higher weight = takes longer = contributes more to overall progress.
 *
 * ## Units
 * Weights use arbitrary units (NOT milliseconds) - what matters is the ratio between weights.
 * Example: If `httpRequest` is weighted 500 and `transform` is 50, httpRequest contributes
 * 10x more to overall progress because it's expected to take ~10x longer.
 *
 * ## Purpose
 * During execution, the overall progress bar reflects how much *work* has been completed,
 * not just how many nodes. This creates a more accurate user experience:
 * - Fast operations (like `condition`) complete quickly but contribute little to progress
 * - Slow operations (like `email`) take longer but show significant progress movement
 *
 * ## Tuning Weights
 * 1. **Measure**: Run flows with real data and observe actual execution times in logs
 * 2. **Calculate Ratios**: If operation A takes 5x longer than operation B, weight_A should be ~5x weight_B
 * 3. **Adjust**: Update weights in this file based on measured ratios
 * 4. **Test**: Use slowMo to verify progress distribution feels accurate and proportional
 * 5. **Iterate**: Refine weights as you observe more real-world execution patterns
 *
 * ## Guidelines
 * - Start conservative: Use higher weights for operations you're unsure about
 * - Round to nice numbers: Precision doesn't matter, ratios do (100 vs 102 is fine)
 * - Document changes: Add a comment explaining significant weight adjustments
 * - Test edge cases: Verify flows with all fast or all slow operations still show progress
 *
 * @see ../docs/WEIGHT_CALIBRATION.md for detailed calibration process
 */
export const DEFAULT_NODE_WEIGHTS: Record<string, number> = {
  // ============================================================================
  // NETWORK OPERATIONS
  // Generally slower due to network latency, data transfer, and API response times
  // ============================================================================

  /** HTTP/REST API calls - includes network latency, request/response time */
  httpRequest: 500,

  /** Email sending via SMTP/API - includes connection, auth, attachments, delivery */
  email: 800,

  // ============================================================================
  // FILE SYSTEM OPERATIONS
  // Moderate I/O operations, speed depends on disk type and file size
  // ============================================================================

  /** File read from local disk - typically fast on SSD, slower on HDD */
  fileRead: 100,

  /** File write to local disk - 2x read time due to write+sync operations */
  fileWrite: 200,

  /** Generic file system operations - reading, writing, directory ops */
  "file-system": 200,

  // ============================================================================
  // DATABASE OPERATIONS
  // Variable based on query complexity, connection pooling, and data size
  // ============================================================================

  /** Database query/mutation - includes connection overhead and query execution */
  database: 300,

  // ============================================================================
  // USER INPUT / FORM OPERATIONS
  // Generally fast as they're just data manipulation in memory
  // ============================================================================

  /** Form field editing and validation - lightweight data operations */
  "edit-fields": 80,

  // ============================================================================
  // COMPUTATION & DATA TRANSFORMATION
  // CPU-bound operations, generally fast unless processing large datasets
  // ============================================================================

  /** Data transformation, mapping, filtering - pure computation */
  transform: 50,

  /** Boolean condition evaluation - very fast, minimal computation */
  condition: 10,

  // ============================================================================
  // CONTROL FLOW
  // Meta-operations that control execution flow
  // ============================================================================

  /** Loop iteration overhead - actual weight multiplied by iteration count */
  loop: 20,

  /** Explicit delay/wait operation - weight matches delay duration */
  delay: 1000,

  // ============================================================================
  // FALLBACK
  // Used for unknown or custom node types
  // ============================================================================

  /** Default weight for unknown node types - conservative middle-ground estimate */
  default: 100,
};
