# Flow Lifecycle & File System Ecosystem

## Overview

This document describes the complete lifecycle of a Flow as it moves through the
system - from file storage to editor to execution and back to storage. Since a
Flow is just a composite node, this lifecycle is clean and predictable.

## 🔄 The Flow Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                     Flow Lifecycle                          │
│                                                             │
│  1. Load → 2. Edit → 3. Execute → 4. Save → (repeat)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File System Structure

```
~/Documents/Atomiton/           # User's flow storage
├── flows/
│   ├── my-automation.flow.yaml
│   ├── data-pipeline.flow.yaml
│   └── daily-backup.flow.yaml
├── templates/                   # Starter templates
│   ├── http-webhook.flow.yaml
│   └── csv-processor.flow.yaml
└── exports/                     # Exported results
    └── execution-results.json
```

## 🔄 Complete Flow Lifecycle

### Phase 1: Loading a Flow from File

```typescript
// 1. USER ACTION: Select flow file to open
const filePath = "~/Documents/Atomiton/flows/my-automation.flow.yaml";

// 2. STORAGE: Read YAML file from disk
const yamlContent = await storage.readFile(filePath);
/*
version: 1
id: flow-123
type: flow
name: My Automation
nodes:
  - id: node-1
    type: httpRequest
    version: "2.0.1"
    position: { x: 100, y: 100 }
    config:
      url: https://api.example.com
      method: GET
connections:
  - id: conn-1
    source: node-1
    target: node-2
metadata:
  createdAt: 2024-01-01T00:00:00Z
  updatedAt: 2024-01-15T00:00:00Z
*/

// 3. YAML PACKAGE: Parse YAML to Flow object
import { parseYaml } from '@atomiton/yaml';
import { migrateFlow } from '@atomiton/flow/migrations';

const rawFlow = parseYaml(yamlContent);
const flow = migrateFlow(rawFlow); // Apply migrations if needed
/*
{
  version: 1,
  id: "flow-123",
  type: "flow",
  name: "My Automation",
  nodes: [
    {
      id: "node-1",
      type: "httpRequest",
      version: "2.0.1",
      position: { x: 100, y: 100 },
      config: { url: "https://api.example.com", method: "GET" }
    }
  ],
  connections: [
    { id: "conn-1", source: "node-1", target: "node-2" }
  ],
  metadata: {
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  }
}
*/

// 4. CLIENT: Pass Flow to Editor
<Editor flow={flow} onFlowChange={handleFlowChange} />
```

### Phase 2: Editing in the Editor

```typescript
// 5. EDITOR: Transform Flow to React Flow for visualization
import { flowToReactFlow } from '@atomiton/editor/utils';

const Editor = ({ flow, onFlowChange }) => {
  // Transform domain model to visual model
  const { nodes, edges } = flowToReactFlow(flow);
  /*
  {
    nodes: [
      {
        id: "node-1",
        type: "httpRequest",
        position: { x: 100, y: 100 },
        data: {
          label: "HTTP Request",
          config: { url: "...", method: "GET" },
          version: "2.0.1"
        }
      }
    ],
    edges: [
      {
        id: "conn-1",
        source: "node-1",
        target: "node-2",
        type: "smoothstep"
      }
    ]
  }
  */

  // 6. USER EDITS: Add/remove nodes, change connections
  const handleNodesChange = (changes) => {
    // User drags nodes, adds new ones, etc.
    setNodes(applyNodeChanges(changes, nodes));
  };

  const handleEdgesChange = (changes) => {
    // User connects/disconnects nodes
    setEdges(applyEdgeChanges(changes, edges));
  };

  // 7. EDITOR: Transform back to Flow domain model
  const handleSave = () => {
    const updatedFlow = reactFlowToFlow(nodes, edges, flow);
    onFlowChange(updatedFlow); // Notify parent
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
    />
  );
};
```

### Phase 3: Executing the Flow

```typescript
// 8. USER ACTION: Click "Run" button
const handleRun = async () => {
  // Flow is already an Executable, just send it!
  const result = await rpc.execute(flow);
  /*
  RPC creates: {
    id: "req-123",
    executable: flow,  // The entire Flow object
    context: { user: "current-user" }
  }
  */
};

// 9. DESKTOP: Receives and executes
const handleExecuteRequest = async (request) => {
  // Pass the executable (Flow) to conductor
  const result = await conductor.execute(request.executable);

  // Conductor sees it's a Flow (type === 'flow')
  // and executes all nodes in order
  return {
    success: true,
    outputs: result.outputs,
    executedNodes: ["node-1", "node-2", "node-3"],
  };
};

// 10. CLIENT: Display results
const showResults = (result) => {
  console.log("Execution complete:", result);
  // Update UI to show success/failure
};
```

### Phase 4: Saving the Flow

```typescript
// 11. USER ACTION: Click "Save" or auto-save triggers
const handleSave = async (flow) => {
  // Add/update metadata
  const flowToSave = {
    ...flow,
    metadata: {
      ...flow.metadata,
      updatedAt: new Date(),
      lastModifiedWith: "atomiton@1.0.0",
    },
  };

  // 12. YAML PACKAGE: Convert Flow to YAML
  import { toYaml } from "@atomiton/yaml";

  const yamlContent = toYaml(flowToSave);
  /*
  version: 1
  id: flow-123
  type: flow
  name: My Automation
  nodes:
    - id: node-1
      type: httpRequest
      version: "2.0.1"
      position:
        x: 150    # User moved it
        y: 100
      config:
        url: https://api.example.com
        method: POST  # User changed method
        headers:      # User added headers
          Content-Type: application/json
  connections:
    - id: conn-1
      source: node-1
      target: node-2
    - id: conn-2      # User added new connection
      source: node-2
      target: node-3
  metadata:
    createdAt: 2024-01-01T00:00:00Z
    updatedAt: 2024-01-15T12:30:00Z  # Just updated
    lastModifiedWith: atomiton@1.0.0
  */

  // 13. STORAGE: Write to file system
  await storage.writeFile(filePath, yamlContent);

  // 14. UI: Show save confirmation
  showNotification("Flow saved successfully!");
};
```

## 📊 Data Transformations at Each Step

### Loading Transformations

```
YAML File → Parse → JSON Object → Migrate → Flow → Editor Transform → React Flow
```

### Saving Transformations

```
React Flow → Editor Transform → Flow → Add Metadata → YAML Serialize → File
```

### Execution Path

```
Flow → RPC Request → Conductor → ExecutionResult → Display
```

## 🔧 Key Functions in the Ecosystem

### Storage Layer (`@atomiton/storage`)

```typescript
// File operations
async function readFlowFile(path: string): Promise<string> {
  // Read YAML content from disk
  return await fs.readFile(path, "utf-8");
}

async function writeFlowFile(path: string, content: string): Promise<void> {
  // Write YAML content to disk
  await fs.writeFile(path, content, "utf-8");
}

async function listFlows(): Promise<FlowFile[]> {
  // List all .flow.yaml files
  const files = await fs.readdir(FLOWS_DIR);
  return files.filter((f) => f.endsWith(".flow.yaml"));
}
```

### YAML Layer (`@atomiton/yaml`)

```typescript
// Serialization functions
function parseYaml(content: string): any {
  return yaml.load(content);
}

function toYaml(flow: Flow): string {
  // Custom serialization for dates, etc.
  return yaml.dump(flow, {
    sortKeys: false,
    lineWidth: -1,
  });
}

// Flow-specific helpers
function validateFlowYaml(content: string): boolean {
  const parsed = parseYaml(content);
  return parsed.type === "flow" && Array.isArray(parsed.nodes);
}
```

### Migration Layer (`@atomiton/flow`)

```typescript
// Ensure flows are current version
function migrateFlow(flow: any): Flow {
  if (!flow.version) flow.version = 1;

  while (flow.version < CURRENT_VERSION) {
    flow = migrations[flow.version](flow);
  }

  return flow;
}
```

### Transform Layer (`@atomiton/editor`)

```typescript
// Bidirectional transformation
function flowToReactFlow(flow: Flow): ReactFlowData {
  return {
    nodes: flow.nodes.map(nodeToReactFlow),
    edges: flow.connections.map(connectionToEdge),
  };
}

function reactFlowToFlow(nodes, edges, original): Flow {
  return {
    ...original,
    nodes: nodes.map(reactFlowNodeToFlowNode),
    connections: edges.map(edgeToConnection),
    metadata: { ...original.metadata, updatedAt: new Date() },
  };
}
```

## 🎯 File Format Specification

### Flow YAML Format (.flow.yaml)

```yaml
# Required fields
version: 1 # Schema version for migration
id: flow-uuid # Unique identifier
type: flow # Always 'flow' for flows
name: Flow Name # Display name

# Node definitions
nodes:
  - id: node-1
    type: httpRequest # Node type from @atomiton/nodes
    version: "2.0.1" # Node type version
    position:
      x: 100
      y: 200
    config: # Node-specific configuration
      url: https://example.com
      method: GET
    label: Fetch Data # Optional display label

# Connections between nodes
connections:
  - id: conn-1
    source: node-1 # Source node ID
    target: node-2 # Target node ID
    sourceHandle: output # Optional: specific output port
    targetHandle: input # Optional: specific input port

# Metadata
metadata:
  createdAt: 2024-01-01T00:00:00Z
  updatedAt: 2024-01-15T00:00:00Z
  createdWith: atomiton@1.0.0
  lastModifiedWith: atomiton@1.0.0
  tags: [automation, daily] # Optional tags
  description: | # Optional description
    This flow fetches data from an API
    and processes it daily.
```

## 🔐 File System Permissions

### Desktop Mode

```typescript
// Full file system access
const storage = createDesktopStorage({
  baseDir: app.getPath("documents") + "/Atomiton",
  permissions: "read-write",
});
```

### Web Mode (Future)

```typescript
// Browser file API
const storage = createWebStorage({
  // Uses File System Access API
  // Or falls back to downloads/uploads
});
```

## 🚀 Optimizations

### 1. Auto-save with Debouncing

```typescript
const debouncedSave = debounce(async (flow) => {
  await saveFlow(flow);
}, 2000); // Save 2 seconds after last change

// In editor
onFlowChange={(flow) => {
  setFlow(flow);
  debouncedSave(flow);
}};
```

### 2. File Watching for External Changes

```typescript
// Watch for external edits
fs.watch(flowPath, async (eventType) => {
  if (eventType === "change") {
    const updated = await loadFlow(flowPath);
    if (updated.metadata.updatedAt > currentFlow.metadata.updatedAt) {
      promptUserToReload();
    }
  }
});
```

### 3. Backup Before Save

```typescript
async function saveWithBackup(flow: Flow, path: string) {
  // Create backup
  const backupPath = path.replace(".yaml", `.backup-${Date.now()}.yaml`);
  await fs.copyFile(path, backupPath);

  // Save new version
  await writeFlowFile(path, toYaml(flow));

  // Clean old backups (keep last 5)
  await cleanOldBackups(path);
}
```

## 📋 Complete Lifecycle Checklist

- [ ] **Load**: YAML → Parse → Migrate → Flow
- [ ] **Display**: Flow → Transform → React Flow
- [ ] **Edit**: User changes → Update React Flow
- [ ] **Save**: React Flow → Transform → Flow → YAML → File
- [ ] **Execute**: Flow → RPC → Conductor → Results
- [ ] **Export**: Results → Format → Save to exports/

## Summary

The Flow lifecycle is clean because:

1. **Flow is self-contained** - It's just a composite node with all needed data
2. **Transformations are predictable** - YAML ↔ Flow ↔ React Flow
3. **Execution is simple** - Flow is already an Executable
4. **Storage is straightforward** - Just serialize/deserialize the Flow

The cycle repeats seamlessly: Load → Edit → Execute/Save → Load again!
