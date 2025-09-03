/**
 * Visualization Adapters Module
 *
 * Provides platform-specific theme injection and visualization adaptation.
 * This system enables consistent theming across different environments
 * while allowing for platform-specific optimizations.
 */

// Core adapter types and interfaces
export * from "./types";

// Theme injection system
export * from "./theme-injector";

// Platform-specific adapters
export * from "./browser-adapter";
export * from "./desktop-adapter";

// Adapter factory
export * from "./adapter-factory";
