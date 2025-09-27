# Turborepo Development Setup

This document describes our Turborepo pipeline configuration, development
scripts, and how our monorepo development environment works.

## Overview

Our project uses Turborepo for efficient monorepo management with the following
key components:

- **Electron desktop app** with coordinated startup
- **Vite dev servers** for React client and component libraries
- **TypeScript build-watch processes** for library packages
- **Industry-standard process coordination** using `concurrently` and `wait-on`

## Package Structure

```
atomiton/
├── apps/
│   ├── client/          # React app (Vite dev server on :5173)
│   └── desktop/         # Electron app (coordinates with client)
└── packages/@atomiton/
    ├── ui/              # Component library (build-watch)
    ├── editor/          # Visual editor (build-watch)
    ├── conductor/       # Execution orchestrator (build-watch)
    ├── storage/         # Storage abstraction (build-watch)
    ├── core/            # Core Flow engine
    ├── nodes/           # Node implementations
    └── [other packages] # Additional libraries
```

## Development Scripts

### Root Level Commands

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | Start all development processes               |
| `pnpm kill`          | Kill all development processes and free ports |
| `pnpm dev:client`    | Start only client + editor                    |
| `pnpm dev:desktop`   | Start only desktop app (with dependencies)    |
| `pnpm dev:ui`        | Start only UI library                         |
| `pnpm dev:conductor` | Start only conductor package                  |
| `pnpm dev:storage`   | Start only storage package                    |

### Package-Specific Patterns

**Apps (Client/Desktop):**

- `dev` - Starts development server
- `kill` - Kills associated processes/ports

**UI Libraries (UI/Editor):**

- `dev` - Vite dev server for HMR and source imports
- `kill` - Placeholder (no processes to kill)

**Core Libraries (Conductor/Storage/Core/Nodes):**

- `dev` - TypeScript build-watch mode
- `kill` - Placeholder (no processes to kill)

## Turborepo Configuration

### Core Tasks (`turbo.json`)

```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "dev#@atomiton/desktop": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Key Points:**

- `persistent: true` for long-running dev servers
- `cache: false` since dev tasks shouldn't be cached
- Desktop app has special override (uses `concurrently` internally)
- Most packages depend on `^build` to ensure dependencies are built first

## Process Coordination

### Desktop App Startup

The desktop app waits for all dependencies using Turborepo coordination:

```bash
# Desktop app dev script
wait-on http://localhost:5173 && electron-vite dev
```

**Startup Sequence (via `pnpm dev`):**

1. **All packages build** (`^build` dependency ensures libraries are built
   first)
2. **Client dev server starts** (Vite on port 5173)
3. **Desktop app waits** (`wait-on http://localhost:5173`)
4. **Electron starts** only after client server responds

**Turborepo Dependencies:**

```json
"dev#@atomiton/desktop": {
  "dependsOn": ["@atomiton/client#dev", "@atomiton/editor#dev", "^build"]
}
```

**Benefits:**

- Proper build-then-serve-then-electron sequence
- No race conditions or arbitrary timeouts
- Turborepo handles all coordination
- Desktop app is completely passive (just waits)

### Process Cleanup

We use optimized, fast cleanup commands:

```bash
# Fast combined cleanup (< 0.4 seconds)
pkill -f electron > /dev/null 2>&1 || true && \
lsof -ti:5173,5174,5175,3000,8080 | xargs -r kill -9 > /dev/null 2>&1 || true

# Via script
pnpm kill
```

**Port Usage:**

- `5173` - Client app (React + Vite)
- `5174` - UI component library (Vite dev server)
- `5175` - Editor package (Vite dev server)
- `3000` - Alternative dev server
- `8080` - Additional services

## Development Workflow

### Starting Development

```bash
# Start everything
pnpm dev

# Or start specific components
pnpm dev:client    # Client + Editor only
pnpm dev:desktop   # Desktop app (includes client)
```

### Stopping Development

```bash
# Clean shutdown
Ctrl+C  # Stops current processes

# Force cleanup (if processes hang)
pnpm kill
```

### Package Development

**UI Libraries (UI, Editor)** - Use Vite dev servers:

```bash
# Start UI component library dev server
pnpm dev:ui

# Start editor dev server
pnpm dev:editor

# Client app imports source files directly for instant HMR
```

**Core Libraries (Conductor, Storage)** - Use build-watch:

```bash
# Watch mode for TypeScript compilation
pnpm dev:conductor
pnpm dev:storage

# Rebuilds automatically, other packages pick up changes via workspace links
```

## Technical Details

### Service Readiness

We use `wait-on` for proper service readiness instead of arbitrary timeouts:

```bash
# Wait for HTTP endpoint
wait-on http://localhost:5173

# Wait for file (build completion)
wait-on dist/index.js
```

### Process Management

- **Concurrently** (`-k` flag): Coordinated startup/shutdown
- **Kill-port**: Industry standard port cleanup
- **Wait-on**: Service readiness detection
- **POSIX signals**: Graceful process termination

### Turborepo Benefits

1. **Incremental builds** - Only rebuild changed packages
2. **Dependency awareness** - Respects package interdependencies
3. **Parallel execution** - Runs independent tasks simultaneously
4. **Caching** - Speeds up builds and tests (not used for dev tasks)

## Common Issues & Solutions

### "Port already in use"

```bash
pnpm kill  # Free all ports
pnpm dev   # Restart
```

### "Electron won't start"

- Desktop app waits for client server (port 5173)
- Check if client is running: `curl http://localhost:5173`
- Check logs for `wait-on` output

### "Package changes not reflected"

- Library packages use TypeScript build-watch
- Check if `tsc --watch` is running for the package
- Restart the specific package dev script

### "Dependencies out of sync"

```bash
pnpm install  # Sync workspace dependencies
pnpm build    # Rebuild all packages
pnpm dev      # Restart development
```

## Scripts Reference

### Root Package Scripts

```json
{
  "dev": "pnpm kill && turbo run dev --filter=\"@atomiton/client\" --filter=\"@atomiton/desktop\" --filter=\"@atomiton/ui\" --filter=\"@atomiton/editor\" --filter=\"@atomiton/conductor\" --filter=\"@atomiton/storage\"",
  "kill": "kill-port --port 5173,5174,5175,3000,8080 && pkill -f electron || true",
  "kill:ports": "kill-port --port 5173,5174,5175,3000,8080",
  "kill:electron": "pkill -f electron || true"
}
```

### Client Package Scripts

```json
{
  "dev": "vite",
  "kill": "lsof -ti:5173 | xargs kill -9 || true",
  "kill:ports": "lsof -ti:5173,5174,5175 | xargs kill -9 || true"
}
```

### Desktop Package Scripts

```json
{
  "dev": "concurrently -k \"npm run start:client\" \"wait-on http://localhost:5173 && electron-vite dev\"",
  "start:client": "cd ../client && npm run dev"
}
```

### Library Package Scripts

```json
{
  "dev": "tsc --watch", // or "vite build --watch"
  "kill": "echo 'No processes to kill for [Package] package'"
}
```

## Best Practices

1. **Always use `pnpm kill`** before starting development to ensure clean state
2. **Use package-specific dev scripts** for focused development
3. **Let Turborepo handle dependencies** - don't manually coordinate builds
4. **Trust the process coordination** - desktop app will wait for client
   automatically
5. **Check process logs** if something isn't working as expected

## Dependencies

- **concurrently** - Parallel process execution with coordinated shutdown
- **wait-on** - Service readiness detection
- **kill-port** - Port cleanup utility
- **Turborepo** - Monorepo task orchestration
- **PNPM** - Package manager with workspace support

---

This setup follows 2024 industry best practices for Electron + Vite + Turborepo
development workflows.
