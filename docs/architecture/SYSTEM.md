# Atomiton - Blueprint Automation Platform

## 📑 Table of Contents

### 📚 Documentation & Status

- [Documentation Structure](#documentation-structure) - Related docs and references
- [Architecture Overview](#architecture-overview) - System design and components
- [Project Overview](#project-overview) - Platform vision and current state
- [Core Problem Being Solved](#core-problem-being-solved) - Use cases and solutions

### 🛠️ Technology & Architecture

- [Technology Stack](#technology-stack) - Core infrastructure and Blueprint system tech
  - [Core Infrastructure](#core-infrastructure) - Frontend, desktop, and build tools
  - [Blueprint System](#blueprint-system) - Visual editor and execution technologies
  - [Data Storage](#data-storage) - Storage strategy and versioning
  - [Why These Choices](#why-these-choices) - Technology decision rationale
  - [Key Components](#key-components) - System building blocks
- [Architecture Design](#architecture-design) - System structure and data flow
  - [Blueprint-Centric Data Flow](#blueprint-centric-data-flow) - Core workflow
  - [Application Structure](#application-structure) - Monorepo and user data organization
  - [Core Data Models](#core-data-models) - TypeScript interfaces and schemas

### 🚀 Implementation & Development

- [MVP Implementation Plan](#mvp-implementation-plan) - Phased development approach
  - [Phase 1: Blueprint Foundation](#phase-1-blueprint-foundation) - Core system basics
  - [Phase 2: Node Library Expansion](#phase-2-node-library-expansion) - Essential node types
  - [Phase 3: Advanced Features & Polish](#phase-3-advanced-features--polish) - Production readiness
- [API Architecture & Versioning Strategy](#api-architecture--versioning-strategy) - API design principles
  - [API Design Principles](#api-design-principles) - Versioning and structure
  - [Versioned API Structure](#versioned-api-structure) - Endpoint organization
  - [Node Registry Architecture](#node-registry-architecture) - Dynamic node management
  - [API Versioning Rules](#api-versioning-rules) - Compatibility guidelines

### 🎯 Key Decisions & Rationale

- [Key Technical Decisions](#key-technical-decisions) - Why these architectural choices
  - [Why Visual Blueprint Editor?](#why-visual-blueprint-editor) - User accessibility
  - [Why Node-Based Architecture?](#why-node-based-architecture) - System benefits
  - [Why File-Based Storage?](#why-file-based-storage) - Simplicity and portability
  - [Why Sandboxed Execution?](#why-sandboxed-execution) - Security and reliability

### 📖 Development Guidelines & Process

- [Development Core Values](#development-core-values) - Philosophy and principles
- [Current Implementation Status](#current-implementation-status) - Progress tracking
- [Important File Locations](#important-file-locations) - Key project files
- [Configuration Notes](#configuration-notes) - Blender and platform settings
- [Success Metrics](#success-metrics) - Performance targets
- [Notes for Resuming Development](#notes-for-resuming-development) - Quick restart guide

### 👥 Agent Coordination

- [Development Approach - Agent-Based Task Distribution](#development-approach---agent-based-task-distribution) - Team workflow
  - [Proposed Agents](#proposed-agents) - Specialized agent roles
  - [Agent Task Breakdown](#agent-task-breakdown) - Task distribution
  - [Parallel Development Strategy](#parallel-development-strategy) - Coordination approach

### 🏗️ Implementation Details

- [Implementation Details](#implementation-details) - Monorepo and service architecture
  - [Monorepo Structure](#monorepo-structure-turborepo--pnpm) - Workspace organization
  - [Key API Services](#key-api-services) - Core service modules
  - [Frontend Components](#frontend-components) - UI component structure

## Documentation Structure

This is the main architecture document. For specific aspects of the project, see:

- **[STACK.md](./STACK.md)** - Detailed technology choices and rationale
- **[MODELS.md](./MODELS.md)** - TypeScript interfaces and data structures
- **[DEVELOPMENT_CORE_VALUES.md](../development/CORE_VALUES.md)** - Development philosophy and standards
- **[DEVELOPMENT_PROCESS.md](../development/PROCESS.md)** - Quality assurance and validation processes
- **[MVP_ROADMAP.md](../planning/MVP_ROADMAP.md)** - Phase-based implementation roadmap
- **[AGENT_EXECUTION_PLAN.md](../../.claude/agents/coordination/AGENT_EXECUTION_PLAN.md)** - Agent collaboration workflow and requirements

## Architecture Overview

> **Note**: This document describes the target architecture for the Atomiton platform. See [CURRENT_STATUS.md](../status/CURRENT_STATUS.md) for current implementation status.

## Project Overview

**Atomiton** is a visual automation platform that transforms complex workflows into reusable "Blueprints" using a node-based editor similar to Unreal Engine's Blueprint system. While originally designed to automate 3D model rendering pipelines, it's architected as a general-purpose automation tool that can handle any workflow composed of discrete, connected steps.

## Core Problem Being Solved

**Original Use Case**: 3D Model Rendering Automation
Currently manual process:

1. Ingest Spreadsheet (manifest.csv)
2. Configure Directory Structure Directory From Manifest
3. Generate Overlays from Manifest
4. Render STL In Blender
5. Composite Result
6. Save To Directory/Download (Web)

**Generalized Solution**: Visual Workflow Automation

- Transform manual processes into reusable Blueprint workflows
- Connect discrete automation steps through visual node editor
- Execute Blueprints as Jobs with real-time monitoring
- Share and version Blueprints for community collaboration

## Technology Stack

### Core Infrastructure

- **Frontend**: Vite (Currently Next.js, migration planned) + React + Mantine UI (Currently react and tailwind, migration planned) (wrapper-first component library)
- **Desktop**: Electron (Node.js familiarity advantage)
- **State Management**: Zustand (production implementation - modern, type-safe stores)
- **Build Tool**: Turborepo with pnpm
- **Queue System**: p-queue (simple) or BullMQ (if complex needs arise)

### Blueprint System

- **Visual Editor**: React Flow - mature node-based editor with connections
- **State Management**: Immer - utilized using core packages Core.Store API
- **Data Validation**: Zod - runtime schema validation for node data types
- **Node Execution**: vm2 - secure sandboxed execution for custom node code
- **Parallel Processing**: node-worker-threads-pool - parallel node execution
- **Event System**: EventEmitter - using core packages Core.Event API

### Data Storage

- **Blueprint Storage**: YAML/JSON files for human-readable Blueprint definitions
- **Versioning**: semver - Blueprint versioning support
- **Local Storage**: File-based storage with scaling to databases/cloud later

### Why These Choices

- **React Flow**: Mature, battle-tested node editor with excellent TypeScript support
- **Mantine**: Data-heavy components perfect for dashboards and node configuration panels
- **File-based Storage**: Enables local development and easy Blueprint sharing
- **Sandboxed Execution**: Security and isolation for user-defined node logic
- **Zustand**: Production-ready state management with clean architecture (clients → store → services)

### Key Components

- **Blueprint System**: Visual workflow editor with node-based connections
- **Job Execution Engine**: Sandboxed execution environment for Blueprint workflows
- **Node Library**: Extensible collection of automation building blocks
- **Real-time Monitoring**: WebSocket-based progress tracking and status updates

## Architecture Design

### Blueprint-Centric Data Flow

```
[Blueprint Definition] → [Job Creation] → [Node Execution]
         ↓                      ↓                ↓
[Node Graph Validation] → [Execution Plan] → [Progress Tracking]
         ↓                      ↓                ↓
      [Node Library] → [Sandboxed Runtime] → [Output Collection]
                               ↓
                       [Real-time Updates]
```

## API Architecture & Versioning Strategy

### API Design Principles

- **Version from Day One**: All APIs under `/api/v1/` to enable future evolution
- **Consistent Response Format**: Standardized success/error responses
- **Middleware Layer**: Authentication, validation, error handling

### Node Registry Architecture

The node registry (packagves/node) provides a scalable way to manage node types:

- **Dynamic Registration**: Nodes self-register on startup
- **Schema Validation**: Each node provides Zod schema
- **Execution Isolation**: Sandboxed execution per node
- **Hot Reloading**: Add nodes without restart

### API Versioning Rules

1. **Major versions** (`v1` → `v2`): Breaking changes
2. **Feature flags**: New features behind flags in same version
3. **Deprecation notices**: 3-month warning before removal
4. **Backward compatibility**: Maintain old versions for 6 months

## Key Technical Decisions

### Why Visual Blueprint Editor?

- **Accessibility**: Non-programmers can create complex automations
- **Flexibility**: Visual connections make data flow explicit
- **Reusability**: Blueprints can be shared and modified easily
- **Debugging**: Visual representation makes troubleshooting intuitive

### Why Node-Based Architecture?

- **Single Responsibility**: Each node handles one specific task
- **Composability**: Nodes can be combined in unlimited ways
- **Testability**: Individual nodes can be tested in isolation
- **Extensibility**: New nodes can be added without changing core system

### Why File-Based Storage?

- **Simplicity**: No database setup or migration complexity
- **Portability**: Blueprints are just files that can be easily shared
- **Version Control**: Standard git workflows for Blueprint management
- **Local Development**: Works offline with no external dependencies

### Why Sandboxed Execution?

- **Security**: User-defined node code runs in isolated environment
- **Reliability**: Node failures don't crash the entire application
- **Resource Management**: Control memory and CPU usage per node
- **Debugging**: Clear separation between node issues and platform issues

---

Last Updated: 2025-08-29
Next Action: Implement Blueprint foundation and visual editor
