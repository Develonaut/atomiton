/**
 * Minimal working Composite executor - Karen approved approach
 * Focus: Get ONE Composite executing successfully
 */

export type SimpleNode = {
  id: string;
  type: string;
  execute: (input: unknown) => Promise<unknown>;
};

export type SimpleComposite = {
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
  async executeComposite(
    composite: SimpleComposite,
    input?: unknown,
  ): Promise<SimpleResult> {
    try {
      let currentOutput = input;

      // Execute nodes sequentially (simplest approach)
      for (const node of composite.nodes) {
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
