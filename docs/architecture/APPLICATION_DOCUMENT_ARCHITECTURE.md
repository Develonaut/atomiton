# Application Document Architecture

## Overview

Atomiton follows a **document-based application architecture** where YAML files serve as the canonical external format for composite node definitions. These files are the source of truth for all workflow definitions, similar to how `.psd` files work for Photoshop or `.fig` files work for Figma.

**Critical Format Distinction:**

- **YAML**: Canonical format for external operations (user downloads, storage, persistence, sharing)
- **JSON**: Internal format for parsing and data manipulation within the application
- **User Exposure**: Users can only download/export YAML - JSON is never exposed to users

## Core Principle: YAML as External Source of Truth

Composite node YAML files are our application's documents for all external operations. **Key principle**: What you save as YAML is exactly what you get back. The YAML file contains everything needed to recreate the exact editor state.

**Internal vs External Formats:**

- **External (User-Facing)**: YAML only - for downloads, storage, persistence, and sharing
- **Internal (Application)**: JSON for parsing, validation, and runtime manipulation
- **Conversion**: All data leaving the application (to user or storage) must be converted to YAML

## YAML File Naming Convention

**Critical Rule**: The YAML filename is always determined by the `yaml.name` property within the file itself, regardless of context or user input. This ensures consistent file naming across all operations and removes ambiguity about how files are named when exported or saved.

### Filename Determination

```yaml
# The 'name' property determines the filename
name: "customer-data-pipeline" # Becomes: customer-data-pipeline.yaml
id: "unique-id-123"
version: "1.0.0"
# ... rest of content
```

**System-Wide Rules:**

- Filename = `${yaml.name}.yaml` (kebab-case recommended)
- User input for filenames is ignored - only `yaml.name` property is used
- Save/export operations automatically use this naming convention
- File browsers and downloads respect this naming
- No manual filename entry - the document name IS the filename
- This is a consistent naming convention across ALL operations

**Implementation Examples:**

```javascript
// Save operation - filename comes from document
function saveComposite(composite) {
  const filename = `${composite.name}.yaml`; // Always from yaml.name
  const yamlContent = toYAML(composite);
  downloadFile(filename, yamlContent);
}

// Load operation - validates name matches expected filename
function loadComposite(file) {
  const composite = parseYAML(file.content);
  const expectedFilename = `${composite.name}.yaml`;

  if (file.name !== expectedFilename) {
    console.warn(`File renamed from ${file.name} to ${expectedFilename}`);
  }

  return composite;
}
```

## Data Format Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL OPERATIONS                               │
│                              (YAML ONLY)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Downloads    File Storage    Persistence    Sharing    Version Control │
│       ↓               ↓              ↓             ↓              ↓         │
│  ${name}.yaml    ${name}.yaml   ${name}.yaml   ${name}.yaml  ${name}.yaml   │
│ (from yaml.name) (from yaml.name) (from yaml.name) (from yaml.name) (from yaml.name) │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                        ┌─────────────┼─────────────┐ CONVERSION BOUNDARY
                        │             │             │
                        │    YAML ←──→ JSON         │ (Bidirectional)
                        │             │             │
                        └─────────────┼─────────────┘
                                      │
┌─────────────────────────────────────┴───────────────────────────────────────┐
│                          INTERNAL OPERATIONS                               │
│                              (JSON ONLY)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   File Import    Parsing    Validation    Runtime    Editor State    API   │
│        ↓           ↓           ↓           ↓           ↓             ↓     │
│   JSON parse → JSON schema → JSON objects → JSON data → JSON state → JSON  │
│                                                                             │
│  User Input Processing:                                                     │
│  ┌───────────────────────┐    ┌──────────────────┐    ┌─────────────────┐  │
│  │   User Actions        │    │   Editor State   │    │   Manipulation  │  │
│  │   (add/edit/connect)  │───→│   (JSON objects) │───→│   (JSON only)   │  │
│  └───────────────────────┘    └──────────────────┘    └─────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

CRITICAL RULE: JSON never exposed to users - all external operations use YAML
```

## Document-Based Application Principles

### File Format Hierarchy

```
External Layer (User-Facing)
└── YAML Templates (canonical external format)

Internal Layer (Application Runtime)
├── JSON objects (internal parsing/manipulation)
├── Composite node objects (validated document representation)
├── EditorNode objects (editor-ready state)
└── ReactFlow state (UI presentation)
```

**Format Usage Rules:**

- **YAML**: All user downloads, file saves, storage, and external sharing
- **JSON**: Internal parsing, validation, data manipulation, and API communication
- **No JSON Exports**: Users cannot download or export JSON format

### Separation of Concerns

- **External Document Format (YAML)**: User-facing, persistent, shareable, version-controllable
- **Internal Format (JSON)**: Application-internal parsing and manipulation only
- **Runtime State**: Validated, type-safe working representation (internally JSON-based)
- **Editor State**: UI-optimized with ReactFlow compatibility
- **Presentation Layer**: Visual interface for manipulation
- **Export Boundary**: JSON → YAML conversion required for all external operations

## File Lifecycle

### 1. Node Creation (Editor → Memory)

When a user adds a node from the palette:

```javascript
// User selects "csv-reader" from palette
const nodeDefinition = getNodeByType("csv-reader");

// Create complete node instance
const newNode = {
  // Identity
  id: generateNodeId(),
  type: "csv-reader",
  name: nodeDefinition.metadata.name,
  version: nodeDefinition.metadata.version, // Current version
  category: nodeDefinition.metadata.category,

  // Complete metadata from definition
  metadata: { ...nodeDefinition.metadata },

  // Port definitions for connectivity
  inputPorts: nodeDefinition.ports.inputs,
  outputPorts: nodeDefinition.ports.outputs,

  // Parameter schema and defaults
  parameters: nodeDefinition.parameters.schema,
  data: nodeDefinition.parameters.defaults,

  // Editor state
  position: { x: 100, y: 200 },
  selected: true,
};
```

### 2. Editor Operations (Memory)

While working in the editor, the node accumulates:

```javascript
node.data = {
  // User-configured values
  filePath: "/data/customers.csv",
  hasHeaders: true,
  encoding: "utf-8",

  // Editor-specific state
  customLabel: "Customer Import",
  notes: "Runs at 9am daily",
  lastExecuted: "2025-01-15T09:00:00Z",
  validationStatus: "valid",

  // UI state
  isExpanded: true,
  customColor: "#4CAF50",
};
```

### 3. Saving (Memory → YAML)

When saving, the complete node state is serialized with the filename automatically determined by the `name` property. The user cannot specify a different filename - it is always derived from the document's `name` property:

```yaml
# customer-data-pipeline.yaml - Filename determined by 'name' property
id: "customer-processing"
name: "customer-data-pipeline" # This determines the filename: customer-data-pipeline.yaml
version: "1.0.0"
created: "2025-01-15T10:00:00Z"
modified: "2025-01-15T14:30:00Z"

nodes:
  - id: "csv-reader-1"
    type: "csv-reader"
    name: "Read Customer Data"
    version: "1.2.0" # Version when saved
    category: "io"

    # Complete metadata snapshot
    metadata:
      variant: "csv-reader"
      author: "Atomiton Core Team"
      icon: "table-2"
      description: "Read CSV files with headers"

    # Port definitions at save time
    inputPorts:
      - id: "trigger"
        type: "trigger"
        dataType: "any"

    outputPorts:
      - id: "data"
        type: "output"
        dataType: "array"

    # Parameter schema (for validation/migration)
    parameters:
      filePath:
        type: "string"
        required: true
        control: "file-picker"
      hasHeaders:
        type: "boolean"
        default: true

    # Current values and editor state
    data:
      filePath: "/data/customers.csv"
      hasHeaders: true
      encoding: "utf-8"
      customLabel: "Customer Import"
      notes: "Runs at 9am daily"

    # Position in editor
    position:
      x: 100
      y: 200

edges:
  - id: "edge-1"
    source: "csv-reader-1"
    target: "transform-1"
    sourceHandle: "data"
    targetHandle: "input"
```

### 4. Loading (YAML → Memory → Editor)

When loading a composite node definition, the system validates that the filename matches the `name` property:

```javascript
// 1. Parse YAML and validate filename
const composite = parseYAML(fileContent);
const expectedFilename = `${composite.name}.yaml`;

if (file.name !== expectedFilename) {
  console.warn(
    `File should be named ${expectedFilename} based on yaml.name property`,
  );
}

// 2. Check versions for migration needs
for (const node of composite.nodes) {
  const currentDef = getNodeByType(node.type);
  if (currentDef.version !== node.version) {
    // Apply migrations if needed
    node = migrateNode(node, node.version, currentDef.version);
  }
}

// 3. Recreate exact editor state
const editorNodes = composite.nodes.map((node) => ({
  ...node,
  // Everything needed is in the saved node
  // No lookup required - it's all there
}));

// 4. Restore to editor
loadIntoEditor(editorNodes, composite.edges);
```

## Data Structures and Validation

### `parameters` - Schema Definition

Defines what CAN be configured:

```javascript
parameters: {
  filePath: { type: "string", required: true },
  hasHeaders: { type: "boolean", default: true }
}
```

### `data` - Runtime Values & State

Contains actual values and editor state:

```javascript
data: {
  // Configuration values
  filePath: "/current/file.csv",
  hasHeaders: true,

  // Editor state
  customLabel: "My CSV Reader",
  lastModified: "2025-01-15T10:30:00Z"
}
```

### Validation at Boundaries

```typescript
// File ingestion boundary
YAML (external) → JSON (internal) → Validation → Filename Check → Composite Object (trusted)

// Save boundary
EditorState → JSON (internal) → Validation → Filename Generation → YAML (external)

// User download boundary
Internal State → JSON (manipulation) → Filename from yaml.name → YAML (user download)

// Storage boundary
Application Data → JSON (processing) → Filename from yaml.name → YAML (persistence)
```

**Critical Rule**: No JSON ever reaches users or external storage - all external operations use YAML.

## Version Management and Migration

### Migration Strategy

When node definitions change:

1. **Non-Breaking Changes**: New optional parameters get defaults
2. **Breaking Changes**: Migration functions transform old → new
3. **Deprecation**: Old nodes continue to work with warnings
4. **Version Tracking**: Always know what version created the file

### Example Migration

```javascript
// Node v1.0.0 → v2.0.0 migration
function migrateCSVReaderV1ToV2(node) {
  // v2.0.0 renamed 'hasHeaders' to 'includeHeaders'
  if (node.data.hasHeaders !== undefined) {
    node.data.includeHeaders = node.data.hasHeaders;
    delete node.data.hasHeaders;
  }

  // v2.0.0 added new 'delimiter' parameter with default
  if (node.data.delimiter === undefined) {
    node.data.delimiter = ",";
  }

  node.version = "2.0.0";
  return node;
}
```

## Benefits of This Approach

### 1. Version Independence

- Saved composite definitions work regardless of node package updates
- Each YAML contains the exact version used when created

### 2. Self-Contained Files

- Composite definitions are portable - can be shared without dependencies
- No need for external node registries to open a file

### 3. Complete Audit Trail

- See exactly what version of each node was used
- Track when changes were made
- Understand the complete configuration

### 4. Git-Friendly

- YAML format is human-readable and diff-able
- Changes are meaningful and reviewable
- Version control tracks actual workflow changes

## Current Implementation Status

### File Operations

| Operation | Status                                             |
| --------- | -------------------------------------------------- |
| New       | Implemented in editor                              |
| Open      | Implemented via file system                        |
| Save      | Implemented via download (filename from yaml.name) |
| Auto-save | Basic functionality exists                         |

### Core Systems

- **YAML Parsing**: Implemented using standard YAML libraries
- **Node Serialization**: Complete state capture and restoration
- **Version Migration**: Basic framework exists
- **Validation**: Schema validation at load time

## File Format Guarantees

### YAML (External Format)

1. **Completeness**: YAML files contain everything needed to recreate the workflow
2. **Stability**: Files continue to work as node packages evolve
3. **Portability**: Files can be shared between users and systems
4. **Debuggability**: Files are human-readable for troubleshooting
5. **User Accessibility**: Only format users can download or export
6. **Filename Consistency**: Filename always determined by `yaml.name` property

### JSON (Internal Format)

1. **Performance**: Optimized for parsing and manipulation within the application
2. **Flexibility**: Easier programmatic access for runtime operations
3. **Validation**: Structured format for schema validation
4. **Internal Only**: Never exposed to users or external systems

### Format Conversion Requirements

- **All External Operations**: Must convert JSON → YAML before user access
- **All Imports**: Must convert YAML → JSON for internal processing
- **No JSON Exports**: Application must never offer JSON download/export options
- **Filename Convention**: All YAML files use filename derived from `yaml.name` property

### File Naming Standards

- **Source of Truth**: The `yaml.name` property within the document
- **Format**: `${yaml.name}.yaml` (kebab-case recommended)
- **User Interface**: No manual filename input - name is set via document properties
- **Consistency**: Same naming rules apply to downloads, saves, exports, and storage
- **Validation**: System validates filename matches `yaml.name` on load operations
- **System-Wide Rule**: This naming convention is applied regardless of context or user input

---

The composite node file lifecycle ensures reliability, compatibility, transparency, and maintainability. YAML files serve as the definitive source of truth for workflow definitions, containing complete node definitions, configurations, and editor state necessary for perfect reconstruction.

**Filename Convention Summary**: All YAML files are automatically named using the `yaml.name` property (e.g., `${yaml.name}.yaml`). This system-wide rule ensures consistent file naming across all operations - saves, exports, downloads, and storage - regardless of user input or context.
