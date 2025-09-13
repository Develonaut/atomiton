/**
 * Minimal working Blueprint executor - Karen approved approach
 * Focus: Get ONE Blueprint executing successfully
 */

export type SimpleNode = {
  id: string;
  type: string;
  execute: (input: unknown) => Promise<unknown>;
};

export type SimpleBlueprint = {
  id: string;
  nodes: SimpleNode[];
};

export type SimpleResult = {
  success: boolean;
  outputs?: unknown;
  error?: string;
};

/**
 * Dead simple executor - no abstractions, just working execution
 */
export class SimpleExecutor {
  async executeBlueprint(
    blueprint: SimpleBlueprint,
    input?: unknown,
  ): Promise<SimpleResult> {
    try {
      let currentOutput = input;

      // Execute nodes sequentially (simplest approach)
      for (const node of blueprint.nodes) {
        console.warn(`Executing node: ${node.id}`);
        currentOutput = await node.execute(currentOutput);
      }

      return {
        success: true,
        outputs: currentOutput,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Helper to create simple test nodes
 */
export function createSimpleNode(
  id: string,
  type: string,
  logic: (input: unknown) => Promise<unknown>,
): SimpleNode {
  return {
    id,
    type,
    execute: logic,
  };
}
