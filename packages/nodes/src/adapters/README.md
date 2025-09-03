# Visualization Adapters with Theme Injection

This module provides vendor-agnostic visualization adapters that transform our core node system to work with different visualization libraries while maintaining complete theme flexibility through injection patterns.

## 🎯 Key Benefits

### ✅ **No Color Duplication**

- Themes are injected from UI packages
- No hardcoded colors in adapter code
- Single source of truth for theming

### ✅ **Easy Library Switching**

- Consistent API across adapters
- Switch from React Flow to Cytoscape without code changes
- Vendor-agnostic data transformations

### ✅ **Theme Flexibility**

- Support any design system (Mantine, Chakra UI, etc.)
- Light/dark mode switching
- Custom branding and themes

### ✅ **Clean Architecture**

- Adapters co-located with nodes (their primary concern)
- UI packages focus on theme configuration
- Clear separation of concerns

## 🏗️ Architecture

```
packages/nodes/src/adapters/
├── base/
│   ├── IVisualizationAdapter.ts    # Generic interface with theme injection
│   └── BaseAdapter.ts              # Base implementation with theme support
├── react-flow/
│   ├── ReactFlowAdapter.ts         # React Flow implementation
│   └── ReactFlowNodeFactory.tsx    # Themed React components
├── cytoscape/
│   └── CytoscapeAdapter.ts         # Alternative implementation
├── examples/
│   └── ui-integration-example.tsx  # Usage demonstrations
├── AdapterFactory.ts               # Centralized adapter creation
└── index.ts                        # Public API
```

## 🚀 Usage

### Basic Usage

```typescript
import { createReactFlowAdapter, AdapterTheme } from "@atomiton/nodes/adapters";

// 1. Define theme injection (from your UI package)
const adapterTheme: AdapterTheme = {
  getCategoryColor: (category) => myUITheme.colors.categories[category],
  getPortColor: (dataType) => myUITheme.colors.dataTypes[dataType],
  getStatusColor: (status) => myUITheme.colors.status[status],
  getConnectionColor: (status) => myUITheme.colors.connections[status],
  colors: {
    background: myUITheme.colors.background,
    foreground: myUITheme.colors.foreground,
    primary: myUITheme.colors.primary,
    // ... other base colors
  },
  typography: myUITheme.typography,
  spacing: myUITheme.spacing,
  radius: myUITheme.radius,
  shadows: myUITheme.shadows,
};

// 2. Create adapter with injected theme
const adapter = createReactFlowAdapter(adapterTheme, {
  behavior: {
    snapToGrid: true,
    enableAnimations: true,
  },
  layout: {
    nodeSpacing: 120,
    defaultZoom: 1.0,
  },
});

// 3. Use adapter to transform nodes
const visualNodes = coreNodes.map((node) => adapter.nodeToVisual(node));
const visualEdges = connections.map((conn) => adapter.connectionToVisual(conn));
```

### Dynamic Theme Updates

```typescript
// Theme changes automatically propagate
const [isDark, setIsDark] = useState(true);
const theme = isDark ? darkTheme : lightTheme;

useEffect(() => {
  adapter.updateTheme(theme);
}, [adapter, theme]);
```

### Multiple Adapters with Same Theme

```typescript
// Create multiple adapters with consistent theming
const reactFlowAdapter = createReactFlowAdapter(theme);
const cytoscapeAdapter = createCytoscapeAdapter(theme);

// Both adapters use the same color scheme!
```

## 🎨 Theme Injection Interface

The `AdapterTheme` interface allows UI packages to inject their theme without any color duplication:

```typescript
interface AdapterTheme {
  // Dynamic color functions
  getCategoryColor: (category: NodeCategory) => string;
  getPortColor: (dataType: DataType) => string;
  getStatusColor: (status: NodeStatus) => string;
  getConnectionColor: (status: ConnectionStatus) => string;

  // Base theme
  colors: {
    background: string;
    foreground: string;
    primary: string;
    // ... other base colors
  };

  // Design system integration
  typography: { fontSize: {}; fontWeight: {}; lineHeight: {} };
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string };
  radius: { none: string; sm: string; md: string; lg: string; full: string };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    glow: (color: string) => string;
  };
}
```

## 🔧 Available Adapters

### React Flow Adapter

- **Best for**: Interactive node editors, React applications
- **Features**: Custom React components, animations, rich interactions
- **Use case**: Primary Blueprint editor interface

```typescript
import {
  createReactFlowAdapter,
  AtomitonNodeTypes,
} from "@atomiton/nodes/adapters";

const adapter = createReactFlowAdapter(theme);
const nodeTypes = AtomitonNodeTypes; // Themed node components
```

### Cytoscape Adapter

- **Best for**: Graph analysis, complex layouts, large datasets
- **Features**: Advanced layout algorithms, network analysis, performance
- **Use case**: Blueprint overview, dependency analysis

```typescript
import { createCytoscapeAdapter } from "@atomiton/nodes/adapters";

const adapter = createCytoscapeAdapter(theme, {
  cytoscape: {
    layout: { name: "dagre", animate: true },
  },
});
```

## 🔄 Migration from Old System

### Before (Core Package)

```typescript
// ❌ Hardcoded colors, UI package dependency
import { ReactFlowAdapter } from "@atomiton/core";

const adapter = new ReactFlowAdapter({
  theme: {
    primaryColor: "#06b6d4", // Hardcoded!
    backgroundColor: "#0f172a", // Hardcoded!
  },
});
```

### After (Nodes Package)

```typescript
// ✅ Theme injection, no hardcoded colors
import { createReactFlowAdapter } from "@atomiton/nodes/adapters";

const adapter = createReactFlowAdapter(uiTheme); // Theme from UI package!
```

## 🎯 Integration Examples

### With Mantine UI

```typescript
import { useMantineTheme } from "@mantine/core";

const mantineTheme = useMantineTheme();
const adapterTheme: AdapterTheme = {
  getCategoryColor: (cat) => mantineTheme.colors.blue[6],
  getPortColor: (type) => mantineTheme.colors.grape[6],
  colors: {
    background: mantineTheme.colors.dark[7],
    foreground: mantineTheme.white,
    primary: mantineTheme.primaryColor,
  },
  // ... map other properties
};
```

### With Chakra UI

```typescript
import { useTheme } from "@chakra-ui/react";

const chakraTheme = useTheme();
const adapterTheme: AdapterTheme = {
  getCategoryColor: (cat) => chakraTheme.colors.blue[500],
  colors: {
    background: chakraTheme.colors.gray[900],
    foreground: chakraTheme.colors.white,
  },
  spacing: chakraTheme.space,
  // ... map other properties
};
```

## 🧪 Testing

The adapter system includes comprehensive testing support:

```typescript
import { validateTheme, exampleTheme } from "@atomiton/nodes/adapters";

// Validate theme structure
const validation = validateTheme(myTheme);
if (!validation.valid) {
  console.error("Theme validation errors:", validation.errors);
}

// Use example theme for testing
const testAdapter = createReactFlowAdapter(exampleTheme);
```

## 🚀 Extending the System

### Custom Adapters

```typescript
import { BaseVisualizationAdapter } from "@atomiton/nodes/adapters";

class CustomAdapter extends BaseVisualizationAdapter<MyNode, MyEdge> {
  // Implement required methods with theme support
  nodeToVisual(node: VisualNodeInstance): MyNode {
    const categoryColor = this.theme.getCategoryColor(node.definition.category);
    // ... use injected theme
  }
}
```

### Register New Adapters

```typescript
import { adapterRegistry } from "@atomiton/nodes/adapters";

adapterRegistry.register("custom", {
  name: "custom",
  displayName: "Custom Visualization",
  factory: createCustomAdapter,
  capabilities: {
    supportsAnimations: true,
    supportsCustomNodes: true,
    // ... other capabilities
  },
});
```

## 📊 Adapter Recommendations

Use the built-in recommendation system:

```typescript
import { recommendAdapter } from "@atomiton/nodes/adapters";

const recommendations = recommendAdapter({
  nodeCount: 500,
  needsCustomComponents: true,
  needsReactIntegration: true,
  performance: "high",
});

console.log(recommendations[0]); // Best adapter for requirements
```

## 🎉 Benefits Summary

1. **No Color Duplication**: Theme injection eliminates hardcoded colors
2. **UI Package Authority**: UI packages control theming completely
3. **Easy Switching**: Change visualization libraries without code changes
4. **Design System Integration**: Works with any UI framework
5. **Performance**: Optimized rendering and updates
6. **Accessibility**: Built-in accessibility support
7. **Extensibility**: Easy to add new adapters and features

The adapter system provides a clean, scalable foundation for visualization that grows with your application's needs while maintaining design consistency.
