/**
 * UI Integration Example - How to Use Themed Adapters
 *
 * This file demonstrates how UI packages should integrate with the
 * themed adapter system to avoid color duplication and maintain
 * consistent theming across the application.
 *
 * This is an example - the actual implementation would be in the UI package.
 */

import React, { useMemo } from "react";

import type { AdapterTheme } from "../index";
import { createReactFlowAdapter } from "../index";

// Example: How a UI package would define its theme
interface UITheme {
  colors: {
    // Node category colors
    categories: {
      input: string;
      processor: string;
      output: string;
      control: string;
      utility: string;
      custom: string;
    };

    // Data type colors
    dataTypes: {
      string: string;
      number: string;
      boolean: string;
      object: string;
      array: string;
      file: string;
      image: string;
      any: string;
    };

    // Status colors
    status: {
      idle: string;
      executing: string;
      completed: string;
      error: string;
      warning: string;
    };

    // Connection status colors
    connections: {
      valid: string;
      invalid: string;
      warning: string;
      selected: string;
    };

    // Base theme colors
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
    gridColor: string;
  };

  typography: {
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };

  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    glow: (color: string) => string;
  };
}

// Example UI theme (this would come from Mantine, Chakra UI, etc.)
const exampleUITheme: UITheme = {
  colors: {
    categories: {
      input: "#8b5cf6", // Purple
      processor: "#10b981", // Green
      output: "#f59e0b", // Amber
      control: "#ef4444", // Red
      utility: "#6b7280", // Gray
      custom: "#06b6d4", // Cyan
    },
    dataTypes: {
      string: "#8b5cf6", // Purple
      number: "#f59e0b", // Amber
      boolean: "#10b981", // Green
      object: "#06b6d4", // Cyan
      array: "#ec4899", // Pink
      file: "#6366f1", // Indigo
      image: "#84cc16", // Lime
      any: "#6b7280", // Gray
    },
    status: {
      idle: "#6b7280", // Gray
      executing: "#fbbf24", // Yellow
      completed: "#10b981", // Green
      error: "#ef4444", // Red
      warning: "#f59e0b", // Amber
    },
    connections: {
      valid: "#6b7280", // Gray
      invalid: "#ef4444", // Red
      warning: "#f59e0b", // Amber
      selected: "#06b6d4", // Cyan
    },
    background: "#0f172a", // Dark blue
    foreground: "#f8fafc", // Light gray
    primary: "#06b6d4", // Cyan
    secondary: "#8b5cf6", // Purple
    accent: "#f59e0b", // Amber
    muted: "#64748b", // Slate
    border: "#334155", // Dark slate
    gridColor: "#1e293b", // Very dark slate
  },
  typography: {
    fontSize: {
      xs: "10px",
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "18px",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  radius: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "50%",
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    glow: (color: string) => `0 0 20px ${color}40`,
  },
};

/**
 * Convert UI theme to adapter theme - this is the key integration point
 */
function createAdapterTheme(uiTheme: UITheme): AdapterTheme {
  return {
    // Theme injection functions - no hardcoded colors!
    getCategoryColor: (category) => uiTheme.colors.categories[category],
    getPortColor: (dataType) => uiTheme.colors.dataTypes[dataType],
    getStatusColor: (status) => uiTheme.colors.status[status],
    getConnectionColor: (status) => uiTheme.colors.connections[status],

    // Direct theme mapping
    colors: {
      background: uiTheme.colors.background,
      foreground: uiTheme.colors.foreground,
      primary: uiTheme.colors.primary,
      secondary: uiTheme.colors.secondary,
      accent: uiTheme.colors.accent,
      muted: uiTheme.colors.muted,
      border: uiTheme.colors.border,
      gridColor: uiTheme.colors.gridColor,
    },

    typography: {
      fontSize: uiTheme.typography.fontSize,
      fontWeight: uiTheme.typography.fontWeight,
      lineHeight: uiTheme.typography.lineHeight,
    },
    spacing: uiTheme.spacing,
    radius: uiTheme.radius,
    shadows: uiTheme.shadows,
  };
}

/**
 * Example React component showing proper adapter usage
 */
export const BlueprintEditor: React.FC = () => {
  // Convert UI theme to adapter theme
  const adapterTheme = useMemo(() => createAdapterTheme(exampleUITheme), []);

  // Create adapter with injected theme
  const adapter = useMemo(() => {
    return createReactFlowAdapter(adapterTheme, {
      behavior: {
        snapToGrid: true,
        enableAnimations: true,
        allowMultiSelection: true,
        gridSize: 20,
        enableSounds: false,
        autoSave: true,
        autoSaveInterval: 30000,
      },
      layout: {
        nodeSpacing: 120,
        defaultZoom: 1.0,
        minimumZoom: 0.5,
        maximumZoom: 2.0,
        fitViewPadding: 50,
        connectionCurvature: 0.25,
      },
    });
  }, [adapterTheme]);

  // When theme changes (e.g., light/dark mode toggle), update adapter
  React.useEffect(() => {
    adapter.updateTheme(adapterTheme);
  }, [adapter, adapterTheme]);

  return (
    <div style={{ width: "100%", height: "500px", position: "relative" }}>
      <h3>Blueprint Editor with Theme Injection</h3>
      <p>
        This example shows how UI packages inject their theme into adapters,
        eliminating color duplication and ensuring consistent theming.
      </p>

      {/* React Flow would be rendered here with the themed adapter */}
      <div
        style={{
          background: adapterTheme.colors.background,
          color: adapterTheme.colors.foreground,
          border: `1px solid ${adapterTheme.colors.border}`,
          borderRadius: adapterTheme.radius.md,
          padding: adapterTheme.spacing.lg,
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: adapterTheme.colors.primary,
              fontSize: adapterTheme.typography.fontSize.lg,
            }}
          >
            React Flow Canvas Area
          </div>
          <div
            style={{
              color: adapterTheme.colors.muted,
              fontSize: adapterTheme.typography.fontSize.sm,
              marginTop: "8px",
            }}
          >
            Theme colors injected from UI package:
          </div>
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <ColorSwatch
              color={adapterTheme.getCategoryColor("input")}
              label="Input"
            />
            <ColorSwatch
              color={adapterTheme.getCategoryColor("processor")}
              label="Processor"
            />
            <ColorSwatch
              color={adapterTheme.getCategoryColor("output")}
              label="Output"
            />
            <ColorSwatch
              color={adapterTheme.getPortColor("string")}
              label="String"
            />
            <ColorSwatch
              color={adapterTheme.getPortColor("number")}
              label="Number"
            />
            <ColorSwatch
              color={adapterTheme.getStatusColor("executing")}
              label="Executing"
            />
          </div>
        </div>
      </div>

      {/* Adapter info */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: adapterTheme.colors.background,
          border: `1px solid ${adapterTheme.colors.border}`,
          borderRadius: adapterTheme.radius.sm,
          fontSize: adapterTheme.typography.fontSize.sm,
          color: adapterTheme.colors.muted,
        }}
      >
        <strong>Adapter Benefits:</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>No hardcoded colors in adapter code</li>
          <li>Theme changes automatically propagate to visualizations</li>
          <li>Easy to switch between light/dark modes</li>
          <li>Consistent with UI package design system</li>
          <li>Supports custom branding and themes</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Color swatch component for demonstration
 */
const ColorSwatch: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        width: "24px",
        height: "24px",
        backgroundColor: color,
        borderRadius: "4px",
        margin: "0 auto 4px",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    />
    <div style={{ fontSize: "10px", color: "#888" }}>{label}</div>
  </div>
);

/**
 * Example: Dynamic theme switching
 */
export const ThemeExample: React.FC = () => {
  const [isDark, setIsDark] = React.useState(true);

  // Create different themes
  const darkTheme = createAdapterTheme(exampleUITheme);
  const lightTheme = createAdapterTheme({
    ...exampleUITheme,
    colors: {
      ...exampleUITheme.colors,
      background: "#ffffff",
      foreground: "#1f2937",
      gridColor: "#f3f4f6",
      border: "#d1d5db",
      muted: "#6b7280",
    },
  });

  const currentTheme = isDark ? darkTheme : lightTheme;

  // Create adapter with current theme
  // TODO: Use adapter for node rendering
  // const adapter = useMemo(() => {
  //   return createReactFlowAdapter(currentTheme);
  // }, [currentTheme]);

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setIsDark(!isDark)}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: currentTheme.colors.primary,
          color: currentTheme.colors.background,
          cursor: "pointer",
        }}
      >
        Switch to {isDark ? "Light" : "Dark"} Theme
      </button>

      <div
        style={{
          marginTop: "16px",
          padding: "20px",
          backgroundColor: currentTheme.colors.background,
          color: currentTheme.colors.foreground,
          border: `1px solid ${currentTheme.colors.border}`,
          borderRadius: "8px",
          transition: "all 0.3s ease",
        }}
      >
        <h4>Theme Preview</h4>
        <p>The adapter automatically updates when the theme changes!</p>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <ColorSwatch
            color={currentTheme.getCategoryColor("input")}
            label="Input"
          />
          <ColorSwatch
            color={currentTheme.getCategoryColor("processor")}
            label="Processor"
          />
          <ColorSwatch
            color={currentTheme.getStatusColor("executing")}
            label="Executing"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Using multiple adapters with same theme
 */
export const MultiAdapterExample: React.FC = () => {
  const adapterTheme = useMemo(() => createAdapterTheme(exampleUITheme), []);

  // Create multiple adapters with same theme
  // TODO: Use adapters for rendering
  // const reactFlowAdapter = useMemo(() => createReactFlowAdapter(adapterTheme), [adapterTheme]);
  // const cytoscapeAdapter = useMemo(() => createCytoscapeAdapter(adapterTheme), [adapterTheme]);

  return (
    <div style={{ padding: "20px" }}>
      <h4>Multiple Adapters with Consistent Theme</h4>
      <p>
        Both React Flow and Cytoscape adapters use the same theme configuration:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "16px",
        }}
      >
        <div
          style={{
            padding: "16px",
            backgroundColor: adapterTheme.colors.background,
            border: `1px solid ${adapterTheme.colors.border}`,
            borderRadius: adapterTheme.radius.md,
          }}
        >
          <h5 style={{ color: adapterTheme.colors.foreground, marginTop: 0 }}>
            React Flow Adapter
          </h5>
          <p style={{ color: adapterTheme.colors.muted, fontSize: "14px" }}>
            Interactive node editor with React components
          </p>
        </div>

        <div
          style={{
            padding: "16px",
            backgroundColor: adapterTheme.colors.background,
            border: `1px solid ${adapterTheme.colors.border}`,
            borderRadius: adapterTheme.radius.md,
          }}
        >
          <h5 style={{ color: adapterTheme.colors.foreground, marginTop: 0 }}>
            Cytoscape Adapter
          </h5>
          <p style={{ color: adapterTheme.colors.muted, fontSize: "14px" }}>
            Graph visualization with advanced layouts
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: adapterTheme.colors.background,
          border: `1px solid ${adapterTheme.colors.border}`,
          borderRadius: adapterTheme.radius.sm,
          fontSize: "14px",
          color: adapterTheme.colors.muted,
        }}
      >
        <strong>Key Benefits:</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>Single theme definition works for all adapters</li>
          <li>Easy to switch visualization libraries</li>
          <li>Consistent user experience across different views</li>
          <li>Theme changes apply to all adapters simultaneously</li>
        </ul>
      </div>
    </div>
  );
};

export default { BlueprintEditor, ThemeExample, MultiAdapterExample };
