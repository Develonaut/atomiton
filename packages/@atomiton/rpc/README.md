---
title: "@atomiton/rpc"
description:
  "Pure transport layer for RPC communication between main and renderer
  processes in Electron applications"
stage: "alpha"
version: "0.1.0"
last_updated: "2025-09-28"
dependencies: ["@trpc/server", "electron"]
tags: ["rpc", "ipc", "electron", "transport"]
ai_context:
  category: "utility"
  complexity: "moderate"
  primary_language: "typescript"
---

# @atomiton/rpc

> Pure transport layer for RPC communication between main and renderer processes
> in Electron applications

## 📦 What This Package Does

This package provides a clean, type-safe RPC (Remote Procedure Call) transport
layer built on tRPC for Electron applications. It handles message passing
between main, preload, and renderer processes without containing any business
logic - purely focused on transport.

## 🚧 Current Status

**Stage**: Alpha - Core functionality implemented, API stabilizing

**Limitations**:

- Limited to Electron IPC transport
- No WebSocket transport yet
- Error handling needs enhancement

## 🚀 Quick Start

```bash
npm install @atomiton/rpc
```

```typescript
// In main process
import { createRPCHandler } from "@atomiton/rpc/main";

const handler = createRPCHandler({
  router: appRouter, // Your tRPC router
});

// In preload
import { exposeRPCBridge } from "@atomiton/rpc/preload";

exposeRPCBridge();

// In renderer
import { createRPCClient } from "@atomiton/rpc/renderer";

const client = createRPCClient();
```

## 📚 API Reference

### Main Process (`/main`)

- `createRPCHandler()` - Creates IPC handler for main process
- `registerHandlers()` - Register tRPC router handlers

### Preload Script (`/preload`)

- `exposeRPCBridge()` - Exposes secure IPC bridge to renderer
- `createContextBridge()` - Creates context isolation bridge

### Renderer Process (`/renderer`)

- `createRPCClient()` - Creates tRPC client for renderer
- `useRPCClient()` - React hook for RPC client

### Shared Types (`/shared`)

- `RPCRequest` - Request message type
- `RPCResponse` - Response message type
- `RPCError` - Error type
- IPC channel constants

## 🔨 Development

### Current Sprint (Week of 2025-09-28)

Focus on pure transport implementation:

- Remove all business logic from RPC layer
- Ensure RPC is just message passing
- Let conductor handle all execution logic

### Architecture Decisions

- **Pure Transport**: No business logic, only message passing
- **Type Safety**: Full TypeScript types across IPC boundary
- **Security**: Proper context isolation and channel validation
- **Minimal Dependencies**: Only tRPC and Electron required

## 🤝 Contributing

See [Contributing Guide](../../CONTRIBUTING.md)

## 📦 Related Packages

- [@atomiton/conductor](../conductor) - Execution engine that uses RPC for
  transport
- [@atomiton/desktop](../../apps/desktop) - Main Electron application
- [@atomiton/client](../../apps/client) - Renderer application
