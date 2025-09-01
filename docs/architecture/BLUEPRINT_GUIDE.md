# Blueprint Development Guide

## 📑 Table of Contents

### 🚨 Critical Requirements

- [CRITICAL: Before Working on Blueprint Features](#critical-before-working-on-blueprint-features) - Essential pre-work reading
- [Blueprint System Architecture](#blueprint-system-architecture) - Core components overview

### 📊 Implementation Status

- [Core Components - Implementation Status](#core-components---implementation-status) - What's built vs missing
- [Implementation Status](#implementation-status) - Detailed component status
  - [Fully Implemented Components](#-fully-implemented-components) - Working features
  - [Critical Missing Components](#-critical-missing-components) - Blocking gaps
  - [Architectural Decisions Made](#architectural-decisions-made) - Current choices

### 🎯 Development Priorities

- [Development Requirements](#development-requirements) - Quality and consistency standards
- [Next Development Priorities](#next-development-priorities---updated-post-review) - Updated roadmap
  - [Critical for Core Functionality](#-critical-for-core-functionality) - Most urgent items
  - [High Priority Items](#high-priority-items) - Essential features
  - [Medium Priority Items](#medium-priority-items) - Important improvements

### 📚 Reference Documentation

- [Related Documentation](#related-documentation) - Links to related guides

> **Note**: This guide describes the target architecture and development requirements for the Blueprint system.

## CRITICAL: Before Working on Blueprint Features

**ALWAYS read `/docs/ui/design/EDITOR_VISION.md` first** when working on:

- Blueprint Editor UI components (✅ **IMPLEMENTED**)
- Node creation or modification (✅ **IMPLEMENTED**)
- Visual workflow features (✅ **IMPLEMENTED**)
- Node palette or connection logic (✅ **IMPLEMENTED**)
- Blueprint execution or visualization

This document contains:

- Design specifications and color schemes (Dracula theme) ✅
- Node structure and categories ✅
- Interaction patterns and UX requirements ✅
- Performance targets and success metrics

## Blueprint System Architecture

The Blueprint system is the core of the Atomiton platform, enabling visual workflow creation through a node-based editor.

### Core Components

1. **Blueprint Editor** - Visual workflow designer using React Flow
2. **Node Registry** - Catalog of available node types
3. **Execution Engine** - Runtime for executing Blueprint workflows
4. **Job System** - Queue and management for Blueprint executions

### System Components

**Visual Blueprint Editor Foundation**:

- React Flow visual editor with drag-and-drop functionality
- Node types across multiple categories
- Dracula theme consistently applied across all components
- Test coverage including E2E tests with Playwright
- Editor accessible at /blueprints route in client app

**Required Components**:

**Blueprint Execution Engine**

- Components: Job queue, node execution runtime, progress tracking
- Purpose: Core platform functionality for Blueprint execution

**Node Configuration System**

- Components: Property panels, validation, type checking
- Purpose: Node property editing and behavior customization

**Blueprint Persistence**

- Components: Blueprint serialization, file storage, version management
- Purpose: Save and load Blueprint functionality

**Connection Validation**

- Components: Type checking, validation rules, user feedback
- Purpose: Prevent invalid workflow creation

**Architectural Decisions**:

- Blueprint Editor maintained in `@atomiton/ui` package
- E2E testing through client app using Playwright
- Future extraction to `@atomiton/blueprint-editor` package as complexity grows

### Development Requirements

When working on Blueprint features, ensure:

- Visual consistency with Dracula theme
- Node categorization follows established color coding
- Performance meets target metrics from vision document
- Integration with existing data models

### Next Development Priorities

**Core Functionality Requirements**:

1. **Blueprint Execution Engine**
   - Components: Job queue system, node execution runtime, progress tracking
   - Purpose: Enable Blueprint execution beyond visual editing
   - Priority: Critical for platform functionality

2. **Node Configuration System**
   - Components: Property panels, validation, type checking
   - Purpose: Node customization and property editing
   - Priority: Essential for usability

3. **Save/Load Functionality**
   - Components: Blueprint serialization, file storage, version management
   - Purpose: Blueprint persistence and workflow management
   - Priority: Basic functionality requirement

4. **Security Architecture**
   - Components: Input validation, sandboxed execution, authentication
   - Purpose: Production security and vulnerability prevention
   - Priority: Required for production deployment

5. **Connection Validation**
   - Enable type checking between connected nodes
   - Prevent invalid workflow creation
   - Provide user feedback on connection errors

6. **Error Handling**
   - Graceful failure management across the system
   - User-friendly error messages
   - Recovery mechanisms

### Related Documentation

- **[SYSTEM.md](./SYSTEM.md)** - Overall system architecture
- **[NAVIGATION.md](./NAVIGATION.md)** - Blueprint UI navigation
- **[Visual References](../ui/design/README.md)** - UI design requirements
- **[Data Models](./MODELS.md)** - Blueprint and node data structures

---

---

**Last Updated**: 2025-08-31  
**Architecture Review By**: Michael (Blueprint System Architect)  
**Maintained By**: Michael (blueprint-system-architect), Picasso (visual-blueprint-editor)  
**Development Focus**: Blueprint system architecture and implementation requirements
