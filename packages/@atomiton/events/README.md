# @atomiton/events

Event system and IPC communication layer for the Atomiton Blueprint platform.

## Overview

This package provides a centralized event management system for communication between different parts of the Atomiton application. It handles event emission, subscription, and lifecycle management across the Blueprint editor and node system.

**Critical for @atomiton/conductor**: This package will provide the IPC abstraction layer for communication between Electron's renderer and main processes.

## Installation

This package is part of the Atomiton monorepo and is not published separately.

## Features

### Current

- Type-safe event system
- Event subscription management
- Event lifecycle hooks
- Cross-component communication

### Upcoming (Required for Conductor)

- **IPC Support** - Unified API for Electron renderer ↔ main communication
- **Process Detection** - Automatic detection of execution context
- **Type-Safe IPC** - Preserve TypeScript types across process boundaries
- **Event Batching** - Performance optimization for high-frequency events

## Development

```bash
# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Dependencies

- `events` - Node.js EventEmitter for event handling

## License

MIT
