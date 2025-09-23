import type { INode } from "@atomiton/nodes/executables";
import type { ExecutionStrategy } from "./streamTypes";

export class StrategyAnalyzer {
  constructor(
    private enableStreaming: boolean,
    private enableParallel: boolean,
  ) {}

  determineStrategy(
    node: INode,
    inputs: Record<string, unknown>,
    options?: { useWorker?: boolean; streaming?: boolean },
  ): ExecutionStrategy {
    if (options?.useWorker) return "worker";
    if (options?.streaming) return "stream";

    const inputSize = this.estimateDataSize(inputs);
    const isArrayInput = this.hasArrayInputs(inputs);
    const isCpuIntensive = this.isCpuIntensive(node);
    const isStreamable = this.isStreamable(node);

    if (isStreamable && inputSize > 10 * 1024 * 1024) {
      return "stream";
    }

    if (isCpuIntensive && inputSize > 1024 * 1024) {
      return "worker";
    }

    if (isArrayInput && this.enableParallel) {
      return "parallel";
    }

    if (isArrayInput && inputSize > 5 * 1024 * 1024) {
      return "batch";
    }

    return "direct";
  }

  private estimateDataSize(data: unknown): number {
    try {
      const str = JSON.stringify(data);
      return str ? str.length : 0;
    } catch {
      return 0;
    }
  }

  private hasArrayInputs(inputs: Record<string, unknown>): boolean {
    return Object.values(inputs).some((value) => Array.isArray(value));
  }

  private isCpuIntensive(node: INode): boolean {
    const intensiveTypes = [
      "transform",
      "compute",
      "analysis",
      "ml",
      "crypto",
      "compression",
    ];

    return intensiveTypes.includes(node.type);
  }

  private isStreamable(node: INode): boolean {
    const streamableTypes = ["filter", "map", "transform", "aggregate"];

    return streamableTypes.includes(node.type);
  }
}
