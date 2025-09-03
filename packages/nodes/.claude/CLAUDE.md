# Nodes Package - Claude Instructions

This is the **@atomiton/nodes** package containing the node system and implementations.

## Package Status

⚠️ **Package exists but is not wired up yet**

We have the node architecture from a previous implementation. Currently only CSV Parser is implemented as a reference.

## What's Here

- Base node classes (BaseNodeLogic, BaseNodePackage)
- Node registry system
- CSV Parser node (reference implementation)
- Type definitions and interfaces
- Zod validation schemas

## Documentation

See [/docs/domains/nodes/](../../../docs/domains/nodes/) for:

- Node system architecture
- Developer guide for creating nodes
- Roadmap for 20-50 essential nodes
- Comparison with n8n patterns

## Current Priority

Not active - waiting for:

1. UI migration to be beautiful first
2. Core package integration
3. Then build essential nodes

## Key Decisions

- 20-50 excellent nodes, not 500+ mediocre ones
- Desktop-first capabilities
- Streaming architecture for performance
- AI-native node design

---

For main project instructions: [Root CLAUDE.md](../../../.claude/CLAUDE.md)
