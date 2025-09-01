# Nodes System - Cross-Package Integration

**Nodes are the fundamental building blocks of the entire Atomiton platform.** This document provides a high-level overview of how the node system integrates across all packages in the monorepo.

## Package Documentation

**For complete technical documentation, see the node package documentation:**

📚 **[packages/nodes/docs/](../../packages/nodes/docs/README.md)** - Complete node system documentation including:

- Technical architecture and design patterns
- Developer guides for creating new nodes
- API reference and testing strategies
- Migration guides and best practices

## Cross-Package Integration Overview

### @atomiton/nodes Package (Source of Truth)

**Location**: `packages/nodes/`

- **Purpose**: Unified node library solving the "split logic" problem
- **Contains**: All node implementations, base classes, adapters, registry
- **Documentation**: [packages/nodes/docs/](../../packages/nodes/docs/)

### Integration with @atomiton/ui

**Location**: `packages/ui/`

- **Node Palette**: UI components for browsing and selecting nodes
- **Theme Injection**: Provides theme functions to node adapters
- **Blueprint Editor**: Visual workflow creation using node UI components
- **Configuration Panels**: Auto-generated from node Zod schemas

### Integration with @atomiton/core

**Location**: `packages/core/`

- **Execution Engine**: Runs node logic in automation workflows
- **Context Management**: Provides execution contexts for nodes
- **Performance Monitoring**: Tracks node execution times and resources
- **Error Handling**: Centralized error management for node failures

### Integration with @atomiton/electron

**Location**: `packages/electron/`

- **Desktop Runtime**: Executes Desktop APIs
- **File System Access**: Enhanced file operations for desktop nodes
- **Native Integrations**: Platform-specific node capabilities

## UI-Specific Node Integration

This section covers how UI applications integrate with the node system:

### Node Palette Integration

```typescript
// UI applications use the node registry to populate palettes
import { initializeNodeRegistry } from '@atomiton/nodes';

const { registry } = await initializeNodeRegistry();
const availableNodes = registry.getAllNodes();

// Render node palette with category grouping
<NodePalette nodes={availableNodes} />
```

### Blueprint Editor Integration

```typescript
// Blueprint editor renders nodes using their UI components
import { getNodePackage } from '@atomiton/nodes';

const nodePackage = await getNodePackage(nodeId);
<nodePackage.ui
  data={nodeData}
  selected={isSelected}
  onConfigChange={handleConfigChange}
/>
```

### Theme System Integration

```typescript
// UI packages provide theme injection for adapters
const themeAdapter = createReactFlowAdapter({
  theme: {
    getCategoryColor: (category) => uiTheme.colors.categories[category],
    getStatusColor: (status) => uiTheme.colors.status[status],
    fonts: uiTheme.fonts,
    spacing: uiTheme.spacing,
  },
});
```

## Cross-Package Development Workflows

### Adding a New Node Type

1. **Create node in @atomiton/nodes** - Complete node package with logic, UI, config
2. **Update @atomiton/core** - Add execution support if needed
3. **Update @atomiton/ui** - Add to node palette categories
4. **Test integration** - Ensure node works across all environments

### Updating Node Architecture

1. **Change base classes in @atomiton/nodes** - Update foundation
2. **Migrate existing nodes** - Apply changes to all implementations
3. **Update consuming packages** - Adapt UI and core integration
4. **Validate cross-package compatibility** - Test all integrations

### Performance Optimization

1. **Profile in @atomiton/nodes** - Identify bottlenecks
2. **Optimize core execution** - Improve runtime performance
3. **Enhance UI rendering** - Reduce visual update overhead
4. **Monitor across environments** - Desktop, web, server

## Architecture Benefits

### Single Source of Truth

- **No duplication** between UI and core packages
- **Consistent behavior** across all environments
- **Easier maintenance** with co-located logic and UI

### Clean Separation of Concerns

- **Logic files** cannot import UI components
- **UI files** cannot contain business logic
- **Shared configuration** via Zod schemas

### Cross-Platform Compatibility

- **Same node logic** works in web, desktop, and server
- **Platform-specific adaptations** through base classes
- **Consistent UI** across all visualization libraries

## Quick Links

- **[Node System Architecture](../../packages/nodes/docs/ARCHITECTURE.md)** - Deep technical architecture
- **[Developer Guide](../../packages/nodes/docs/DEVELOPER_GUIDE.md)** - Creating new nodes
- **[API Reference](../../packages/nodes/docs/API_REFERENCE.md)** - Complete API documentation
- **[Testing Strategy](../../packages/nodes/docs/TESTING.md)** - Testing approaches and personas
- **[Migration Guide](../../packages/nodes/docs/MIGRATION_GUIDE.md)** - Upgrading from old architecture

## Related Documentation

- **[Project Architecture](./SYSTEM.md)** - Overall system design
- **[Blueprint Development Guide](./BLUEPRINT_GUIDE.md)** - Visual workflow system
- **[UI Strategy](../ui/components/ARCHITECTURE.md)** - UI development approach

---

**Last Updated**: 2025-08-30  
**Maintained By**: Barbara (Documentation Authority)  
**Cross-Package Integration**: All packages in monorepo
