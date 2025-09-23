# Unified Node Architecture

## 🎯 Core Mental Model: "Everything Executable is a Node"

The `@atomiton/nodes` package implements a unified architecture where all nodes
implement the same unified interface. Individual nodes provide discrete
functionality, while group nodes orchestrate workflows. This creates a powerful,
scalable, and conceptually consistent system.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           Node                                 │
│  ┌─────────────────────────────────────────────────────────────┤
│  │ + execute(context): Promise<NodeExecutionResult>             │
│  │ + validate(): { valid: boolean; errors: string[] }          │
│  │ + get inputPorts(): NodePort[]                    │
│  │ + get outputPorts(): NodePort[]                   │
│  │ + get metadata(): NodeMetadata                               │
│  │ + hasChildren(): boolean                                     │
│  │ + dispose(): void                                            │
│  └─────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────┘
                                 ↑
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐      ┌────────▼────────┐
            │ Individual     │      │ Group Nodes     │
            │ Nodes          │      │                 │
            │ • CSV Reader   │      │ • GroupNode     │
            │ • HTTP Request │      │ • Blueprint     │
            │ • Transform    │      │ • Sub-workflows │
            │ • Shell Cmd    │      │                 │
            └────────────────┘      └─────────────────┘
```

## 🔄 Composition Pattern

### Individual Node Example

```typescript
class CSVReaderNode extends Node implements INode {
  readonly id = "csv-reader-001";
  readonly name = "CSV Reader";
  readonly type = "csv-reader";

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Read and parse CSV file
    const data = await this.readCSVFile(context.config.filePath);
    return this.createSuccessResult(data);
  }

  hasChildren(): boolean {
    return false;
  }
}
```

### Group Node Example

```typescript
class DataPipelineNode extends Node implements IGroupNode {
  readonly id = "data-pipeline-001";
  readonly name = "Data Processing Pipeline";
  readonly type = "group";

  private childNodes = new Map<string, INode>();
  private executionFlow: GroupEdge[] = [];

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Execute child nodes according to execution flow
    return this.executor.execute(
      Array.from(this.childNodes.values()),
      this.executionFlow,
      context,
    );
  }

  hasChildren(): boolean {
    return this.childNodes.size > 0;
  }
}
```

## 📊 Visual Execution Flow

### Level 1: Blueprint Editor View (UI Domain)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Blueprint: "Data Pipeline"                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ CSV Reader  │───▶│ Transform   │───▶│ HTTP Export │         │
│  │             │    │             │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Users see: Blueprint as collection of connected nodes          │
└─────────────────────────────────────────────────────────────────┘
```

### Level 2: Code Execution View (System Domain)

```
┌─────────────────────────────────────────────────────────────────┐
│                GroupNode: "Data Pipeline"                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   INode     │───▶│   INode     │───▶│   INode     │         │
│  │ .execute()  │    │ .execute()  │    │ .execute()  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ System sees: Group node executing child nodes                  │
└─────────────────────────────────────────────────────────────────┘
```

### Level 3: Individual Node View (Future Scalability)

```
┌─────────────────────────────────────────────────────────────────┐
│                CSVReaderNode (zoomed in)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ File Input  │───▶│ CSV Parser  │───▶│ Validator   │         │
│  │             │    │             │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Future: Same interface, same editor, infinite depth            │
└─────────────────────────────────────────────────────────────────┘
```

## 🧠 Mental Model Mapping

| Domain           | Term            | Implementation   | Interface    |
| ---------------- | --------------- | ---------------- | ------------ |
| **UI/Marketing** | Blueprint       | `GroupNode`      | `INode`      |
| **Code/System**  | Group Node      | `GroupNode`      | `IGroupNode` |
| **Code/System**  | Individual Node | `CSVReaderNode`  | `INode`      |
| **Execution**    | Any Node        | `node.execute()` | Same method! |

## 🔍 Conceptual Navigation

The unified interface enables seamless **conceptual navigation** between
abstraction levels:

### High-Level Workflow Management

```typescript
// Working with blueprints as single units
const pipeline: INode = await nodes.getNode("data-pipeline");
const result = await pipeline.execute(context);
```

### Detail-Level Node Management

```typescript
// Working with individual nodes within blueprints
const group = pipeline as GroupNode;
const childNodes = group.getChildNodes();
for (const child of childNodes) {
  const childResult = await child.execute(context);
}
```

### Fractal Consistency

```typescript
// Same interface works at every level
async function executeAnyNode(node: INode, context: NodeExecutionContext) {
  return node.execute(context); // Works for individual OR group nodes!
}
```

## 🎨 UI Editor Scalability

The unified architecture enables powerful UI patterns:

### Current: Blueprint Editing

- Drag and drop individual nodes
- Connect nodes with edges
- Configure node properties
- Execute entire blueprint

### Future: Node Editing (same editor!)

- Double-click any node to "dive in"
- Same drag/drop interface
- Same connection system
- Same property panels
- Seamless navigation between levels

### Implementation Benefits

```typescript
// Same editor component works for both!
function NodeEditor({ node }: { node: INode }) {
  return (
    <Canvas>
      {node.hasChildren()
        ? renderGroupView(node as IGroupNode)
        : renderIndividualView(node)
      }
    </Canvas>
  );
}
```

## 🚀 Architectural Benefits

### 1. **Cognitive Consistency**

- Same mental model at every level
- "Everything that executes is a node"
- Reduces cognitive load for developers and users

### 2. **Fractal Scalability**

- Editor scales infinitely without complexity
- Same patterns work at micro and macro levels
- Natural progression from simple to complex

### 3. **Composition Power**

- Blueprints become reusable components
- Hierarchical composition enables powerful abstractions
- Complex workflows simplified into single nodes

### 4. **Development Velocity**

- Single interface to learn and implement
- Tools work at every level automatically
- Debugging, monitoring, validation unified

### 5. **No Circular Dependencies**

- Clean architectural boundaries
- Individual nodes have no external dependencies
- Group nodes orchestrate other nodes

## 🎯 Example: Real-World Usage

```typescript
// Load a data processing group
const dataPipeline = await nodes.getNode("data-processing-pipeline");

// Execute as a single node
const result = await dataPipeline.execute({
  config: { inputFile: "data.csv" },
  variables: { outputFormat: "json" },
});

// Or dive into details for debugging
if (dataPipeline.hasChildren()) {
  const group = dataPipeline as IGroupNode;
  const csvReader = group
    .getChildNodes()
    .find((node) => node.type === "csv-reader");

  // Debug individual node
  const csvResult = await csvReader?.execute(context);
}
```

## 🎉 Summary

This unified architecture creates a **powerful abstraction** where:

- **Blueprint** = UI term for what users create and manage
- **Group Node** = Code term for the same thing
- **Individual Node** = Functionality building blocks
- **INode** = Universal interface for everything

The result is a system that's **conceptually simple** yet **infinitely
scalable**, where users can seamlessly navigate between high-level workflow
management and detailed node implementation without changing tools or mental
models.

---

**Mental Model**: _"If it can execute, it's a node - whether it's reading a CSV
file or orchestrating a 50-step data pipeline."_
