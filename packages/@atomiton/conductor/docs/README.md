# Conductor Documentation

## Overview

The @atomiton/conductor package provides a unified Blueprint execution API that
works seamlessly across all environments (Electron, Browser, Node.js).

## Visual Documentation

### [Mermaid Diagrams](./MERMAID_DIAGRAMS.md)

Interactive flowcharts and architecture diagrams that render directly on GitHub:

- Unified Conductor Architecture
- Transport Layer Architecture
- Execution Flow
- State Management with Zustand
- Environment Detection Flow

## Key Features

### Unified API

- Single `conductor.execute()` API works everywhere
- Automatic environment detection
- Transparent transport layer switching

### Transport Layer

- **IPC Transport**: For Electron renderer → main process
- **HTTP Transport**: For browser → API server
- **Local Transport**: For direct Node.js execution

### Integration

- Uses `@atomiton/store` for state management
- Uses `@atomiton/events` for event bus
- Uses `@atomiton/utils` for utilities

## Quick Start

```typescript
import { conductor } from "@atomiton/conductor";

// Works the same in ALL environments!
const result = await conductor.execute({
  blueprintId: "my-workflow",
  inputs: { data: "test" },
});
```
