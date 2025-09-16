# Changelog

## 0.2.0 (2025-09-16)

### BREAKING CHANGES

- **MAJOR SIMPLIFICATION**: Complete rewrite and 91% code reduction (1930 → 174 lines)
- Removed all over-engineered abstractions and custom state management
- Removed auto-generated navigation methods (moved to client application)
- Removed Zustand-powered navigation store
- Removed custom path utilities and complex routing logic
- Removed custom hooks and provider abstractions

### Features

- **Simplified Architecture**: Clean wrapper around TanStack Router with 4 focused files
- **Modular Structure**: Separated into types.ts, routeFactory.ts, createRouter.tsx, index.ts
- **Clean API**: Returns structured object with {router, navigate, useRouter, Link, RouterProvider, ...}
- **Async Component Loading**: Improved component loading with proper React patterns
- **Production Ready**: 3.83 kB production bundle with zero TypeScript errors
- **Comprehensive Testing**: Smoke tests validating API structure
- **Updated Documentation**: Complete documentation overhaul reflecting simplified approach

### Migration Guide

- Navigation helpers moved to `apps/client/router/navigation.ts`
- Path definitions moved to `apps/client/router/paths.ts`
- Use TanStack Router patterns directly instead of custom abstractions
- Replace auto-generated navigation methods with explicit navigation functions

## 0.1.0 (2025-09-15)

### Features

- Initial release of @atomiton/router
- Auto-generated navigation methods based on route names
- TanStack Router integration for robust routing
- Zustand-powered navigation store for global state
- Full TypeScript support with type inference
- Support for required and optional route parameters
- Lazy loading and code splitting support
- Error boundaries and loading states
- Custom navigator functions for complex routing logic
- Path utilities for building and validating routes
