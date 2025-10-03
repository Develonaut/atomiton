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
   - ✅ Storage APIs (saveFlow, loadFlow, listFlows)
   - ✅ useDebugLogs hook for log management

2. **YAML Flow Templates**
   - `packages/@atomiton/nodes/src/templates/yaml/hello-world.yaml`
   - `packages/@atomiton/nodes/src/templates/yaml/data-transform.yaml`
   - `packages/@atomiton/nodes/src/templates/yaml/image-processor.yaml`

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

3. **Flow Loading**
   - ❌ No way to load flows from templates directory
   - ❌ No YAML parsing integration

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
@atomiton/nodes/templates/flows     → YAML flow definitions
@atomiton/nodes/serialization       → fromYaml() parser
@atomiton/conductor                 → execute() function
client/templates/DebugPage/pages    → FlowsPage UI
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
    filename: "hello-world.yaml",
    id: "hello-world-flow",
    name: "Hello World Flow",
  },
  {
    filename: "data-transform.yaml",
    id: "data-transform-flow",
    name: "Data Transform Pipeline",
  },
  {
    filename: "image-processor.yaml",
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
2. Rename hello-world.yaml → hello-world-flow.yaml
3. Rename data-transform.yaml → data-transform-flow.yaml
4. Rename image-processor.yaml → image-processor-flow.yaml
5. Update any imports that reference the old path

Reference: .claude/strategies/FLOW_EXECUTION_STRATEGY.md section "Step 1.1"
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

### Phase 1: YAML Templates ✅

- [ ] All 3 YAML files parse correctly with fromYaml()
- [ ] Directory renamed to `flows/`
- [ ] Files renamed to `*-flow.yaml` pattern
- [x] hello-world.yaml fixed: `type: "group"` at root, no `data:` fields
- [ ] data-transform.yaml fixed
- [ ] image-processor.yaml fixed

### Phase 2: Flow Loading ✅

- [ ] Flow templates can be listed via RPC
- [ ] Flow templates can be loaded by ID
- [ ] fromYaml() correctly parses all templates
- [ ] Browser can access flow templates

### Phase 3: UI Components ✅

- [ ] Two-column layout matches NodesPage
- [ ] Flow selector shows all 3 flows
- [ ] Action buttons render (Run enabled, others disabled)
- [ ] Progress bar component created
- [ ] LogsSection integrated

### Phase 4: Execution ✅

- [ ] Selected flow can be executed
- [ ] Progress bar updates as nodes complete
- [ ] Activity logs show execution details
- [ ] All 3 flows execute successfully
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

## Glossary

**Flow**: A NodeDefinition with child nodes that executes as a sequence/group

**Flow Template**: A predefined YAML file containing a flow definition

**NodeDefinition**: The universal type representing any node or flow

**Progress Tracking**: Real-time updates showing which node is currently
executing

**fromYaml()**: Parser that converts YAML to NodeDefinition

**conductor.node.run()**: Executes any NodeDefinition (single node or flow)
