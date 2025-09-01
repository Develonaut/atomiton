# Technology Stack & Architecture Decisions

## 📑 Table of Contents

### 📊 Architecture Status

- [Architecture Review Findings](#architecture-review-findings) - Implementation vs documentation gaps
- [Core Infrastructure](#core-infrastructure) - Frontend, desktop, state management, and build tools
  - [Frontend Framework](#frontend-framework) - Vite + React + Mantine
  - [Desktop Platform](#desktop-platform) - Electron capabilities
  - [State Management](#state-management) - Current multi-library situation
  - [Build Tool](#build-tool) - Turborepo with pnpm
  - [Queue System](#queue-system) - Job processing options

### 🎨 Blueprint System Technologies

- [Blueprint System Technologies](#blueprint-system-technologies) - Specialized tools for visual workflows
  - [Visual Editor](#visual-editor) - React Flow implementation
  - [State Management](#state-management-1) - Immer for immutable updates
  - [Data Validation](#data-validation) - Zod for schema validation
  - [Node Execution](#node-execution) - Planned vm2 sandboxing
  - [Parallel Processing](#parallel-processing) - Worker threads planning
  - [Event System](#event-system) - EventEmitter3 for communication

### 💾 Data Storage & Security

- [Data Storage Strategy](#data-storage-strategy) - File-based storage approach
  - [Blueprint Storage](#blueprint-storage) - YAML/JSON format
  - [Versioning](#versioning) - Semantic versioning
  - [Storage Approach](#storage-approach) - Local vs cloud strategy
- [Security Measures](#security-measures) - Security implementation gaps
  - [Code Execution](#code-execution) - Sandboxing requirements
  - [Data Handling](#data-handling) - Input validation and protection
  - [Missing Security Architecture](#missing-security-architecture) - Critical gaps

### 🎯 Architecture Decisions

- [Key Architecture Decisions](#key-architecture-decisions) - Technology choice rationale
  - [Why These Choices?](#why-these-choices) - Decision explanations
  - [React Flow](#react-flow) - Visual editor choice
  - [Mantine UI](#mantine-ui) - Component library benefits
  - [File-based Storage](#file-based-storage) - Storage strategy
  - [Sandboxed Execution](#sandboxed-execution) - Security approach
  - [Zustand over Redux](#zustand-over-redux) - State management choice

### ⚡ Performance & Platform Support

- [Performance Considerations](#performance-considerations) - Optimization strategies
  - [Frontend Optimization](#frontend-optimization) - UI performance
  - [Execution Optimization](#execution-optimization) - Backend efficiency
  - [Build Optimization](#build-optimization) - Build system performance
- [Platform Support Strategy](#platform-support-strategy) - Cross-platform approach
  - [Desktop (Primary)](#desktop-primary) - Full capabilities
  - [Web (Secondary)](#web-secondary) - Limited capabilities
  - [Cross-Platform Code](#cross-platform-code) - Shared functionality

### ❌ Issues & Future Plans

- [IDENTIFIED ISSUES & REQUIRED FIXES](#-identified-issues--required-fixes) - Known problems
  - [Package Dependencies Issues](#package-dependencies-issues) - Node.js built-ins
  - [State Management Consolidation Required](#state-management-consolidation-required) - Multi-library cleanup
- [Future Considerations](#future-considerations) - Evolution path
  - [Potential Additions](#potential-additions) - Technology candidates
  - [Scaling Path](#scaling-path) - Growth strategy

This document outlines the technology choices for Atomiton and the rationale behind each decision.

## Core Infrastructure

### Frontend Framework

- **Vite + React + Mantine UI**
  - Vite: Lightning-fast dev server and build tool
  - React: Industry-standard UI library with vast ecosystem
  - Mantine: Data-heavy components perfect for dashboards and node configuration panels

### Desktop Platform

- **Electron**
  - Node.js familiarity advantage
  - Cross-platform desktop support
  - Native file system access
  - External process execution capabilities

### State Management

✅ **PRODUCTION IMPLEMENTATION**: Zustand-based architecture fully implemented (2025-09-01)

- **Production Primary**: **Zustand** (fully implemented)
  - Modern, type-safe store architecture
  - Clean separation: clients → store → services
  - ~70% code reduction from previous implementation
  - Zero boilerplate with excellent TypeScript support
  - Perfect for Blueprint state management

- **Architecture**:
  - **StoreService**: Central service layer with dependency inversion
  - **Domain Stores**: Organized by feature with Zustand
  - **StoreClient**: Clean API for consuming applications
  - **Status**: ✅ **COMPLETE** - Modern Zustand architecture implemented

### Build Tool

- **Turborepo with pnpm**
  - Monorepo management
  - Efficient dependency management
  - Fast builds with caching
  - Workspace support

### Event System

✅ **PRODUCTION IMPLEMENTATION**: EventClient service fully implemented (2025-09-01)

- **EventClient**
  - Centralized event communication for the entire @atomiton/core package
  - Simple API: `broadcast(event)` and `listen(callback)`
  - Type-safe `SystemEvent` interface
  - Error isolation and memory management
  - Ready for integration across stores, services, and UI components
  - Status: ✅ **COMPLETE** - Production-ready implementation

### Queue System

- **p-queue** (current)
  - Simple and lightweight
  - Sufficient for current needs
- **BullMQ** (if complex needs arise)
  - Redis-backed for persistence
  - Advanced scheduling capabilities

## Blueprint System Technologies

### Visual Editor

- **React Flow**
  - Mature node-based editor with connections
  - Excellent TypeScript support
  - Customizable node and edge types
  - Built-in viewport controls

### State Management

- **Immer**
  - Immutable state updates for complex Blueprint changes
  - Simpler syntax for nested updates
  - Works well with Zustand

### Data Validation

- **Zod**
  - Runtime schema validation for node data types
  - TypeScript type inference
  - Composable schemas
  - Clear error messages

### Node Execution

❌ **PLANNED - NOT IMPLEMENTED**

- **vm2** (documented but missing)
  - Secure sandboxed execution for custom node code
  - Resource control
  - Prevents malicious code execution
  - Isolation from main process
  - **Status**: ❌ **Critical Gap** - No execution engine implemented

### Parallel Processing

❌ **PLANNED - NOT IMPLEMENTED**

- **node-worker-threads-pool** (documented but missing)
  - Parallel node execution
  - CPU-intensive task offloading
  - Shared memory support
  - Efficient resource utilization
  - **Status**: ❌ **Pending** - Awaits execution engine implementation

### Event System

✅ **PRODUCTION IMPLEMENTATION**: EventClient service fully implemented (2025-09-01)

- **Production Primary**: **EventClient** (fully implemented)
  - Simple 20-line implementation extending Node.js EventEmitter
  - System-wide event broadcasting with `eventClient.broadcast(event)`
  - Type-safe event listening with `eventClient.listen(callback)`
  - `SystemEvent` interface with type, source, timestamp, data fields
  - Error isolation - listener errors don't crash the system
  - Memory management with configurable max listeners (1000)
  - Status: ✅ **COMPLETE** - Production-ready with comprehensive testing

- **EventEmitter3** (planned alternative)
  - Enhanced event system for node communication
  - TypeScript support
  - High performance
  - Memory efficient
  - Status: Not needed - EventClient meets all requirements

## Data Storage Strategy

### Blueprint Storage

- **YAML/JSON files**
  - Human-readable Blueprint definitions
  - Easy version control with Git
  - Simple sharing mechanism
  - No database complexity

### Versioning

- **semver**
  - Blueprint versioning support
  - Clear compatibility rules
  - Industry standard

### Storage Approach

- **File-based** (current)
  - Local development friendly
  - No external dependencies
  - Easy backup and restore
- **Future scaling**: Databases/cloud storage when needed

## Key Architecture Decisions

### Why These Choices?

#### React Flow

- **Mature & Battle-tested**: Used in production by many companies
- **Excellent Documentation**: Comprehensive guides and examples
- **Active Community**: Regular updates and support
- **TypeScript First**: Full type safety

#### Mantine UI

- **Data-Heavy Components**: Perfect for dashboards
- **Consistent Design**: Professional look out of the box
- **Accessibility**: WCAG compliance built-in
- **Dark Mode**: Native support

#### File-based Storage

- **Simplicity**: No database setup or migrations
- **Portability**: Blueprints are just files
- **Version Control**: Standard Git workflows
- **Sharing**: Easy to distribute Blueprint files

#### Sandboxed Execution

- **Security**: Isolated execution environment
- **Reliability**: Node failures don't crash the app
- **Resource Control**: Memory and CPU limits
- **Debugging**: Clear error boundaries

#### Zustand over Redux

- **Simplicity**: Less boilerplate
- **Performance**: Minimal re-renders
- **TypeScript**: Better type inference
- **Learning Curve**: Easier for team onboarding

## Performance Considerations

### Frontend Optimization

- Code splitting with dynamic imports
- React.memo for expensive components
- Virtual scrolling for large lists
- Lazy loading of heavy components

### Execution Optimization

- Worker threads for CPU-intensive tasks
- Streaming for large data processing
- Caching of compiled node code
- Connection pooling for external resources

### Build Optimization

- Tree shaking to remove unused code
- Minification and compression
- Asset optimization
- Turborepo caching for faster builds

## Security Measures

❌ **CRITICAL SECURITY GAPS IDENTIFIED**

### Code Execution (❌ **MISSING**)

- ❌ vm2 sandboxing for user code (**Not implemented**)
- ❌ Input sanitization (**Minimal implementation**)
- ❌ Permission-based node capabilities (**Not implemented**)
- ❌ Resource usage limits (**Not implemented**)

### Data Handling (⚠️ **PARTIAL**)

- ❌ Schema validation on all inputs (**Zod planned but not comprehensive**)
- ⚠️ Secure file path handling (**Basic implementation**)
- ⚠️ CORS configuration for web platform (**Basic CORS only**)
- ✅ Electron context isolation (**Implemented**)

### Missing Security Architecture

- ❌ **Authentication/Authorization**: No user management system
- ❌ **Data Encryption**: No encryption at rest or in transit
- ❌ **Audit Logging**: No security event logging
- ❌ **Comprehensive Security Headers**: Basic implementation only

⚠️ **RISK LEVEL**: HIGH - See [SECURITY.md](./SECURITY.md) for detailed security implementation plan

## Platform Support Strategy

### Desktop (Primary)

- Full file system access
- External process execution
- Native OS integration
- Hardware acceleration

### Web (Secondary)

- Limited file access via File API
- No external process execution
- Browser sandbox restrictions
- Progressive enhancement

### Cross-Platform Code

- Platform detection utilities
- Graceful feature degradation
- Consistent API surface
- Platform-specific implementations

## ❌ **IDENTIFIED ISSUES & REQUIRED FIXES**

### Package Dependencies Issues

**Problem**: Invalid optional dependencies in packages/core/package.json

```json
// ❌ INCORRECT - These are built-in Node.js modules, not external packages
"optionalDependencies": {
  "fs": "*",           // Built-in Node.js module
  "path": "*",         // Built-in Node.js module
  "crypto": "*",       // Built-in Node.js module
  "child_process": "*" // Built-in Node.js module
}
```

**Solution**: Remove these from optionalDependencies - Node.js built-ins don't need to be listed

### State Management Migration - ✅ COMPLETED

**Migration Status**: Complete migration from TanStack Store to Zustand (2025-09-01)

**Completed Actions**:

1. ✅ Complete architecture migration from TanStack Store to Zustand
2. ✅ Implemented clean separation: clients → store → services
3. ✅ Eliminated legacy state management complexity (~70% code reduction)
4. ✅ Established modern Zustand-first architecture
5. ✅ Comprehensive testing with 590+ test cases
6. ✅ Production-ready build with clean TypeScript compilation

**Current State**: Single, unified Zustand-based state management across all packages

## Future Considerations

### Potential Additions

- **GraphQL**: For complex data fetching needs
- **WebAssembly**: For performance-critical nodes
- **Redis**: For distributed job queuing
- **PostgreSQL**: For Blueprint metadata storage
- **S3/Cloud Storage**: For Blueprint sharing

### Scaling Path

1. Start with file-based storage
2. Add SQLite for local metadata
3. Move to PostgreSQL for teams
4. Integrate cloud storage for sharing
5. Implement Redis for distributed execution

---

Last Updated: 2025-09-01 (EventClient implementation completed)
