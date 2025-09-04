/**
 * @atomiton/di - Dependency Injection for Atomiton
 *
 * A lightweight dependency injection container based on n8n's DI implementation.
 * Provides decorators and container for managing service dependencies.
 */

// Re-export everything from the main DI implementation
export {
  // Core types
  type Constructable,

  // Decorators
  Service,
  Injectable,

  // Container
  Container,
} from "./di";

// Export as default for convenience
export { Container as default } from "./di";

// Re-export reflect-metadata to ensure it's loaded
import "reflect-metadata";
