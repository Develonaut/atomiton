# Critical User Flows - Atomiton Editor

These are the core user workflows that MUST work for the application to be functional. Smoke tests should verify these paths.

## 🎯 Primary User Flows

### 1. **Node Management Flow**

**User Goal**: Add and configure nodes in the editor

**Critical Path**:

1. ✅ User can see available nodes in the palette (left sidebar)
2. ✅ User can add a node to the canvas (drag or click)
3. ✅ Node appears on the canvas at correct position
4. ✅ User can select a node (click on canvas or scene list)
5. ✅ Selected node properties display in right sidebar
6. 🚧 User can edit node properties
7. 🚧 Property changes persist to the node

**Tests Required**:

- Store can add nodes
- Canvas renders nodes
- Selection synchronizes between canvas and UI
- Properties display for selected nodes

### 2. **Workflow Creation Flow**

**User Goal**: Build a working automation workflow

**Critical Path**:

1. ✅ User can add multiple nodes
2. 🚧 User can connect nodes (draw connections)
3. 🚧 Connections validate (compatible types)
4. 🚧 User can delete nodes and connections
5. 🚧 User can run the workflow
6. 🚧 Execution status shows on nodes

**Tests Required**:

- Multiple nodes can be added
- Connections can be created
- Deletion works correctly
- Workflow execution starts

### 3. **Save/Load Flow**

**User Goal**: Persist and restore work

**Critical Path**:

1. 🚧 User can save a Blueprint
2. 🚧 Save creates valid .atom file
3. 🚧 User can load a Blueprint
4. 🚧 Load restores exact state
5. 🚧 Auto-save prevents data loss

**Tests Required**:

- Serialization works
- Deserialization restores state
- File format is valid

### 4. **Canvas Navigation Flow**

**User Goal**: Navigate and organize the workspace

**Critical Path**:

1. ✅ User can pan the canvas
2. ✅ User can zoom in/out
3. ✅ Minimap shows overview
4. ✅ Grid helps with alignment
5. ✅ Keyboard shortcuts work (Delete key)

**Tests Required**:

- Pan/zoom handlers work
- Minimap renders
- Keyboard handlers respond
- Delete key removes selected nodes

## 🔥 Smoke Test Coverage

### Phase 1: Current Implementation (What's Built)

```javascript
// These should be in our smoke tests NOW
tests = [
  "Editor store can manage nodes",
  "Canvas renders and updates",
  "Node selection works",
  "Properties display for nodes",
  "Keyboard shortcuts work",
  "Pan/zoom functions work",
];
```

### Phase 2: Next Priority (Being Built)

```javascript
// Add these as we build features
tests = [
  "Node properties can be edited",
  "Connections can be created",
  "Workflow can execute",
  "Basic save/load works",
];
```

### Phase 3: Full Coverage (Future)

```javascript
// Complete smoke suite
tests = [
  "Full workflow creation",
  "Complex node configurations",
  "Error handling",
  "Performance under load",
];
```

## 📊 Current Status

| Flow              | Status       | Test Coverage |
| ----------------- | ------------ | ------------- |
| Node Management   | 70% Complete | Partial       |
| Workflow Creation | 20% Complete | None          |
| Save/Load         | 0% Complete  | None          |
| Canvas Navigation | 90% Complete | Partial       |

## 🎯 Definition of "Working"

A feature is considered **working** when:

1. User can complete the task without errors
2. UI provides appropriate feedback
3. State persists correctly
4. Performance is acceptable (<100ms response)
5. No console errors occur

## 🚨 Critical Failures

These scenarios should ALWAYS fail smoke tests:

- Cannot add nodes to canvas
- Cannot select nodes
- Canvas doesn't render
- Store loses state
- Keyboard shortcuts don't work
- Application crashes

---

**Last Updated**: 2025-01-10
**Next Review**: When implementing connection system
