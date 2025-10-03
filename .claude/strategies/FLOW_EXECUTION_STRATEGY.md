# Flow Execution Strategy

## Purpose

Implement flow execution capability in the debug/flows page, allowing users to
select and execute predefined flow templates with real-time progress reporting
and activity logging.

---

## Current State Analysis

### What We Have

1. **Existing Infrastructure**
   - ✅ NodesPage with two-column layout pattern
   - ✅ `conductor.node.run()` for execution
   - ✅ `fromYaml()` parser for YAML → NodeDefinition
   - ✅ LogsSection component for activity logs
   - ✅ `@atomiton/storage` package with engine auto-detection
   - ✅ Storage RPC channel (needs refactoring to use storage package)
   - ✅ useDebugLogs hook for log management

2. **YAML Flow Templates (Read-Only)**
   - `packages/@atomiton/nodes/src/templates/flows/hello-world.flow.yaml`
   - `packages/@atomiton/nodes/src/templates/flows/data-transform.flow.yaml`
   - `packages/@atomiton/nodes/src/templates/flows/image-processor.flow.yaml`
   - These are bundled examples, not user storage
   - Using `.flow.yaml` double extension for semantic clarity and tooling support

3. **FlowsPage Scaffold**
   - Basic page exists at
     `apps/client/src/templates/DebugPage/pages/FlowsPage.tsx`
   - Has basic flow list/load/save operations
   - Missing: execution, progress tracking, proper layout

### What Needs Fixing

1. **YAML Templates**
   - ❌ Inconsistent structure (some have `flow:` wrapper, some don't)
   - ❌ Some use `data:` for parameters, should be `parameters:`
   - ❌ Edge format inconsistent
   - ❌ Missing proper NodeDefinition structure

2. **FlowsPage**
   - ❌ No two-column layout
   - ❌ No progress bar
   - ❌ No execution capability
   - ❌ No activity logs integration

3. **Storage Integration**
   - ⚠️ `storageChannel` uses in-memory Map (doesn't persist!)
   - ❌ Need to wire to `@atomiton/storage` package
   - ❌ No distinction between templates (read-only) and user storage (persistent)
   - ❌ No credential storage (blocks API-based nodes)

4. **Flow Template Loading**
   - ❌ No RPC channel to serve templates to browser
   - ❌ No way to load templates from bundled directory

---

## Architecture Alignment

### Core Principles

1. **Flows are NodeDefinitions** - A flow is just a NodeDefinition with `nodes`
   array
2. **Reuse Existing Patterns** - Mirror NodesPage layout and execution flow
3. **Simple API** - Parse YAML → execute via `conductor.node.run()`
4. **Progress via Events** - Track execution through child node completion

### Type Alignment

```typescript
// A flow is just a NodeDefinition with child nodes
type Flow = NodeDefinition & {
  nodes: NodeDefinition[]; // Child nodes to execute
  edges?: NodeEdge[]; // Connections between nodes
};

// Execute the same way as any node
const result = await conductor.node.run(flowNodeDefinition);
```

### Package Boundaries

```
@atomiton/nodes/templates/flows     → YAML flow definitions (read-only templates)
@atomiton/nodes/serialization       → fromYaml() parser
@atomiton/conductor                 → execute() function
@atomiton/storage                   → User data persistence (flows, assets, configs)
@atomiton/rpc/storageChannel        → Routes to storage engine (auto-detection)
@atomiton/rpc/flowTemplatesChannel  → Serves read-only templates
@atomiton/rpc/credentialChannel     → Secure credential management (future)
client/templates/DebugPage/pages    → FlowsPage UI
```

---

## Storage vs Templates: Critical Distinction

**This is one of the most important architectural decisions in Atomiton.**

### Two Completely Separate Systems

Atomiton has two distinct content systems that serve different purposes:

| Aspect | Flow Templates | User Storage |
|--------|----------------|--------------|
| **Purpose** | Read-only examples, tutorials | User-created content, assets, configs |
| **Location** | `@atomiton/nodes/templates/flows/` | `~/.atomiton/` (desktop) |
| **Ownership** | `@atomiton/nodes` package | `@atomiton/storage` package |
| **Lifecycle** | Bundled with app, versioned in git | Created at runtime, persists across sessions |
| **API** | `conductor.flowTemplates.*` | `conductor.storage.*` |
| **RPC Channel** | `flowTemplatesChannel` | `storageChannel` |
| **Mutability** | Immutable at runtime | Full CRUD operations |
| **Persistence** | N/A (always available) | Persists to disk/cloud |
| **Future** | Could load from marketplace API | IndexedDB (browser), cloud sync, team sharing |

### Why This Separation Matters

1. **Templates are immutable** - Users can't accidentally corrupt starter examples
2. **Clear learning path** - Start with template, customize, save to storage
3. **Storage is extensible** - Can add assets, configs, credentials independently
4. **Future-proof** - Templates could come from API without affecting storage
5. **Security** - Storage layer handles encryption, backups, sync separately

### User Workflow Example

```typescript
// 1. User browses templates (read-only)
const templates = await conductor.flowTemplates.listTemplates();
// Returns: ['hello-world', 'data-transform', 'image-processor']

// 2. User loads a template to start
const template = await conductor.flowTemplates.getTemplate('hello-world');
// Template is NodeDefinition, never modified on disk

// 3. User customizes in editor
const myFlow = {
  ...template,
  name: 'My Custom Workflow',
  nodes: [...template.nodes, myCustomNode]
};

// 4. User saves to their storage (persistent)
await conductor.storage.saveFlow(myFlow);
// Saved to: ~/.atomiton/flows/{flowId}.yaml

// 5. Later, user loads their saved flow
const savedFlows = await conductor.storage.listFlows();
const myWorkflow = await conductor.storage.loadFlow(myFlow.id);

// 6. Original template remains unchanged
const originalTemplate = await conductor.flowTemplates.getTemplate('hello-world');
// Still the same as step 2!
```

### Storage Architecture

#### Data Flow: Browser → RPC → Storage → Disk

```
┌────────────────────────────────────────────────────────────────┐
│                     Browser (Renderer Process)                  │
│                                                                 │
│  conductor.storage.save('flows/my-flow', flowData)            │
└───────────────────────────┬────────────────────────────────────┘
                            │ IPC (via @atomiton/rpc)
┌───────────────────────────▼────────────────────────────────────┐
│              Desktop (Main Process) - storageChannel            │
│                                                                 │
│  createStorage() ← Auto-detection based on platform           │
└───────────────────────────┬────────────────────────────────────┘
                            │
            ┌───────────────┴──────────────┐
            ↓                              ↓
┌─────────────────────┐         ┌──────────────────────┐
│ FileSystemEngine    │         │  MemoryEngine        │
│ (Desktop)           │         │  (Browser - temp)    │
│                     │         │                      │
│ ~/.atomiton/        │         │  RAM only            │
│ ├── flows/          │         │  (warning shown)     │
│ ├── assets/         │         │                      │
│ ├── configs/        │         │  Future: IndexedDB   │
│ └── credentials/    │         │                      │
└─────────────────────┘         └──────────────────────┘
```

#### Storage Namespaces

User data is organized by type in separate namespaces:

**Active Implementation (Phase 2.5)**:
- `flows/{flowId}.yaml` - User-saved flows

**Future Implementation** (stubbed with comments):
- `assets/images/{id}` - User images and files
- `assets/data/{id}` - Data files (CSV, JSON)
- `configs/nodes/{nodeType}.yaml` - Per-node configuration
- `configs/app.yaml` - Application preferences
- `cache/{key}` - Temporary cached data

**Security Critical** (requires research - Phase 2.5.X):
- `credentials/{id}.encrypted` - API keys, tokens, secrets
  - ⚠️ Must use OS keychain (Electron safeStorage)
  - ⚠️ Never store credentials in flow files!
  - ⚠️ Research required before implementation

#### Directory Structure (Desktop)

```
~/.atomiton/                          # User data directory
├── flows/                            # ✅ Phase 2.5
│   ├── flow-abc123.yaml             # User-saved flow
│   └── flow-def456.yaml
├── assets/                           # 🔲 Future
│   ├── images/
│   └── data/
├── configs/                          # 🔲 Future
│   ├── nodes/
│   └── app.yaml
├── credentials/                      # 🔒 Security critical (future)
│   └── index.json                   # Metadata only (references keychain)
├── cache/                            # 🔲 Future
├── logs/                             # 🔲 Future
└── backups/                          # 🔲 Future
```

---

## UI Design - Two Column Layout

### Layout Structure (Mirrors NodesPage)

```
┌──────────────────────────────────┬────────────────────────────────────┐
│ LEFT COLUMN                      │ RIGHT COLUMN                       │
│ Flow Selection & Control         │ Execution Monitor                  │
│                                  │                                    │
│ ┌────────────────────────────┐   │ ┌──────────────────────────────┐   │
│ │ Flow Actions               │   │ │ Execution Progress           │   │
│ │ ┌──┐ ┌──┐ ┌────┐ ┌───┐    │   │ │                              │   │
│ │ │📥│ │💾│ │⬇️DL│ │▶️│    │   │ │  ████████████░░░░░░  60%     │   │
│ │ └──┘ └──┘ └────┘ └───┘    │   │ │  Node 3/5: transform         │   │
│ │ Load Save Down  Run        │   │ │                              │   │
│ │ (disabled)    (enabled)    │   │ └──────────────────────────────┘   │
│ └────────────────────────────┘   │                                    │
│                                  │ ┌──────────────────────────────┐   │
│ ┌────────────────────────────┐   │ │ Activity Logs                │   │
│ │ Available Flows:           │   │ │                              │   │
│ │                            │   │ │ 🚀 Executing hello-world...  │   │
│ │ ○ Hello World Flow         │   │ │ ✅ Node 1: edit-fields       │   │
│ │ ● Data Transform Pipeline  │   │ │    - Created message data    │   │
│ │ ○ Image Processing Batch   │   │ │ ✅ Node 2: transform         │   │
│ │                            │   │ │    - Formatted content       │   │
│ │ (3 flows available)        │   │ │ ⏳ Node 3: file-system       │   │
│ │                            │   │ │    - Writing to disk...      │   │
│ │                            │   │ │                              │   │
│ └────────────────────────────┘   │ │ (scrollable log area)        │   │
│                                  │ └──────────────────────────────┘   │
└──────────────────────────────────┴────────────────────────────────────┘
```

### Component Breakdown

**Left Column Components:**

- `FlowActionButtons` - Action buttons (Load/Save/Download/Run)
- `FlowSelector` - Radio list of available flows
- Similar structure to `NodeTypeSelector`

**Right Column Components:**

- `FlowProgressBar` - Progress indicator (current/total nodes)
- `LogsSection` - Reuse existing component from NodesPage

---

## YAML Template Structure Requirements

### Standard Flow YAML Format

```yaml
# Root level - NodeDefinition fields
id: "flow-unique-id"
name: "Flow Display Name"
description: "What this flow does"
type: "group" # REQUIRED: indicates this is a group/flow
version: "1.0.0"

# Metadata (optional but recommended)
metadata:
  author: "Atomiton Team"
  category: "data"
  tags: ["example", "etl"]
  icon: "workflow"

# Child nodes - array of NodeDefinitions
nodes:
  - id: "node-1"
    type: "http-request"
    name: "Fetch Data"
    version: "1.0.0"
    parameters:
      url: "https://api.example.com/data"
      method: "GET"
    position:
      x: 100
      y: 100

  - id: "node-2"
    type: "transform"
    name: "Process Data"
    version: "1.0.0"
    parameters:
      operation: "map"
      transformFunction: "item => ({ ...item, processed: true })"
    position:
      x: 300
      y: 100

# Edges - connections between nodes
edges:
  - id: "edge-1"
    source: "node-1"
    target: "node-2"
    sourceHandle: "output"
    targetHandle: "input"
```

### Common Issues to Fix

❌ **Wrong: `flow:` wrapper**

```yaml
flow:
  version: "1.0"
  data:
    nodes: [...]
```

✅ **Correct: Direct NodeDefinition**

```yaml
id: "flow-id"
type: "group"
nodes: [...]
```

❌ **Wrong: `data:` for parameters**

```yaml
nodes:
  - id: "node-1"
    type: "transform"
    data:
      expression: "return x + 1"
```

✅ **Correct: `parameters:` field**

```yaml
nodes:
  - id: "node-1"
    type: "transform"
    parameters:
      expression: "return x + 1"
```

❌ **Wrong: String edges**

```yaml
edges:
  - id: "edge-1"
    source: "node-1"
    target: "node-2"
```

✅ **Correct: Full edge objects**

```yaml
edges:
  - id: "edge-1"
    source: "node-1"
    target: "node-2"
    sourceHandle: "output"
    targetHandle: "input"
```

---

## Implementation Plan

### Phase 1: Fix YAML Templates ⚙️

**Objective:** Standardize all flow templates to proper NodeDefinition structure

#### Step 1.1: Rename Directory

```bash
# Rename templates directory
cd packages/@atomiton/nodes/src/templates
mv yaml flows
```

#### Step 1.2: Fix hello-world.yaml

**Current Issues:**

- Has `flow:` wrapper
- Uses nested `data:` structure
- Edge format missing handles

**Fix:**

```yaml
id: "hello-world-flow"
name: "Hello World Flow"
description: "Simple flow that creates data and writes it to a file"
type: "group"
version: "1.0.0"

metadata:
  author: "Atomiton Team"
  category: "example"
  tags: ["example", "beginner", "hello-world"]
  icon: "smile"

nodes:
  - id: "create-message"
    type: "edit-fields"
    name: "Create Message"
    version: "1.0.0"
    parameters:
      values:
        message: "Hello World from Atomiton!"
        timestamp: "{{$now}}"
      keepOnlySet: true
    position:
      x: 100
      y: 200

  - id: "format-content"
    type: "transform"
    name: "Format Content"
    version: "1.0.0"
    parameters:
      operation: "map"
      transformFunction: |
        item => `${item.message}\n\nGenerated at: ${item.timestamp}`
    position:
      x: 300
      y: 200

  - id: "write-to-file"
    type: "file-system"
    name: "Write To File"
    version: "1.0.0"
    parameters:
      operation: "write"
      path: "/Users/Ryan/Desktop/hello-world.txt"
      encoding: "utf8"
      createDirectories: true
      overwrite: true
    position:
      x: 500
      y: 200

edges:
  - id: "edge-1"
    source: "create-message"
    target: "format-content"
    sourceHandle: "output"
    targetHandle: "input"
  - id: "edge-2"
    source: "format-content"
    target: "write-to-file"
    sourceHandle: "output"
    targetHandle: "input"
```

**Validation:**

```bash
# Test YAML parsing
node -e "
const { fromYaml } = require('./packages/@atomiton/nodes/dist/serialization/fromYaml.js');
const fs = require('fs');
const yaml = fs.readFileSync('./packages/@atomiton/nodes/src/templates/flows/hello-world.yaml', 'utf8');
const node = fromYaml(yaml);
console.log('Parsed:', JSON.stringify(node, null, 2));
"
```

#### Step 1.3: Fix data-transform.yaml

**Current Issues:**

- Already closer to correct format but has redundant metadata
- `data:` field instead of `parameters:`
- Missing `type: "group"` at root

**Key Changes:**

- Add `type: "group"` at root
- Change all `data:` → `parameters:`
- Remove redundant nested metadata in child nodes
- Simplify edge structure

#### Step 1.4: Fix image-processor.yaml

**Current Issues:**

- Same as data-transform
- Complex nested structure needs flattening

**Key Changes:**

- Add `type: "group"` at root
- Change all `data:` → `parameters:`
- Flatten metadata structure
- Fix edge references

### Phase 2: Create Flow Loading System 📦

**Objective:** Load flow templates into the FlowsPage

#### Step 2.1: Create Flow Loader Utility

```typescript
// packages/@atomiton/nodes/src/templates/flows/index.ts

import { fromYaml } from "#serialization/fromYaml.js";
import type { NodeDefinition } from "#core/types/definition.js";
import { readFileSync } from "fs";
import { join } from "path";

export interface FlowTemplate {
  id: string;
  name: string;
  description?: string;
  filename: string;
  definition: NodeDefinition;
}

const FLOW_TEMPLATES = [
  {
    filename: "hello-world.flow.yaml",
    id: "hello-world-flow",
    name: "Hello World Flow",
  },
  {
    filename: "data-transform.flow.yaml",
    id: "data-transform-flow",
    name: "Data Transform Pipeline",
  },
  {
    filename: "image-processor.flow.yaml",
    id: "image-processor-flow",
    name: "Image Processing Workflow",
  },
];

export function loadFlowTemplates(): FlowTemplate[] {
  return FLOW_TEMPLATES.map((template) => {
    const yamlPath = join(__dirname, template.filename);
    const yamlContent = readFileSync(yamlPath, "utf8");
    const definition = fromYaml(yamlContent);

    return {
      ...template,
      description: definition.description,
      definition,
    };
  });
}

export function getFlowTemplate(id: string): NodeDefinition | null {
  const templates = loadFlowTemplates();
  const template = templates.find((t) => t.id === id);
  return template?.definition || null;
}
```

#### Step 2.2: Add RPC Channel for Flow Templates

```typescript
// packages/@atomiton/rpc/src/main/channels/flowTemplatesChannel.ts

import { createChannelServer } from "#main/channels/createChannelServer";
import type { IpcMain } from "electron";
import {
  loadFlowTemplates,
  getFlowTemplate,
} from "@atomiton/nodes/templates/flows";

export const createFlowTemplatesChannelServer = (ipcMain: IpcMain) => {
  const server = createChannelServer("flowTemplates", ipcMain);

  server.handle("listTemplates", async () => {
    const templates = loadFlowTemplates();
    return {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        nodeCount: t.definition.nodes?.length || 0,
      })),
    };
  });

  server.handle("getTemplate", async (params: { id: string }) => {
    const definition = getFlowTemplate(params.id);
    if (!definition) {
      throw new Error(`Flow template ${params.id} not found`);
    }
    return { definition };
  });

  return server;
};
```

### Phase 2.5: User Storage Integration 💾

**Objective:** Wire `storageChannel` to use `@atomiton/storage` package for persistent flow save/load

**CRITICAL DISTINCTION**: This phase implements USER STORAGE (persistent user data), NOT flow templates (read-only examples)

#### Step 2.5.0: Simplify Storage Layer - String-Based Only

**ARCHITECTURAL DECISION**: Keep storage layer dumb - it only handles string read/write.

**Current Issue**: Storage layer tries to do JSON serialization, creating tight coupling.

**Better Approach**: Storage layer just writes/reads strings. Caller (storageChannel) handles serialization.

**Fix Required:**

```typescript
// packages/@atomiton/storage/src/factories/utils/fileOperations.ts

// Remove JSON.stringify/parse - just work with strings!

export async function writeDataToFile(
  filepath: string,
  content: string, // Changed: accept pre-serialized string
  key: string,
): Promise<void> {
  try {
    await fs.writeFile(filepath, content, 'utf-8');
  } catch (error) {
    throw new StorageError(
      `Failed to save data: ${key}`,
      'WRITE_ERROR',
      error instanceof Error ? error : new Error(String(error)),
      { key, operation: 'save' }
    );
  }
}

export async function readDataFromFile(
  filepath: string,
  key: string,
): Promise<string> { // Changed: return raw string
  try {
    return await fs.readFile(filepath, 'utf-8');
  } catch (error) {
    throw new StorageError(
      `Failed to load data: ${key}`,
      'READ_ERROR',
      error instanceof Error ? error : new Error(String(error)),
      { key, operation: 'load' }
    );
  }
}
```

Update `createFileSystemStorage.ts`:

```typescript
async save(
  key: string,
  data: string, // Changed: expect pre-serialized string
  options?: StorageOptions,
): Promise<void> {
  const format = options?.format || 'yaml';
  const filepath = getFilePath(baseDir, key, format);

  await ensureDirectory(filepath, key);
  await writeDataToFile(filepath, data, key);
}

async load(key: string): Promise<string> { // Changed: return raw string
  const yamlPath = getFilePath(baseDir, key, 'yaml');
  const jsonPath = getFilePath(baseDir, key, 'json');

  const filepath = await findExistingFile(key, yamlPath, jsonPath);
  return readDataFromFile(filepath, key);
}
```

Update type definition:

```typescript
// packages/@atomiton/storage/src/types.ts

export interface IStorageEngine {
  save(key: string, data: string, options?: StorageOptions): Promise<void>;
  load(key: string): Promise<string>;
  list(prefix?: string): Promise<StorageItem[]>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getInfo(): StorageInfo;
}
```

**Then handle serialization in storageChannel** (where domain knowledge lives):

```typescript
// packages/@atomiton/rpc/src/main/channels/storageChannel.ts

import { toYaml } from '@atomiton/nodes/serialization/toYaml';
import { fromYaml } from '@atomiton/nodes/serialization/fromYaml';

server.handle('saveFlow', async (params: SaveFlowParams) => {
  const flowNode: NodeDefinition = { /* ... */ };

  // Serialize to YAML here (domain logic, not storage logic)
  const yamlContent = toYaml(flowNode);

  // Storage just writes the string
  await storage.save(`flows/${flowId}`, yamlContent, { format: 'yaml' });
});

server.handle('loadFlow', async (params: LoadFlowParams) => {
  // Storage just reads the string
  const yamlContent = await storage.load(`flows/${flowId}`);

  // Deserialize from YAML here (domain logic)
  const node = fromYaml(yamlContent);

  return { /* map to result */ };
});
```

**Note on `list()` metadata extraction:**

The `walkDirectory()` function in `fileOperations.ts` currently parses JSON to extract metadata for the `StorageItem` results. This is acceptable because:
1. It's read-only (doesn't affect save/load contract)
2. It's optional (metadata extraction can fail gracefully)
3. It provides better UX (shows flow names in list results)

However, we should update it to handle YAML files:

```typescript
// In walkDirectory(), update metadata extraction:
try {
  const content = await fs.readFile(fullPath, 'utf-8');

  // Try to parse as YAML first (our preferred format), fall back to JSON
  let data: unknown;
  if (fullPath.endsWith('.yaml')) {
    data = fromYaml(content);
  } else {
    data = JSON.parse(content);
  }

  if (isCompositeData(data)) {
    name = data.name || key;
    metadata = { ...data.metadata };
  }
} catch {
  // Skip metadata extraction if file can't be parsed
}
```

**Benefits:**
- ✅ Storage layer is dumb infrastructure (just file I/O)
- ✅ Domain logic (YAML/JSON serialization) stays in domain layer (conductor/rpc)
- ✅ Storage can be used for any string content (logs, configs, etc.)
- ✅ No tight coupling to NodeDefinition types (except optional metadata extraction)
- ✅ Easier to test and maintain

**Validation:**
```bash
# Same validation - files should be YAML on disk
cat ~/.atomiton/flows/*.yaml

# Should see actual YAML format
```

#### Step 2.5.1: Refactor storageChannel Implementation

Replace the in-memory Map with proper `@atomiton/storage` package integration:

```typescript
// packages/@atomiton/rpc/src/main/channels/storageChannel.ts

import { createChannelServer, type ChannelServer } from '#main/channels/createChannelServer';
import { createStorage } from '@atomiton/storage/exports/desktop';
import type { IStorageEngine } from '@atomiton/storage';
import type { NodeDefinition } from '@atomiton/nodes/definitions';
import type { IpcMain } from 'electron';

// Type definitions remain the same
export type SaveFlowParams = {
  flow: {
    id?: string;
    name: string;
    nodes: NodeDefinition[];
    edges?: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    metadata?: Record<string, unknown>;
  };
};

export type SaveFlowResult = {
  id: string;
  savedAt: string;
  version: string;
};

export type LoadFlowParams = {
  id: string;
};

export type LoadFlowResult = {
  id: string;
  name: string;
  nodes: NodeDefinition[];
  edges?: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  metadata?: Record<string, unknown>;
  savedAt: string;
  version: string;
};

export type ListFlowsParams = {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'savedAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export type ListFlowsResult = {
  flows: Array<{
    id: string;
    name: string;
    nodeCount: number;
    savedAt: string;
    updatedAt: string;
    version: string;
  }>;
  total: number;
};

export type DeleteFlowParams = {
  id: string;
};

export const createStorageChannelServer = (ipcMain: IpcMain): ChannelServer => {
  const server = createChannelServer('storage', ipcMain);

  // ========================================
  // AUTO-DETECT STORAGE ENGINE
  // ========================================
  // Uses @atomiton/storage package with auto-detection
  // Desktop: FileSystemEngine → ~/.atomiton/
  // Browser: MemoryEngine (temporary, with warning)
  const storage: IStorageEngine = createStorage();

  // Log storage info for debugging
  const info = storage.getInfo();
  console.log('Storage engine initialized:', {
    type: info.type,
    platform: info.platform,
    connected: info.connected
  });

  // ========================================
  // FLOW STORAGE (Active Implementation)
  // ========================================

  server.handle('saveFlow', async (params: unknown): Promise<SaveFlowResult> => {
    const typedParams = params as SaveFlowParams;
    const flowId = typedParams.flow.id || crypto.randomUUID();
    const now = new Date().toISOString();

    // Convert to NodeDefinition
    const flowNode: NodeDefinition = {
      id: flowId,
      type: 'group',
      name: typedParams.flow.name,
      version: '1.0.0',
      nodes: typedParams.flow.nodes,
      edges: typedParams.flow.edges,
      metadata: {
        ...typedParams.flow.metadata,
        nodeCount: typedParams.flow.nodes.length,
        edgeCount: typedParams.flow.edges?.length || 0,
        createdAt: now,
        updatedAt: now
      }
    };

    // Save using storage engine with proper namespace
    const key = `flows/${flowId}`;
    await storage.save(key, flowNode, {
      format: 'yaml',
      metadata: {
        name: flowNode.name,
        nodeCount: flowNode.nodes?.length || 0,
        createdBy: 'user'
      }
    });

    console.log('User flow saved:', { key, name: flowNode.name });

    // Broadcast flow saved event
    server.broadcast('flowSaved', {
      id: flowId,
      name: typedParams.flow.name,
      savedAt: now
    });

    return {
      id: flowId,
      savedAt: now,
      version: '1.0.0'
    };
  });

  server.handle('loadFlow', async (params: unknown): Promise<LoadFlowResult> => {
    const typedParams = params as LoadFlowParams;
    const key = `flows/${typedParams.id}`;

    // Check if flow exists
    const exists = await storage.exists(key);
    if (!exists) {
      throw new Error(`Flow ${typedParams.id} not found in user storage`);
    }

    // Load from storage engine
    const node = await storage.load(key) as NodeDefinition;

    console.log('User flow loaded:', { key, name: node.name });

    return {
      id: node.id,
      name: node.name || 'Unnamed Flow',
      nodes: node.nodes || [],
      edges: node.edges || [],
      metadata: node.metadata,
      savedAt: (node.metadata?.updatedAt as string) || new Date().toISOString(),
      version: node.version || '1.0.0'
    };
  });

  server.handle('listFlows', async (params: unknown): Promise<ListFlowsResult> => {
    const typedParams = (params || {}) as ListFlowsParams;
    const {
      limit = 50,
      offset = 0,
      sortBy = 'savedAt',
      sortOrder = 'desc'
    } = typedParams;

    // List all flows from storage
    const items = await storage.list('flows/');

    // Map to flow metadata
    const flows = items.map(item => ({
      id: item.key.replace('flows/', '').replace('.yaml', ''),
      name: item.name,
      nodeCount: (item.metadata?.nodeCount as number) || 0,
      savedAt: item.created,
      updatedAt: item.updated,
      version: '1.0.0'
    }));

    // Sort flows
    flows.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'savedAt':
          aValue = a.savedAt;
          bValue = b.savedAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          aValue = a.savedAt;
          bValue = b.savedAt;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const paginatedFlows = flows.slice(offset, offset + limit);

    console.log('User flows listed:', {
      total: flows.length,
      returned: paginatedFlows.length,
      limit,
      offset
    });

    return {
      flows: paginatedFlows,
      total: flows.length
    };
  });

  server.handle('deleteFlow', async (params: unknown): Promise<void> => {
    const typedParams = params as DeleteFlowParams;
    const key = `flows/${typedParams.id}`;

    // Check if flow exists
    const exists = await storage.exists(key);
    if (!exists) {
      throw new Error(`Flow ${typedParams.id} not found in user storage`);
    }

    // Delete from storage
    await storage.delete(key);

    console.log('User flow deleted:', { key });

    // Broadcast flow deleted event
    server.broadcast('flowDeleted', {
      id: typedParams.id,
      deletedAt: new Date().toISOString()
    });
  });

  server.handle('health', async (): Promise<{ status: string; storageType: string }> => {
    const info = storage.getInfo();
    return {
      status: info.connected ? 'ok' : 'disconnected',
      storageType: info.type
    };
  });

  // ========================================
  // ASSET STORAGE (Future - Stub)
  // ========================================

  // TODO: Implement asset storage for user files, images, data
  // Use cases:
  //   - Image files referenced by image-processor nodes
  //   - CSV/JSON data files for data-transform nodes
  //   - Binary assets (fonts, PDFs, etc.)
  //
  // API Design:
  // server.handle('saveAsset', async (params: {
  //   id: string;
  //   type: 'image' | 'data' | 'binary';
  //   data: Buffer | string;
  //   metadata?: Record<string, unknown>;
  // }) => {
  //   const key = `assets/${params.type}/${params.id}`;
  //   await storage.save(key, params.data, { metadata: params.metadata });
  // });
  //
  // server.handle('loadAsset', async (params: { id: string; type: string }) => {
  //   const key = `assets/${params.type}/${params.id}`;
  //   return await storage.load(key);
  // });
  //
  // server.handle('listAssets', async (params: { type?: string }) => {
  //   const prefix = params.type ? `assets/${params.type}/` : 'assets/';
  //   return await storage.list(prefix);
  // });

  // ========================================
  // CONFIG STORAGE (Future - Stub)
  // ========================================

  // TODO: Implement config storage for app and node settings
  // Use cases:
  //   - Per-node type configuration (defaults, presets)
  //   - Application preferences (theme, layout, etc.)
  //   - User-specific settings
  //
  // API Design:
  // server.handle('saveConfig', async (params: {
  //   scope: 'app' | 'node';
  //   key: string;
  //   data: Record<string, unknown>;
  // }) => {
  //   const configKey = params.scope === 'app'
  //     ? `configs/app/${params.key}`
  //     : `configs/nodes/${params.key}`;
  //   await storage.save(configKey, params.data, { format: 'yaml' });
  // });
  //
  // server.handle('loadConfig', async (params: { scope: string; key: string }) => {
  //   const configKey = `configs/${params.scope}/${params.key}`;
  //   return await storage.load(configKey);
  // });

  // ========================================
  // CREDENTIAL STORAGE (Future - SECURITY CRITICAL)
  // ========================================

  // ⚠️ SECURITY RESEARCH REQUIRED BEFORE IMPLEMENTATION ⚠️
  //
  // Assignment: Guilliman agent
  // Blocking: API-based nodes (http-request, database nodes, cloud service nodes)
  //
  // Requirements:
  // 1. Platform keychain integration via Electron safeStorage API
  //    - macOS: Keychain Services
  //    - Windows: Credential Manager (DPAPI)
  //    - Linux: libsecret/gnome-keyring (with fallback warning)
  //
  // 2. Two-tier storage pattern:
  //    Tier 1: OS Keychain (encrypted credential values)
  //    Tier 2: Filesystem (metadata only - no secrets!)
  //
  // 3. Never store credentials in flow files!
  //    Flows reference credentials by ID:
  //    ```yaml
  //    - type: "http-request"
  //      parameters:
  //        url: "https://api.example.com"
  //        credentialId: "cred_123"  # ✅ Reference only
  //        # apiKey: "sk-abc..."     # ❌ NEVER THIS!
  //    ```
  //
  // 4. Secret detection before flow save:
  //    - Scan for common secret patterns (AWS, GitHub, Stripe, etc.)
  //    - Block save if secrets detected
  //    - Provide migration suggestion
  //
  // 5. Access control:
  //    - Only certain node types can access credentials
  //    - Usage tracking and audit logging
  //    - User permission prompts
  //
  // Research Resources:
  //   - Electron safeStorage: https://www.electronjs.org/docs/latest/api/safe-storage
  //   - VS Code credential storage (migrated from keytar to safeStorage in v1.80)
  //   - 1Password local vault architecture
  //   - OWASP credential storage guidelines
  //
  // Future API Design (DO NOT IMPLEMENT YET):
  // server.handle('saveCredential', async (params: {
  //   type: 'api-key' | 'oauth' | 'basic-auth';
  //   name: string;
  //   data: CredentialData;
  // }) => {
  //   // Research required for secure implementation
  //   throw new Error('Credential storage not yet implemented - research phase');
  // });

  return server;
};
```

#### Step 2.5.2: Validation Commands

Test that user flows persist to disk:

```bash
# 1. Start the application
pnpm dev

# 2. In browser console, save a test flow
await conductor.storage.saveFlow({
  name: 'My Test Flow',
  nodes: [
    {
      type: 'httpRequest',
      parameters: { url: 'https://example.com' }
    }
  ]
});

# 3. Verify file was created on disk with .flow.yaml extension
ls ~/.atomiton/flows/
cat ~/.atomiton/flows/*.flow.yaml

# 4. Close and restart the application
# Press Ctrl+C, then run pnpm dev again

# 5. In browser console, list flows
const flows = await conductor.storage.listFlows();
console.log(flows);
// Should show 'My Test Flow' - it persisted!

# 6. Load the saved flow
const flow = await conductor.storage.loadFlow(flows.flows[0].id);
console.log(flow);

# 7. Verify templates are separate system
const templates = await conductor.flowTemplates.listTemplates();
console.log(templates);
// Should show 'Hello World', 'Data Transform', etc. (different from user flows)
```

#### Step 2.5.3: Success Criteria

- [ ] `storageChannel.ts` refactored to use `@atomiton/storage`
- [ ] Storage auto-detection working (FileSystemEngine for desktop)
- [ ] User flows persist to `~/.atomiton/flows/*.flow.yaml` (double extension)
- [ ] `conductor.storage.saveFlow()` writes to disk with .flow.yaml extension
- [ ] `conductor.storage.loadFlow()` reads from disk
- [ ] `conductor.storage.listFlows()` shows user flows only
- [ ] Flows survive app restart (persistence verified)
- [ ] Asset/Config/Credential handlers stubbed with TODO comments
- [ ] Clear distinction between templates (read-only) and storage (user data)

### Phase 3: Build FlowsPage UI 🎨

**Objective:** Create two-column layout with flow selection and execution

#### Step 3.1: Create FlowSelector Component

```typescript
// apps/client/src/templates/DebugPage/components/FlowSelector.tsx

import type { FlowTemplate } from '@atomiton/nodes/templates/flows';

interface FlowSelectorProps {
  flows: FlowTemplate[];
  selectedFlowId: string | null;
  onSelectFlow: (id: string) => void;
  disabled?: boolean;
}

export function FlowSelector({
  flows,
  selectedFlowId,
  onSelectFlow,
  disabled = false,
}: FlowSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Available Flows ({flows.length})
      </label>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {flows.map((flow) => (
          <label
            key={flow.id}
            className={`
              flex items-start p-3 rounded-lg border cursor-pointer
              transition-colors
              ${selectedFlowId === flow.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="flow"
              value={flow.id}
              checked={selectedFlowId === flow.id}
              onChange={() => onSelectFlow(flow.id)}
              disabled={disabled}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{flow.name}</div>
              {flow.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {flow.description}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {flow.nodeCount || 0} nodes
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
```

#### Step 3.2: Create FlowActionButtons Component

```typescript
// apps/client/src/templates/DebugPage/components/FlowActionButtons.tsx

import { Button, Icon } from '@atomiton/ui';

interface FlowActionButtonsProps {
  selectedFlowId: string | null;
  isExecuting: boolean;
  onRun: () => void;
  onLoad?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
}

export function FlowActionButtons({
  selectedFlowId,
  isExecuting,
  onRun,
  onLoad,
  onSave,
  onDownload,
}: FlowActionButtonsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={onLoad}
        disabled={true}
        variant="outline"
        size="sm"
      >
        <Icon name="upload" className="w-4 h-4 mr-2" />
        Load
      </Button>
      <Button
        onClick={onSave}
        disabled={true}
        variant="outline"
        size="sm"
      >
        <Icon name="save" className="w-4 h-4 mr-2" />
        Save
      </Button>
      <Button
        onClick={onDownload}
        disabled={true}
        variant="outline"
        size="sm"
      >
        <Icon name="download" className="w-4 h-4 mr-2" />
        Download
      </Button>
      <Button
        onClick={onRun}
        disabled={!selectedFlowId || isExecuting}
        variant="default"
        size="sm"
      >
        <Icon name={isExecuting ? "loader" : "play"} className="w-4 h-4 mr-2" />
        {isExecuting ? "Running..." : "Run"}
      </Button>
    </div>
  );
}
```

#### Step 3.3: Create FlowProgressBar Component

```typescript
// apps/client/src/templates/DebugPage/components/FlowProgressBar.tsx

interface FlowProgressBarProps {
  currentNode: number;
  totalNodes: number;
  currentNodeName?: string;
  isExecuting: boolean;
}

export function FlowProgressBar({
  currentNode,
  totalNodes,
  currentNodeName,
  isExecuting,
}: FlowProgressBarProps) {
  const percentage = totalNodes > 0
    ? Math.round((currentNode / totalNodes) * 100)
    : 0;

  if (!isExecuting && currentNode === 0) {
    return null; // Hide when not executing
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Execution Progress</span>
        <span>
          {currentNode} / {totalNodes} nodes ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isExecuting ? 'bg-blue-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {currentNodeName && (
        <div className="text-sm text-gray-600">
          Current: <span className="font-medium">{currentNodeName}</span>
        </div>
      )}
    </div>
  );
}
```

#### Step 3.4: Update FlowsPage Layout

```typescript
// apps/client/src/templates/DebugPage/pages/FlowsPage.tsx

import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";
import { FlowSelector } from "#templates/DebugPage/components/FlowSelector";
import { FlowActionButtons } from "#templates/DebugPage/components/FlowActionButtons";
import { FlowProgressBar } from "#templates/DebugPage/components/FlowProgressBar";
import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { useEffect } from "react";

export default function FlowsPage() {
  const {
    availableFlows,
    selectedFlowId,
    setSelectedFlowId,
    isExecuting,
    progress,
    executeFlow,
    loadFlowTemplates,
  } = useFlowOperations();

  // Load flow templates on mount
  useEffect(() => {
    loadFlowTemplates();
  }, [loadFlowTemplates]);

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN: Flow Selection & Control */}
      <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h3 className="text-lg font-semibold mb-4">Flow Builder</h3>
          <FlowActionButtons
            selectedFlowId={selectedFlowId}
            isExecuting={isExecuting}
            onRun={executeFlow}
          />
        </div>

        {/* Scrollable Flow List */}
        <div className="flex-1 overflow-y-auto p-6">
          <FlowSelector
            flows={availableFlows}
            selectedFlowId={selectedFlowId}
            onSelectFlow={setSelectedFlowId}
            disabled={isExecuting}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Execution Monitor */}
      <div className="flex flex-col gap-6 h-full">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <FlowProgressBar
            currentNode={progress.currentNode}
            totalNodes={progress.totalNodes}
            currentNodeName={progress.currentNodeName}
            isExecuting={isExecuting}
          />
        </div>

        {/* Activity Logs */}
        <div className="flex-1 overflow-hidden">
          <LogsSection />
        </div>
      </div>
    </div>
  );
}
```

### Phase 4: Implement Flow Execution 🚀

**Objective:** Execute flows with progress tracking

#### Step 4.1: Enhance useFlowOperations Hook

```typescript
// apps/client/src/templates/DebugPage/hooks/useFlowOperations.ts

import { useState, useCallback } from "react";
import conductor from "#lib/conductor";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

interface FlowTemplate {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
}

interface ExecutionProgress {
  currentNode: number;
  totalNodes: number;
  currentNodeName?: string;
}

export function useFlowOperations() {
  const { addLog } = useDebugLogs();

  const [availableFlows, setAvailableFlows] = useState<FlowTemplate[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState<ExecutionProgress>({
    currentNode: 0,
    totalNodes: 0,
  });

  // Load flow templates from backend
  const loadFlowTemplates = useCallback(async () => {
    try {
      addLog("📦 Loading flow templates...");
      const response = await conductor.flowTemplates.listTemplates();
      setAvailableFlows(response.templates);
      addLog(`✅ Loaded ${response.templates.length} flow templates`);
    } catch (error) {
      addLog(`❌ Error loading flow templates: ${error}`);
      console.error("Error loading flow templates:", error);
    }
  }, [addLog]);

  // Execute selected flow
  const executeFlow = useCallback(async () => {
    if (!selectedFlowId) {
      addLog("❌ No flow selected");
      return;
    }

    try {
      setIsExecuting(true);
      addLog(`🚀 Executing flow: ${selectedFlowId}`);

      // Get flow template
      const response = await conductor.flowTemplates.getTemplate({
        id: selectedFlowId,
      });
      const flowDefinition = response.definition as NodeDefinition;

      // Initialize progress
      const totalNodes = flowDefinition.nodes?.length || 0;
      setProgress({
        currentNode: 0,
        totalNodes,
        currentNodeName: undefined,
      });
      addLog(`📊 Flow has ${totalNodes} nodes to execute`);

      // Execute flow
      const executionId = `flow_exec_${Date.now()}`;

      // Set up progress tracking (simplified for MVP)
      let completedNodes = 0;

      const result = await conductor.node.run(flowDefinition, {
        executionId,
        onNodeComplete: (nodeId: string, nodeName: string) => {
          completedNodes++;
          setProgress({
            currentNode: completedNodes,
            totalNodes,
            currentNodeName: nodeName,
          });
          addLog(
            `  ✅ [${completedNodes}/${totalNodes}] ${nodeName} completed`,
          );
        },
      });

      // Log result
      addLog("🎉 Flow execution completed!");
      addLog(JSON.stringify(result, null, 2));

      // Final progress update
      setProgress({
        currentNode: totalNodes,
        totalNodes,
        currentNodeName: undefined,
      });
    } catch (error) {
      addLog(`❌ Flow execution error: ${error}`);
      console.error("Flow execution error:", error);
    } finally {
      setIsExecuting(false);
    }
  }, [selectedFlowId, addLog]);

  return {
    availableFlows,
    selectedFlowId,
    setSelectedFlowId,
    isExecuting,
    progress,
    executeFlow,
    loadFlowTemplates,
  };
}
```

#### Step 4.2: Add Progress Tracking to Conductor

```typescript
// packages/@atomiton/conductor/src/conductor.ts

// Add optional callback to execution context
interface ExecutionOptions {
  executionId?: string;
  onNodeComplete?: (nodeId: string, nodeName: string) => void;
}

// In group execution logic:
async executeGroup(node: NodeDefinition, options?: ExecutionOptions) {
  const childNodes = node.nodes || [];

  for (const childNode of childNodes) {
    const result = await this.execute(childNode, options);

    // Call progress callback
    if (options?.onNodeComplete) {
      options.onNodeComplete(childNode.id, childNode.name || childNode.type);
    }
  }

  // Return aggregated results
}
```

---

## Testing & Validation

### Per-Flow Testing

#### Test 1: Hello World Flow

```bash
# 1. Verify YAML parses correctly
pnpm --filter @atomiton/nodes test:parse-yaml hello-world

# 2. Start dev server
pnpm dev

# 3. Navigate to debug/flows page

# 4. Select "Hello World Flow"

# 5. Click Run

# Expected Output:
# - Progress: 0/3 → 1/3 → 2/3 → 3/3
# - Logs show each node executing
# - File created at /Users/Ryan/Desktop/hello-world.txt
# - Success message
```

#### Test 2: Data Transform Flow

```bash
# Similar process but verify:
# - CSV reading
# - Transform operations
# - File output with processed data
```

#### Test 3: Image Processor Flow

```bash
# Verify:
# - Image loading
# - Parallel processing
# - Output files created
```

### Integration Testing

```bash
# Run E2E test
pnpm --filter @atomiton/e2e test flows-page

# Test should verify:
# - Flow list loads
# - Flow can be selected
# - Run button enabled/disabled correctly
# - Progress bar updates
# - Logs appear
# - Execution completes
```

---

## Implementation Prompts

### Prompt 1: Fix hello-world.yaml

```
Fix the hello-world.yaml flow template to match proper NodeDefinition structure:

1. Remove the `flow:` wrapper
2. Add `type: "group"` at root level
3. Change all nested `data:` to `parameters:`
4. Fix edge structure to include sourceHandle/targetHandle
5. Ensure all nodes have proper version and position
6. Test with fromYaml() parser

Location: packages/@atomiton/nodes/src/templates/yaml/hello-world.yaml
Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Step 1.2"
```

### Prompt 2: Fix data-transform.yaml

```
Fix the data-transform.yaml flow template:

1. Add `type: "group"` at root level
2. Change all `data:` to `parameters:` in child nodes
3. Remove redundant metadata from child nodes
4. Simplify edge structure
5. Ensure all nodes have required fields (id, type, version, parameters)
6. Test with fromYaml() parser

Location: packages/@atomiton/nodes/src/templates/yaml/data-transform.yaml
Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Step 1.3"
```

### Prompt 3: Fix image-processor.yaml

```
Fix the image-processor.yaml flow template:

1. Add `type: "group"` at root level
2. Change all `data:` to `parameters:` in child nodes
3. Flatten nested metadata structures
4. Fix edge references to use correct node IDs
5. Ensure all nodes have required fields
6. Test with fromYaml() parser

Location: packages/@atomiton/nodes/src/templates/yaml/image-processor.yaml
Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Step 1.4"
```

### Prompt 4: Rename Directory and Files

```
Rename the templates directory and flow files:

1. Rename packages/@atomiton/nodes/src/templates/yaml → flows
2. Rename hello-world.yaml → hello-world.flow.yaml
3. Rename data-transform.yaml → data-transform.flow.yaml
4. Rename image-processor.yaml → image-processor.flow.yaml
5. Update any imports that reference the old path

Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Step 1.1"
Note: Using .flow.yaml double extension for semantic clarity and consistency
```

### Prompt 5: Create Flow Loading System

```
Create the flow template loading system:

1. Create packages/@atomiton/nodes/src/templates/flows/index.ts with loadFlowTemplates()
2. Add RPC channel at packages/@atomiton/rpc/src/main/channels/flowTemplatesChannel.ts
3. Register channel in main process
4. Add browser API at packages/@atomiton/conductor/src/exports/browser/flowTemplatesApi.ts
5. Test that flow templates can be loaded

Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Phase 2"
```

### Prompt 6: Build FlowsPage UI Components

```
Create the FlowsPage UI components:

1. Create FlowSelector component (apps/client/src/templates/DebugPage/components/FlowSelector.tsx)
2. Create FlowActionButtons component (apps/client/src/templates/DebugPage/components/FlowActionButtons.tsx)
3. Create FlowProgressBar component (apps/client/src/templates/DebugPage/components/FlowProgressBar.tsx)
4. Update FlowsPage to use two-column layout with these components
5. Test that UI renders correctly

Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Phase 3"
```

### Prompt 7: Implement Flow Execution

```
Implement flow execution with progress tracking:

1. Enhance useFlowOperations hook with:
   - loadFlowTemplates()
   - executeFlow()
   - Progress state management
2. Add onNodeComplete callback support to conductor
3. Wire up progress updates from conductor to UI
4. Test that flows execute and progress updates work

Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Phase 4"
```

### Prompt 8: Test Each Flow

```
Test all three flows end-to-end:

1. Test hello-world-flow: Creates message and writes to file
2. Test data-transform-flow: Reads CSV, transforms, outputs JSON
3. Test image-processor-flow: Batch processes images with watermarks
4. Verify progress tracking works for each
5. Verify logs show detailed execution steps

Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Testing & Validation"
```

---

## Success Criteria

### Phase 1: YAML Templates (Read-Only) ✅

- [ ] All 3 YAML files parse correctly with fromYaml()
- [ ] Directory renamed to `flows/`
- [ ] Files renamed to `*.flow.yaml` pattern (double extension for semantic clarity)
- [x] hello-world.flow.yaml fixed: `type: "group"` at root, no `data:` fields
- [ ] data-transform.flow.yaml fixed
- [ ] image-processor.flow.yaml fixed

### Phase 2: Flow Template Loading (Read-Only) ✅

- [ ] flowTemplatesChannel created for template access
- [ ] Flow templates can be listed via `conductor.flowTemplates.listTemplates()`
- [ ] Flow templates can be loaded by ID via `conductor.flowTemplates.getTemplate()`
- [ ] fromYaml() correctly parses all templates
- [ ] Browser can access flow templates through conductor API
- [ ] Templates are clearly separate from user storage

### Phase 2.5: User Storage Integration (Persistent) ✅

- [ ] **Simplify Storage Layer (Step 2.5.0)**:
  - [ ] `IStorageEngine.save()` accepts string (not unknown)
  - [ ] `IStorageEngine.load()` returns string (not unknown)
  - [ ] `fileOperations.ts::writeDataToFile()` just writes string (no JSON.stringify)
  - [ ] `fileOperations.ts::readDataFromFile()` just reads string (no JSON.parse)
  - [ ] Storage layer has zero knowledge of NodeDefinition or domain types
  - [ ] Storage layer is pure infrastructure (file I/O only)
- [ ] **Storage Channel with Serialization (Step 2.5.1)**:
  - [ ] `storageChannel.ts` imports `toYaml()` and `fromYaml()`
  - [ ] `saveFlow` handler converts NodeDefinition → YAML string before save
  - [ ] `loadFlow` handler converts YAML string → NodeDefinition after load
  - [ ] Files saved as actual YAML on disk (not JSON with .flow.yaml extension)
  - [ ] Files can be read back correctly from YAML
  - [ ] Storage auto-detection working (FileSystemEngine for desktop)
  - [ ] User flows persist to `~/.atomiton/flows/*.flow.yaml` (double extension)
  - [ ] `conductor.storage.saveFlow()` writes YAML to disk with .flow.yaml extension
  - [ ] `conductor.storage.loadFlow()` reads YAML from disk
  - [ ] `conductor.storage.listFlows()` shows user flows only (not templates)
  - [ ] Flows survive app restart (persistence verified)
- [ ] **Future Storage (Stubbed)**:
  - [ ] Asset storage stub with TODO comments
  - [ ] Config storage stub with TODO comments
  - [ ] Credential storage stub with security notes
- [ ] **Documentation**:
  - [ ] Clear distinction documented between templates vs storage
  - [ ] Storage architecture diagram included in strategy

### Phase 2.5.X: Credential Storage (Future - BLOCKED on research) 🔒

- [ ] Guilliman research task: Secure credential storage best practices
- [ ] CredentialManager implemented with Electron safeStorage
- [ ] Secret detection implemented (blocks saves with embedded secrets)
- [ ] credentialChannel RPC created
- [ ] Credential resolution in conductor (credentialId → actual credentials)
- [ ] Credential management UI
- [ ] Platform keychain integration tested (macOS, Windows, Linux)
- [ ] Usage tracking and audit logging
- [ ] Access control (node type whitelist)

### Phase 3: UI Components ✅

- [ ] Two-column layout matches NodesPage
- [ ] Flow selector shows templates and user flows separately
- [ ] Action buttons render:
  - [ ] Run button (enabled for templates and saved flows)
  - [ ] Save button (enabled when flow modified)
  - [ ] Load button (shows user flows, not templates)
  - [ ] Download button (export as YAML)
- [ ] Progress bar component created
- [ ] LogsSection integrated

### Phase 4: Execution ✅

- [ ] Selected flow (template or user flow) can be executed
- [ ] Progress bar updates as nodes complete
- [ ] Activity logs show execution details
- [ ] All 3 template flows execute successfully
- [ ] User saved flows execute successfully
- [ ] Error states handled gracefully

---

## Future Enhancements

### Short Term (Post-MVP)

- Enable Load button (load saved flows)
- Enable Save button (save flow modifications)
- Enable Download button (export flow as YAML)
- Add flow editing capability
- Add flow validation before execution

### Medium Term

- Visual flow editor (drag & drop nodes)
- Real-time flow execution visualization
- Flow debugging (step through, breakpoints)
- Flow scheduling (cron-like)

### Long Term

- Flow templates marketplace
- Flow version control
- Collaborative flow editing
- Flow analytics and monitoring

---

## Storage Namespace Reference

Quick reference for all storage namespaces and their usage:

| Namespace | Purpose | Format | Security | Status | Phase |
|-----------|---------|--------|----------|--------|-------|
| `flows/{id}.flow.yaml` | User-saved flows | YAML | Plaintext | ✅ Active | 2.5 |
| `assets/images/{id}` | User images/files | Binary | Plaintext | 🔲 Stub | Future |
| `assets/data/{id}` | Data files (CSV, JSON) | Various | Plaintext | 🔲 Stub | Future |
| `configs/nodes/{nodeType}.yaml` | Per-node configuration | YAML | Plaintext | 🔲 Stub | Future |
| `configs/app.yaml` | Application preferences | YAML | Plaintext | 🔲 Stub | Future |
| `credentials/{id}.encrypted` | API keys, tokens, secrets | Encrypted | 🔒 Keychain | ⚠️ Research | 2.5.X |
| `cache/{key}` | Temporary cached data | JSON | Plaintext | 🔲 Future | Future |
| `logs/{timestamp}.log` | Application logs | Text | Plaintext | 🔲 Future | Future |
| `backups/{date}/` | Automatic backups | Archive | Plaintext | 🔲 Future | Future |

### Security Tiers

- 🟢 **Plaintext**: Safe to store as regular files (no sensitive data)
- 🔒 **Encrypted**: Must use OS keychain or encryption (credentials only)

### Status Legend

- ✅ **Active**: Currently implemented in Phase 2.5
- 🔲 **Stub**: Stubbed with TODO comments, ready for future implementation
- ⚠️ **Research**: Requires security research before implementation

### Usage Examples

```typescript
// ACTIVE: Flow storage (Phase 2.5)
await conductor.storage.saveFlow(myFlow);
await conductor.storage.loadFlow(flowId);
await conductor.storage.listFlows();

// FUTURE: Asset storage (stubbed)
// await conductor.storage.saveAsset({ type: 'image', id, data });
// await conductor.storage.loadAsset({ type: 'image', id });

// FUTURE: Config storage (stubbed)
// await conductor.storage.saveConfig({ scope: 'app', key: 'theme', data });
// await conductor.storage.loadConfig({ scope: 'app', key: 'theme' });

// FUTURE: Credential storage (research required)
// await conductor.credentials.create({ type: 'api-key', name, data });
// await conductor.credentials.get(credentialId);
```

### Never Store Secrets in Flows!

```yaml
# ✅ CORRECT: Reference credential by ID
nodes:
  - type: "http-request"
    parameters:
      url: "https://api.example.com"
      credentialId: "cred_123"  # References encrypted credential

# ❌ WRONG: Never embed actual secrets!
nodes:
  - type: "http-request"
    parameters:
      url: "https://api.example.com"
      apiKey: "sk-live-abc123..."  # NEVER DO THIS!
```

---

## File Extension Convention

### `.flow.yaml` Double Extension

Based on industry best practices research, Atomiton uses the `.flow.yaml` double extension for all flow files (both templates and user flows).

**Rationale:**
1. **Semantic clarity**: Immediately indicates file purpose (flow-specific YAML)
2. **Industry alignment**: Follows established patterns like `.spec.ts`, `.d.ts`, `.min.js`
3. **Tooling support**: Easy to configure file associations, glob patterns, schema validation
4. **Future-proof**: Allows other YAML files (config.yaml) without confusion
5. **Self-documenting**: File extension matches user concept ("flow") while indicating technical format (YAML)

**Examples:**
- Flow templates: `hello-world.flow.yaml`, `data-transform.flow.yaml`
- User flows: `{flowId}.flow.yaml` in `~/.atomiton/flows/`
- Other YAML: `config.yaml`, `atomiton.config.yaml` (no confusion)

**VSCode Configuration** (optional):
```json
{
  "files.associations": {
    "*.flow.yaml": "yaml"
  },
  "yaml.schemas": {
    "path/to/flow-schema.json": "*.flow.yaml"
  }
}
```

## Glossary

### Core Concepts

**Flow**: A NodeDefinition with child nodes that executes as a sequence/group. In Atomiton, "flow" is a user-friendly term, not a distinct type.

**NodeDefinition**: The universal type representing any node or flow. Everything in Atomiton is a NodeDefinition.

**Flow Template**: A predefined, read-only `.flow.yaml` file bundled with the app that provides example flows for users to learn from. Located in `@atomiton/nodes/templates/flows/`.

**User Flow**: A flow created and saved by the user to persistent storage as `.flow.yaml`. Stored in `~/.atomiton/flows/` on desktop.

### Storage Terms

**Storage Engine**: Backend implementation that handles data persistence. Examples: FileSystemEngine (desktop), MemoryEngine (browser temp), IndexedDB (browser future).

**Storage Namespace**: Organizational structure for different types of user data (flows, assets, configs, credentials).

**User Storage**: Persistent storage for user-created content, managed by `@atomiton/storage` package. Separate from read-only templates.

**Credential Storage**: Secure storage for API keys, tokens, and secrets using OS keychain. Never stored in flow files - referenced by `credentialId`.

### APIs and Functions

**fromYaml()**: Parser that converts YAML to NodeDefinition

**conductor.node.run()**: Executes any NodeDefinition (single node or flow)

**conductor.flowTemplates.***: API for accessing read-only bundled templates

**conductor.storage.***: API for user's persistent storage (flows, assets, configs)

**conductor.credentials.***: API for secure credential management (future)

### Technical Terms

**Progress Tracking**: Real-time updates showing which node is currently executing

**Secret Detection**: Scanning flow files for embedded credentials before save to prevent accidental leaks

**Two-Tier Storage**: Pattern for credentials where metadata is in filesystem and actual secrets are in OS keychain
