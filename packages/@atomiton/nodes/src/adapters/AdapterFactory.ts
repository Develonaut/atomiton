import type {
  AdapterTheme,
  IVisualizationAdapter,
} from "./base/IVisualizationAdapter";
import type { CytoscapeAdapterConfig } from "./cytoscape/CytoscapeAdapter";
import { CytoscapeAdapter } from "./cytoscape/CytoscapeAdapter";
import type { ReactFlowAdapterConfig } from "./react-flow/ReactFlowAdapter";
import { ReactFlowAdapter } from "./react-flow/ReactFlowAdapter";

export type AdapterType = "react-flow" | "cytoscape" | "custom";

export interface AdapterRegistryEntry<
  TVisualNode = unknown,
  TVisualEdge = unknown,
> {
  name: string;
  displayName: string;
  description: string;
  factory: (
    theme: AdapterTheme,
    config?: Record<string, unknown>,
  ) => IVisualizationAdapter<TVisualNode, TVisualEdge>;
  defaultConfig?: Record<string, unknown>;
  capabilities: {
    supportsAnimations: boolean;
    supportsGrouping: boolean;
    supportsHierarchy: boolean;
    supportsLayout: boolean;
    supportsPanZoom: boolean;
    supportsSelection: boolean;
    supportsCustomNodes: boolean;
    supportsCustomEdges: boolean;
  };
}

function createReactFlowAdapterFactory(
  theme: AdapterTheme,
  config?: Partial<ReactFlowAdapterConfig>,
): ReactFlowAdapter {
  return new ReactFlowAdapter({
    theme,
    behavior: {
      snapToGrid: true,
      gridSize: 20,
      allowMultiSelection: true,
      enableAnimations: true,
      enableSounds: false,
      autoSave: true,
      autoSaveInterval: 30000,
    },
    layout: {
      nodeSpacing: 100,
      minimumZoom: 0.1,
      maximumZoom: 2.0,
      defaultZoom: 1.0,
      fitViewPadding: 50,
      connectionCurvature: 0.25,
    },
    performance: {
      enableVirtualization: true,
      virtualizationThreshold: 1000,
      renderThrottleMs: 16,
      batchUpdates: true,
    },
    accessibility: {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      highContrastMode: false,
      focusIndicatorStyle: "glow",
    },
    reactFlow: {
      nodeTypes: {},
      edgeTypes: {},
      defaultNodeType: "default",
      defaultEdgeType: "smoothstep",
      connectionLineType: "smoothstep",
      connectionMode: "strict",
      snapGrid: [20, 20],
      nodeOrigin: [0.5, 0] as [number, number],
      proOptions: {
        account: "paid-pro",
        hideAttribution: true,
      },
    },
    ...config,
  });
}

function createCytoscapeAdapterFactory(
  theme: AdapterTheme,
  config?: Partial<CytoscapeAdapterConfig>,
): CytoscapeAdapter {
  return new CytoscapeAdapter({
    theme,
    behavior: {
      snapToGrid: false,
      gridSize: 20,
      allowMultiSelection: true,
      enableAnimations: true,
      enableSounds: false,
      autoSave: true,
      autoSaveInterval: 30000,
    },
    layout: {
      nodeSpacing: 100,
      minimumZoom: 0.1,
      maximumZoom: 3.0,
      defaultZoom: 1.0,
      fitViewPadding: 50,
      connectionCurvature: 0.25,
    },
    performance: {
      enableVirtualization: false,
      virtualizationThreshold: 10000,
      renderThrottleMs: 16,
      batchUpdates: true,
    },
    accessibility: {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      highContrastMode: false,
      focusIndicatorStyle: "glow",
    },
    cytoscape: {
      layout: {
        name: "preset",
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 50,
      },
      interaction: {
        minZoom: 0.1,
        maxZoom: 3.0,
        zoomingEnabled: true,
        panningEnabled: true,
        boxSelectionEnabled: true,
        autoungrabify: false,
      },
      rendering: {
        motionBlur: true,
        motionBlurOpacity: 0.2,
        wheelSensitivity: 1,
        pixelRatio:
          (typeof window !== "undefined" && window.devicePixelRatio) || 1,
      },
    },
    ...config,
  });
}

class AdapterRegistry {
  private adapters = new Map<AdapterType, AdapterRegistryEntry>();

  constructor() {
    this.register("react-flow", {
      name: "react-flow",
      displayName: "React Flow",
      description: "Interactive node-based editor with React components",
      factory: createReactFlowAdapterFactory,
      defaultConfig: {},
      capabilities: {
        supportsAnimations: true,
        supportsGrouping: true,
        supportsHierarchy: true,
        supportsLayout: false,
        supportsPanZoom: true,
        supportsSelection: true,
        supportsCustomNodes: true,
        supportsCustomEdges: true,
      },
    });

    this.register("cytoscape", {
      name: "cytoscape",
      displayName: "Cytoscape.js",
      description: "Graph visualization with advanced layouts and analysis",
      factory: createCytoscapeAdapterFactory,
      defaultConfig: {},
      capabilities: {
        supportsAnimations: true,
        supportsGrouping: true,
        supportsHierarchy: true,
        supportsLayout: true,
        supportsPanZoom: true,
        supportsSelection: true,
        supportsCustomNodes: false,
        supportsCustomEdges: false,
      },
    });
  }

  register(type: AdapterType, entry: AdapterRegistryEntry): void {
    this.adapters.set(type, entry);
  }

  get(type: AdapterType): AdapterRegistryEntry | undefined {
    return this.adapters.get(type);
  }

  getAll(): Array<AdapterRegistryEntry> {
    return Array.from(this.adapters.values());
  }

  isSupported(type: AdapterType): boolean {
    return this.adapters.has(type);
  }

  getByCapability(
    capability: keyof AdapterRegistryEntry["capabilities"],
  ): Array<AdapterRegistryEntry> {
    return Array.from(this.adapters.values()).filter(
      (entry) => entry.capabilities[capability],
    );
  }
}

const registryInstance = new AdapterRegistry();

export class AdapterFactory {
  static create<TAdapter extends IVisualizationAdapter<unknown, unknown>>(
    type: AdapterType,
    theme: AdapterTheme,
    config?: Record<string, unknown>,
  ): TAdapter {
    const entry = registryInstance.get(type);

    if (!entry) {
      throw new Error(`Unsupported adapter type: ${type}`);
    }

    try {
      const adapter = entry.factory(theme, config) as TAdapter;
      return adapter;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Failed to create ${type} adapter: ${err.message}`);
    }
  }

  static createReactFlow(
    theme: AdapterTheme,
    config?: Partial<ReactFlowAdapterConfig>,
  ): ReactFlowAdapter {
    return createReactFlowAdapterFactory(theme, config);
  }

  static createCytoscape(
    theme: AdapterTheme,
    config?: Partial<CytoscapeAdapterConfig>,
  ): CytoscapeAdapter {
    return createCytoscapeAdapterFactory(theme, config);
  }

  static recommend(requirements: {
    nodeCount?: number;
    needsCustomComponents?: boolean;
    needsAdvancedLayouts?: boolean;
    needsAnalysis?: boolean;
    needsReactIntegration?: boolean;
    performance?: "high" | "medium" | "low";
  }): Array<{ type: AdapterType; score: number; reasons: string[] }> {
    const recommendations: Array<{
      type: AdapterType;
      score: number;
      reasons: string[];
    }> = [];

    for (const entry of registryInstance.getAll()) {
      let score = 0;
      const reasons: string[] = [];
      const type = entry.name as AdapterType;

      if (requirements.nodeCount) {
        if (type === "react-flow" && requirements.nodeCount < 1000) {
          score += 2;
          reasons.push("Excellent for moderate node counts");
        } else if (type === "cytoscape" && requirements.nodeCount > 500) {
          score += 2;
          reasons.push("Optimized for large graphs");
        }
      }

      if (requirements.needsCustomComponents) {
        if (entry.capabilities.supportsCustomNodes) {
          score += 3;
          reasons.push("Supports custom node components");
        }
      }

      if (requirements.needsAdvancedLayouts) {
        if (entry.capabilities.supportsLayout) {
          score += 3;
          reasons.push("Built-in layout algorithms");
        }
      }

      if (requirements.needsReactIntegration && type === "react-flow") {
        score += 2;
        reasons.push("Native React integration");
      }

      if (requirements.needsAnalysis && type === "cytoscape") {
        score += 2;
        reasons.push("Advanced graph analysis features");
      }

      if (requirements.performance === "high") {
        if (type === "cytoscape") {
          score += 1;
          reasons.push("High performance for complex graphs");
        }
      }

      recommendations.push({ type, score, reasons });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  static getDefaultConfig(
    type: AdapterType,
    theme: AdapterTheme,
  ): Record<string, unknown> {
    const entry = registryInstance.get(type);

    if (!entry) {
      throw new Error(`Unknown adapter type: ${type}`);
    }

    return {
      theme,
      ...entry.defaultConfig,
    };
  }

  static validateTheme(theme: AdapterTheme): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (typeof theme.getCategoryColor !== "function") {
      errors.push("Theme must provide getCategoryColor function");
    }

    if (typeof theme.getPortColor !== "function") {
      errors.push("Theme must provide getPortColor function");
    }

    if (typeof theme.getStatusColor !== "function") {
      errors.push("Theme must provide getStatusColor function");
    }

    if (typeof theme.getConnectionColor !== "function") {
      errors.push("Theme must provide getConnectionColor function");
    }

    if (!theme.colors?.background) {
      errors.push("Theme must provide colors.background");
    }

    if (!theme.colors?.foreground) {
      errors.push("Theme must provide colors.foreground");
    }

    if (!theme.colors?.primary) {
      errors.push("Theme must provide colors.primary");
    }

    if (!theme.typography?.fontSize) {
      errors.push("Theme must provide typography.fontSize");
    }

    if (!theme.spacing) {
      errors.push("Theme must provide spacing scale");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export function createAdapter<
  T extends IVisualizationAdapter<unknown, unknown>,
>(type: AdapterType, theme: AdapterTheme, config?: Record<string, unknown>): T {
  return AdapterFactory.create<T>(type, theme, config);
}

export function createReactFlowAdapter(
  theme: AdapterTheme,
  config?: Partial<ReactFlowAdapterConfig>,
): ReactFlowAdapter {
  return AdapterFactory.createReactFlow(theme, config);
}

export function createCytoscapeAdapter(
  theme: AdapterTheme,
  config?: Partial<CytoscapeAdapterConfig>,
): CytoscapeAdapter {
  return AdapterFactory.createCytoscape(theme, config);
}

export { registryInstance as adapterRegistry };
export default AdapterFactory;
