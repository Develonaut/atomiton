/**
 * Visualization Adapter Factory
 *
 * Factory for creating platform-specific visualization adapters
 */

import { BrowserAdapter } from "./browser-adapter";
import { DesktopAdapter } from "./desktop-adapter";
import type { AdapterFactory, VisualizationAdapter } from "./types";
import { getPlatformInfo } from "../../platforms";

/**
 * Default adapter factory that creates adapters based on platform detection
 */
export class DefaultAdapterFactory implements AdapterFactory {
  createAdapter(): VisualizationAdapter {
    const platformInfo = getPlatformInfo();

    switch (platformInfo.platform) {
      case "browser":
        return new BrowserAdapter();

      case "desktop":
        return new DesktopAdapter();

      case "test":
        // For tests, we can use browser adapter as it's more predictable
        return new BrowserAdapter();

      default:
        // Fallback to browser adapter
        return new BrowserAdapter();
    }
  }

  supportsCurrentPlatform(): boolean {
    // This factory supports all platforms by providing appropriate adapters
    return true;
  }
}

/**
 * Singleton instance of the default adapter factory
 */
let defaultFactory: DefaultAdapterFactory | null = null;

/**
 * Get the default adapter factory instance
 */
export function getDefaultAdapterFactory(): DefaultAdapterFactory {
  if (!defaultFactory) {
    defaultFactory = new DefaultAdapterFactory();
  }
  return defaultFactory;
}

/**
 * Create a visualization adapter for the current platform
 */
export function createVisualizationAdapter(): VisualizationAdapter {
  return getDefaultAdapterFactory().createAdapter();
}

/**
 * Create and initialize a visualization adapter
 */
export async function createAndInitializeAdapter(): Promise<VisualizationAdapter> {
  const adapter = createVisualizationAdapter();
  await adapter.initialize();
  return adapter;
}
