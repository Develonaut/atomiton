# @atomiton/typescript-config - Roadmap

## Overview

Shared TypeScript configuration package for consistent build settings across the
Atomiton monorepo.

## Current Architecture

- Minimal package.json setup
- Private workspace package
- No actual TypeScript configuration files yet

## Upcoming Milestones

### Phase 1: Base Configuration (Critical)

- [ ] Create base `tsconfig.json` for general TypeScript projects
- [ ] Create React-specific `tsconfig.react.json` configuration
- [ ] Create Node.js-specific `tsconfig.node.json` configuration
- [ ] Add build tooling configuration

### Phase 2: Specialized Configurations

- [ ] Electron main process configuration
- [ ] Electron renderer process configuration
- [ ] Library build configuration with declaration files
- [ ] Test-specific configuration

### Phase 3: Advanced Features

- [ ] Path mapping configurations for monorepo
- [ ] Strict mode configurations with gradual adoption
- [ ] Performance optimization settings
- [ ] IDE integration improvements

## Required Configuration Files

### Base Configurations

```
src/
├── base.json           # Common settings for all projects
├── react.json          # React-specific extensions
├── node.json           # Node.js-specific settings
├── electron-main.json  # Electron main process
├── electron-renderer.json # Electron renderer
└── library.json        # Library compilation settings
```

### Export Structure

- Main entry point exposing all configurations
- Individual config exports for specific use cases
- Proper TypeScript declaration files

## Dependencies

- None (configuration only)
- Development dependencies for build tooling

## Design Principles

- **Consistency**: Uniform TypeScript settings across all packages
- **Flexibility**: Specialized configs for different project types
- **Strictness**: Gradual adoption of strict TypeScript settings
- **Performance**: Optimized compilation settings

---

_Last Updated: 2025-09-05_
