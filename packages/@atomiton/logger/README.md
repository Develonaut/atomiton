# @atomiton/logger

Unified logging system for Atomiton platform with beautiful console output, file
logging, and cross-platform support. Features separate entry points for browser
and desktop environments with functional programming approach.

## Installation

```bash
pnpm add @atomiton/logger
```

## Split Exports Pattern

The logger package uses split exports to optimize bundle sizes and provide
platform-specific functionality:

### Available Exports

```typescript
// Browser export - localStorage persistence, beautiful console output
import { createBrowserLogger } from "@atomiton/logger/browser";

// Desktop export - file logging with electron-log, ANSI colored console
import { createDesktopLogger } from "@atomiton/logger/desktop";

// Note: No main export to prevent bloated bundles
```

### Why Split Exports?

- **Bundle Optimization**: Browser builds exclude Node.js filesystem
  dependencies
- **Platform Safety**: Prevents importing incompatible logging mechanisms
- **Performance**: Desktop version uses electron-log for file output
- **Consistency**: Follows same pattern as other `@atomiton/*` packages

## Quick Start

### Browser Usage

```typescript
import { createBrowserLogger } from "@atomiton/logger/browser";

// Create a logger
const logger = createBrowserLogger({
  level: "info",
  namespace: "app",
});

// Log messages
logger.info("Application started");
logger.debug("Debug information", { userId: "123" });
logger.warn("Warning message", { component: "auth" });
logger.error("Error occurred", { error: error.message });

// Create child loggers
const authLogger = logger.child("auth");
authLogger.info("User authenticated"); // Logs as [app:auth]
```

### Desktop Usage

```typescript
import { createDesktopLogger } from "@atomiton/logger/desktop";

// Create a logger with file output
const logger = createDesktopLogger({
  level: "debug",
  namespace: "conductor",
  outputPath: "./logs/app.log", // Optional, defaults to tmp/logs/atomiton.log
});

// Log messages (goes to both console and file)
logger.info("Conductor initialized");
logger.error("Execution failed", { nodeId: "transform-1", error: "timeout" });

// Child logger inherits file configuration
const nodeLogger = logger.child("node");
nodeLogger.debug("Node executing", { id: "transform-1" });
```

## Core Features

### Beautiful Console Output

Both browser and desktop versions provide rich console formatting:

- **Timestamps**: High-precision timestamps with milliseconds
- **Log Levels**: Color-coded levels with emojis (🔍 ℹ️ ⚠️ ❌)
- **Namespaces**: Hierarchical namespace support (`app:auth:login`)
- **Context**: Structured context objects for debugging
- **Colors**: Platform-appropriate color schemes

### File Logging (Desktop)

Desktop version includes robust file logging:

- **JSON Format**: Structured JSON output for log analysis
- **Automatic Directory Creation**: Creates log directories as needed
- **Configurable Paths**: Custom log file locations
- **Rotation**: Uses electron-log's built-in rotation features
- **Atomic Writes**: Safe concurrent logging

### Browser Persistence

Browser version persists logs to localStorage:

- **Local Storage**: Stores last 1000 log entries
- **JSON Format**: Easy to parse and analyze
- **Fallback**: Graceful handling when localStorage is disabled

## Configuration

### Logger Configuration

```typescript
type LoggerConfig = {
  level?: LogLevel; // "debug" | "info" | "warn" | "error"
  namespace?: string; // Logger namespace
  outputPath?: string; // File path (desktop only)
  colors?: boolean; // Enable/disable colors (default: true)
  format?: "compact" | "detailed" | "json"; // Output format
};
```

### Environment Variables

Control logger behavior with environment variables:

| Variable            | Description                    | Default                 |
| ------------------- | ------------------------------ | ----------------------- |
| `LOG_LEVEL`         | Minimum log level              | `info`                  |
| `ATOMITON_LOG_PATH` | Custom log file path (desktop) | `tmp/logs/atomiton.log` |

### Log Levels

| Level   | Priority | Console   | File  | Description                    |
| ------- | -------- | --------- | ----- | ------------------------------ |
| `debug` | 0        | 🔍 Gray   | DEBUG | Detailed debugging information |
| `info`  | 1        | ℹ️ Blue   | INFO  | General information messages   |
| `warn`  | 2        | ⚠️ Yellow | WARN  | Warning conditions             |
| `error` | 3        | ❌ Red    | ERROR | Error conditions               |

## API Reference

### `createBrowserLogger(config?): Logger`

Creates a browser-optimized logger with localStorage persistence.

```typescript
const logger = createBrowserLogger({
  level: "info",
  namespace: "ui",
  colors: true,
});
```

### `createDesktopLogger(config?): Logger`

Creates a desktop logger with file output using electron-log.

```typescript
const logger = createDesktopLogger({
  level: "debug",
  namespace: "conductor",
  outputPath: "./logs/conductor.log",
  format: "json",
});
```

### Logger Interface

```typescript
interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;

  child(namespace: string): Logger;
  setLevel(level: LogLevel): void;
}

type LogContext = {
  [key: string]: unknown;
};
```

### Logger Methods

#### Log Methods

```typescript
// Basic logging
logger.info("User logged in");

// With context object
logger.error("Database connection failed", {
  database: "users",
  timeout: 5000,
  retries: 3,
});
```

#### `child(namespace: string): Logger`

Create a child logger with extended namespace:

```typescript
const baseLogger = createBrowserLogger({ namespace: "app" });
const authLogger = baseLogger.child("auth");
const loginLogger = authLogger.child("login");

loginLogger.info("Attempt started"); // Logs as [app:auth:login]
```

#### `setLevel(level: LogLevel): void`

Change the log level at runtime:

```typescript
logger.setLevel("debug"); // Show all debug messages
logger.setLevel("error"); // Only show errors
```

## Real-World Examples

### React Application

```typescript
import { createBrowserLogger } from "@atomiton/logger/browser";

const logger = createBrowserLogger({ namespace: "ui" });
const componentLogger = logger.child("editor");

export function Editor() {
  const handleNodeSelect = (nodeId: string) => {
    componentLogger.info("Node selected", { nodeId, timestamp: Date.now() });
  };

  const handleError = (error: Error) => {
    componentLogger.error("Editor error", {
      error: error.message,
      stack: error.stack,
      component: "Editor"
    });
  };

  return (
    // Component JSX
  );
}
```

### Electron Main Process

```typescript
import { createDesktopLogger } from "@atomiton/logger/desktop";

const logger = createDesktopLogger({
  namespace: "main",
  level: "info",
  outputPath: process.env.LOG_PATH,
});

const conductorLogger = logger.child("conductor");

export function startConductor() {
  conductorLogger.info("Starting conductor service");

  try {
    // Initialize conductor
    conductorLogger.info("Conductor started successfully");
  } catch (error) {
    conductorLogger.error("Failed to start conductor", {
      error: error.message,
      config: getConductorConfig(),
    });
    throw error;
  }
}
```

### Testing Setup

```typescript
import { createBrowserLogger } from "@atomiton/logger/browser";

// Test logger with debug level
const testLogger = createBrowserLogger({
  level: "debug",
  namespace: "test",
});

describe("My Component", () => {
  const componentLogger = testLogger.child("component");

  beforeEach(() => {
    componentLogger.debug("Test starting", {
      testName: expect.getState().currentTestName,
    });
  });

  it("should log user actions", () => {
    componentLogger.info("Testing user interaction");
    // Test implementation
  });
});
```

### Express.js Integration

```typescript
import { createDesktopLogger } from "@atomiton/logger/desktop";

const logger = createDesktopLogger({ namespace: "api" });
const requestLogger = logger.child("request");

app.use((req, res, next) => {
  const start = Date.now();

  requestLogger.info("Request started", {
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
  });

  res.on("finish", () => {
    requestLogger.info("Request completed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start,
    });
  });

  next();
});
```

## File Output Format

Desktop logger outputs JSON format to files:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "namespace": "conductor:node",
  "message": "Node execution completed",
  "context": {
    "nodeId": "transform-1",
    "duration": 1234,
    "inputSize": 1024
  }
}
```

## Console Output Format

### Browser Console

```
ℹ️ [10:30:45.123] [INFO ] [conductor] Node execution started
⚠️ [10:30:45.456] [WARN ] [conductor:validation] Input validation warning { field: "email" }
❌ [10:30:45.789] [ERROR] [conductor:node] Execution failed { nodeId: "transform-1", error: "timeout" }
```

### Desktop Console (ANSI Colors)

```
ℹ️ [10:30:45.123] [INFO ] [conductor] Node execution started
⚠️ [10:30:45.456] [WARN ] [conductor:validation] Input validation warning {"field":"email"}
❌ [10:30:45.789] [ERROR] [conductor:node] Execution failed {"nodeId":"transform-1","error":"timeout"}
```

## Performance Considerations

### Browser Optimizations

- Logs stored in localStorage (max 1000 entries)
- Efficient console formatting with CSS
- Minimal memory footprint
- Graceful localStorage failure handling

### Desktop Optimizations

- electron-log handles file I/O efficiently
- Asynchronous file writes
- Built-in log rotation
- ANSI color detection for optimal console output

## Development Tools

### Log Tailing

Use the built-in log tailing script:

```bash
# Tail logs (watches tmp/logs/atomiton.log by default)
pnpm dev

# Or use the script directly
./scripts/tail-logs.sh

# With custom log file
ATOMITON_LOG_FILE=/custom/path.log ./scripts/tail-logs.sh
```

### Environment Configuration

```bash
# Development with debug logs
LOG_LEVEL=debug pnpm dev

# Custom log location
ATOMITON_LOG_PATH=./debug.log pnpm dev

# Production with info level
LOG_LEVEL=info pnpm start
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good - use appropriate levels
logger.debug("Detailed state information", { state });
logger.info("User action completed", { action: "save" });
logger.warn("Deprecated API used", { api: "/old-endpoint" });
logger.error("Operation failed", { error: error.message });

// ❌ Avoid - wrong levels
logger.error("User clicked button"); // Not an error
logger.info("Detailed debug data", { massive: debugObject }); // Too verbose
```

### 2. Use Namespaces for Organization

```typescript
// ✅ Good - hierarchical namespaces
const baseLogger = createBrowserLogger({ namespace: "app" });
const uiLogger = baseLogger.child("ui");
const editorLogger = uiLogger.child("editor");
const nodeLogger = editorLogger.child("node");

// ❌ Avoid - flat namespace chaos
const logger1 = createBrowserLogger({ namespace: "app-ui-editor-node" });
```

### 3. Include Useful Context

```typescript
// ✅ Good - actionable context
logger.error("API request failed", {
  endpoint: "/api/users",
  status: 500,
  duration: 5000,
  retries: 3,
  userId: currentUser.id,
});

// ❌ Avoid - useless context
logger.error("Something went wrong", { time: "now" });
```

### 4. Use Child Loggers for Components

```typescript
// ✅ Good - component-specific loggers
export class NodeEditor {
  private logger = createBrowserLogger({ namespace: "editor" }).child(
    "node-editor",
  );

  handleNodeClick(nodeId: string) {
    this.logger.info("Node selected", { nodeId });
  }
}

// ❌ Avoid - shared global logger
const globalLogger = createBrowserLogger();
export class NodeEditor {
  handleNodeClick(nodeId: string) {
    globalLogger.info("Something happened in node editor");
  }
}
```

### 5. Clean Configuration

```typescript
// ✅ Good - environment-based config
const logger = createDesktopLogger({
  level: (process.env.LOG_LEVEL as LogLevel) || "info",
  namespace: "conductor",
  outputPath: process.env.ATOMITON_LOG_PATH,
});

// ❌ Avoid - hardcoded development config
const logger = createDesktopLogger({
  level: "debug",
  namespace: "test",
  outputPath: "/tmp/debug.log",
});
```

## Migration from Console

Replace direct console usage with logger:

```typescript
// Before
console.log("User logged in");
console.warn("Deprecated feature used");
console.error("Request failed:", error);

// After
const logger = createBrowserLogger({ namespace: "app" });
logger.info("User logged in");
logger.warn("Deprecated feature used");
logger.error("Request failed", { error: error.message });
```

## Troubleshooting

### Common Issues

**Browser: Logs not persisting**

- Check if localStorage is enabled
- Verify you're not in incognito/private mode
- Check browser storage limits

**Desktop: Log files not created**

- Verify write permissions to log directory
- Check if `ATOMITON_LOG_PATH` environment variable is set correctly
- Ensure electron-log dependency is installed

**Console colors not showing**

- Check if terminal supports ANSI colors
- Verify `colors: true` in configuration
- Some CI environments disable colors by default

### Debug Mode

Enable debug logging to troubleshoot logger issues:

```typescript
const logger = createDesktopLogger({ level: "debug", namespace: "debug" });
logger.debug("Logger initialized", logger.getInfo?.());
```

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Development mode with log tailing
pnpm dev

# Build in watch mode
pnpm dev:build
```

## License

MIT
