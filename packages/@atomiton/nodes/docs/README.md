# @atomiton/nodes Documentation

## Overview

The @atomiton/nodes package provides the foundational building blocks for the Atomiton automation platform. Each node represents a discrete unit of functionality that can be connected to form complex workflows. This package emphasizes quality over quantity, desktop-first capabilities, and unified architecture.

## 🏗️ Unified Architecture

**Key Innovation**: All nodes implement the same `INode` interface, whether they are atomic nodes (individual functionality) or composite nodes (blueprints). This creates a powerful, scalable system where "everything executable is a node."

## Documentation Structure

### 📁 Architecture

- **[Unified Architecture](./architecture/UNIFIED_ARCHITECTURE.md)** - Current unified INode architecture with composition patterns
- **[Current Architecture](./architecture/CURRENT_ARCHITECTURE.md)** - Detailed architectural overview
- **[Comparison](./architecture/COMPARISON.md)** - How we differ from n8n and other platforms

### 🛠️ Development

- **[Developer Guide](./development/DEVELOPER_GUIDE.md)** - Creating custom nodes with the new unified architecture

### 📊 Status & Planning

- **[Current Work](../CURRENT.md)** - Active development tasks and sprint status
- **[Completed Work](../COMPLETED.md)** - Release history and accomplishments
- **[Next Work](../NEXT.md)** - Upcoming features and improvements
- **[Roadmap](../ROADMAP.md)** - Detailed long-term development plan

### 📚 Reference

- **[Changelog](./CHANGELOG.md)** - Version history and notable changes

## Current Status

### ✅ Completed (MVP Phase 2)

1. **Unified Node Architecture** - All nodes implement `INode` interface
2. **9 Essential Nodes** - MVP node set complete (CSV, HTTP, Transform, etc.)
3. **Factory API** - `nodes.extendNode()` for creating custom nodes without classes
4. **Conductor Compatible** - Any node (atomic or composite) can be executed
5. **DRY Implementation** - CompositeDefinition extends NodeDefinition

### 🔄 In Progress (Phase 3)

- Extended Essential Nodes (File Reader, File Writer, Directory Scanner, Webhook Receiver)
- Enhanced developer documentation
- Testing infrastructure improvements

## Key Features

### 🔗 Unified Interface

- Same `INode` interface for atomic and composite nodes
- Polymorphic execution: `node.execute()` works for any node type
- Seamless composition of atomic nodes into composite workflows

### 🏭 Factory Pattern

- Create nodes without classes using `nodes.extendNode()`
- Type-safe configuration with Zod schemas
- Automatic UI generation from schemas

### 🎯 Desktop-First

- Direct file system access without restrictions
- Local process execution and system integration
- No cloud dependencies or limitations

### 🤖 AI-Native

- Built for AI workflows from the ground up
- Streaming support for real-time processing
- Context-aware execution

## Getting Started

For developers looking to:

- **Use existing nodes**: See the main [README.md](../README.md) for usage examples
- **Create custom nodes**: Start with the [Developer Guide](./development/DEVELOPER_GUIDE.md)
- **Understand the architecture**: Read the [Unified Architecture](./architecture/UNIFIED_ARCHITECTURE.md) docs
- **Track progress**: Check [Current Work](../CURRENT.md) and [Roadmap](../ROADMAP.md)

## Node Categories (Current Implementation)

### ✅ MVP Complete (9 Nodes)

- **CSV/Spreadsheet Reader** - Read CSV files and spreadsheet data
- **File System** - Read, write files and manage directories
- **HTTP/API Request** - Call APIs with retry logic
- **Shell Command** - Execute system commands
- **Image Processor** - Composite and manipulate images
- **Transform** - Transform data, arrays, JSON, templates
- **JavaScript Code** - Custom JavaScript for complex logic
- **Loop/Iterate** - Process each row/item in data
- **Parallel** - Run multiple operations simultaneously

## Architecture Benefits

### 🔄 Unified Execution

- Same interface works for atomic and composite nodes
- Conductor can execute any node type seamlessly
- Recursive composition enables powerful patterns

### 🏗️ Clean Abstractions

- Clear separation between atomic (building blocks) and composite (orchestrators)
- No circular dependencies
- Framework-agnostic business logic

### 🚀 Developer Experience

- Factory pattern eliminates boilerplate classes
- Type-safe configuration with automatic validation
- Rich error handling and progress reporting

## Design Principles

1. **Quality Over Quantity** - 20-50 excellent nodes vs 500+ mediocre ones
2. **Desktop-First** - Leverage local capabilities without cloud restrictions
3. **AI-Native** - Built for AI workflows from the ground up
4. **Type Safety** - Full TypeScript coverage with runtime validation
5. **Unified Interface** - Everything executable implements `INode`
6. **Composition** - Atomic nodes compose into powerful composite workflows

---

For detailed information, see the specific documentation linked above. The documentation is organized to support both newcomers learning the system and experienced developers implementing advanced features.
