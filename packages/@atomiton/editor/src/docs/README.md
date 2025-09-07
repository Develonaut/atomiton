# Editor Architecture - Core Domains

## Overview

The Editor package is a domain-agnostic visual manipulation system. It provides components for building editors that work with positioned elements and their connections.

## Core Domains

### 1. **Canvas Domain**

**Purpose:** The spatial workspace where elements exist and are manipulated

**Responsibilities:**

- Viewport management (pan, zoom)
- Coordinate system
- Grid and snapping
- Background and overlays
- Mouse/touch interaction handling
- Selection management (click, drag, multi-select)

**Key Components:**

- `EditorCanvas` - Main canvas container
- `EditorCanvas.Viewport` - Scrollable/zoomable area
- `EditorCanvas.Grid` - Visual grid system
- `EditorCanvas.Controls` - Zoom/pan controls
- `EditorCanvas.SelectionBox` - Multi-select rectangle

---

### 2. **Element Domain**

**Purpose:** Individual items that can be positioned, configured, and connected

**Responsibilities:**

- Element rendering
- Position and size
- Selection state
- Drag and drop
- Connection ports
- Visual representation
- Element-specific controls

**Key Components:**

- `EditorElement` - Element wrapper
- `EditorElement.Container` - Positioned container
- `EditorElement.Ports` - Connection points
- `EditorElement.Controls` - Element-specific actions

---

### 3. **Connection Domain**

**Purpose:** Links between elements that represent relationships

**Responsibilities:**

- Path rendering between elements
- Connection validation
- Interactive connection creation
- Connection routing/pathfinding
- Connection styling

**Key Components:**

- `EditorCanvas.ConnectionLayer` - Renders all connections
- `ConnectionInspector` - Connection properties
- Connection creation tools

---

### 4. **Palette Domain**

**Purpose:** Library of available element types that can be added to the canvas

**Responsibilities:**

- Available element types
- Drag-to-create functionality
- Element categorization
- Search and filtering
- Element preview/tooltips

**Key Components:**

- `ElementPalette` - Main palette container
- `ElementPalette.Categories` - Grouped elements
- `ElementPalette.Item` - Draggable element type

---

### 5. **Inspector Domain**

**Purpose:** Detailed configuration of selected elements and connections

**Responsibilities:**

- Property editing
- Element configuration
- Connection configuration
- Validation and constraints
- Real-time updates

**Key Components:**

- `ElementInspector` - Element properties
- `ConnectionInspector` - Connection properties
- Property editors and controls

---

### 6. **Organization Domain**

**Purpose:** Managing and viewing all elements in the editor

**Responsibilities:**

- List/tree view of all elements
- Hierarchy management
- Visibility controls
- Locking/unlocking
- Batch operations
- Search and filter

**Key Components:**

- `ElementList` - List view of elements
- `ElementList.Tree` - Hierarchical view
- Visibility and lock controls

---

### 7. **Command Domain**

**Purpose:** User actions and operations on the editor

**Responsibilities:**

- Undo/redo system
- Copy/paste operations
- Delete operations
- Alignment and distribution
- Layout algorithms
- Import/export

**Key Components:**

- `EditorToolbar` - Command buttons
- Context menus
- Keyboard shortcuts
- Command palette

---

### 8. **State Domain**

**Purpose:** Managing editor state and persistence

**Responsibilities:**

- Element state management
- Connection state management
- Selection state
- History tracking
- Save/load operations
- Change detection

**Key Components:**

- `EditorProvider` - Context provider
- Store integration
- State synchronization

---

### 9. **Feedback Domain**

**Purpose:** User feedback and status information

**Responsibilities:**

- Status indicators
- Progress feedback
- Error messages
- Tooltips and hints
- Validation feedback

**Key Components:**

- `EditorStatusBar` - Status information
- Toast notifications
- Loading indicators
- Validation messages

---

## Domain Interactions

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Palette   │──────▶   Canvas    │◀────▶│   Element   │
│   Domain    │      │   Domain    │      │   Domain    │
└─────────────┘      └─────────────┘      └─────────────┘
                            │                     │
                            │                     │
                            ▼                     ▼
                     ┌─────────────┐      ┌─────────────┐
                     │ Connection  │      │  Inspector  │
                     │   Domain    │      │   Domain    │
                     └─────────────┘      └─────────────┘
                            │                     │
                            └──────────┬──────────┘
                                       ▼
                               ┌─────────────┐
                               │    State    │
                               │   Domain    │
                               └─────────────┘
```

## Design Principles

### 1. **Domain Agnostic**

The editor doesn't know what the elements represent. It only knows they can be:

- Positioned in 2D space
- Connected to each other
- Selected and configured
- Created and deleted

### 2. **Separation of Concerns**

Each domain has clear boundaries and responsibilities. Domains communicate through:

- Events (via core.events)
- State (via store)
- Props and callbacks

### 3. **Extensibility**

Domains can be extended without modifying core functionality:

- Custom element renderers
- Custom property editors
- Custom connection types
- Custom tools and commands

### 4. **Composability**

Domains can be mixed and matched:

- Use Canvas without Palette
- Use Inspector without ElementList
- Custom domain combinations

## Implementation Status

| Domain       | Status         | Components              | Notes                      |
| ------------ | -------------- | ----------------------- | -------------------------- |
| Canvas       | 🟡 Partial     | EditorCanvas basics     | Needs controls, grid       |
| Element      | 🟡 Partial     | Basic element rendering | Needs ports, controls      |
| Connection   | 🟡 Partial     | Basic connections       | Needs interactive creation |
| Palette      | 🔴 Not Started | -                       | High priority              |
| Inspector    | 🔴 Not Started | -                       | High priority              |
| Organization | 🔴 Not Started | -                       | Medium priority            |
| Command      | 🟡 Partial     | Basic undo/redo         | Needs toolbar, menus       |
| State        | 🟢 Complete    | Store, context          | Working                    |
| Feedback     | 🔴 Not Started | -                       | Low priority               |
