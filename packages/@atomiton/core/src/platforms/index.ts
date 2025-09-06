/**
 * Platform Detection Module
 *
 * Provides runtime environment detection and platform-specific utilities.
 * This module is critical for adapting behavior across different environments
 * (browser, desktop/Electron, Node.js, test environments).
 */

// Export all platform detection functionality
// Create a singleton Platform Manager for consistent access
import { getPlatformInfo, type PlatformInfo } from "./detector";

export * from "./detector";

/**
 * Platform Manager - Singleton access to platform information
 */
export class PlatformManager {
  private static instance: PlatformManager;

  private constructor() {}

  static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  /**
   * Get current platform information
   */
  static detectPlatform(): PlatformInfo {
    return getPlatformInfo();
  }

  /**
   * Instance method for platform detection
   */
  detectPlatform(): PlatformInfo {
    return getPlatformInfo();
  }
}
