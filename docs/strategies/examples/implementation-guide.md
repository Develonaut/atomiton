# Implementation Guide with Code Examples

## Phase 1: Initial Setup

### 1. Update apps/client Vite Config

```typescript
// apps/client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite"; // ADD THIS
import { resolve } from "path"; // ADD THIS

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(), // ADD THIS
  ],

  // ADD THIS SECTION
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@atomiton/ui": resolve(__dirname, "../../packages/ui/src"),
      "@atomiton/theme": resolve(__dirname, "../../packages/theme/src"),
    },
  },

  server: {
    port: 3001,
    host: true,
    // ADD THIS
    fs: {
      allow: ["../..", "../../packages"],
    },
  },

  // ADD THIS SECTION
  optimizeDeps: {
    include: ["@atomiton/ui", "@atomiton/theme"],
    exclude: ["@atomiton/ui", "@atomiton/theme"], // For development
  },

  // ... rest of existing config
});
```

### 2. Update apps/client package.json

```bash
# Run in apps/client directory
pnpm add @atomiton/ui@workspace:* @atomiton/theme@workspace:*
pnpm add -D @tailwindcss/vite
```

### 3. Create Compatibility Layer

```typescript
// apps/client/src/lib/ui-compat.ts
// Re-export utilities from UI package
export { cn } from "@atomiton/ui/utils";
export { styled } from "@atomiton/ui/system";
export type { SystemProps } from "@atomiton/ui/system";

// Create adapter for theme tokens
import { tokens } from "@atomiton/theme";

export const theme = {
  colors: {
    // Map your CSS variables to theme tokens
    surface01: tokens.colors.neutral[50],
    surface02: tokens.colors.neutral[100],
    primary: tokens.colors.primary[500],
    // ... add more mappings
  },
};
```

## Phase 2: Component Migration Examples

### Example 1: Migrating Button Component

#### Before (apps/client component)

```tsx
// apps/client/src/components/Button/index.tsx
import React from "react";
import clsx from "clsx";
import Link from "@/router/Link";

interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  onClick,
}: ButtonProps) {
  const className = clsx("inline-flex items-center justify-center rounded-md", {
    "bg-shade-09 text-white": variant === "primary",
    "bg-shade-03 text-shade-09": variant === "secondary",
    "px-3 py-1 text-sm": size === "sm",
    "px-4 py-2": size === "md",
    "px-6 py-3 text-lg": size === "lg",
  });

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
```

#### After (Using @atomiton/ui with adapter)

```tsx
// apps/client/src/components/ButtonAdapter.tsx
import React from "react";
import { Button as UIButton } from "@atomiton/ui/primitives/button";
import Link from "@/router/Link";

interface ButtonAdapterProps extends React.ComponentProps<typeof UIButton> {
  href?: string;
}

export function Button({ href, ...props }: ButtonAdapterProps) {
  // Handle routing compatibility
  if (href) {
    return (
      <Link href={href}>
        <UIButton asChild {...props} />
      </Link>
    );
  }

  return <UIButton {...props} />;
}

// Re-export for backward compatibility
export default Button;
```

#### Update imports across the app

```tsx
// apps/client/src/pages/SomePage.tsx

// OLD
import Button from "@/components/Button";

// NEW (during migration)
import Button from "@/components/ButtonAdapter";

// FINAL (after migration complete)
import { Button } from "@atomiton/ui";
```

### Example 2: Migrating Field Component

#### Create migration wrapper

```tsx
// apps/client/src/components/FieldMigration.tsx
import { Field as UIField } from "@atomiton/ui/components/Field";
import type { ComponentProps } from "react";

// Map old props to new UI package props
interface FieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  // ... old props
}

export function Field({
  label,
  error,
  helperText,
  ...props
}: FieldProps & ComponentProps<typeof UIField>) {
  return (
    <UIField
      label={label}
      error={error}
      description={helperText} // Map old prop names
      {...props}
    />
  );
}
```

### Example 3: Migrating Complex Component (Comments)

```tsx
// apps/client/src/components/Comments/CommentsMigration.tsx
import { useState } from "react";
import {
  Comment as UIComment,
  NewComment as UINewComment,
  CommentPin,
  QuickComment,
} from "@atomiton/ui/components";

// Keep app-specific features
import { AddUser } from "./NewComment/AddUser";
import { AddFiles } from "./NewComment/AddFiles";
import { useCommentsStore } from "@/stores/comments";

export function Comments() {
  const { comments, addComment } = useCommentsStore();
  const [showNewComment, setShowNewComment] = useState(false);

  return (
    <div className="space-y-4">
      {/* Use UI components for display */}
      {comments.map((comment) => (
        <UIComment key={comment.id} {...comment} />
      ))}

      {/* Hybrid approach: UI component + app features */}
      {showNewComment && (
        <div className="flex gap-2">
          <UINewComment onSubmit={addComment} placeholder="Add a comment..." />
          {/* Keep app-specific features */}
          <AddUser />
          <AddFiles />
        </div>
      )}

      {/* Use new UI features not in old system */}
      <QuickComment onSubmit={addComment} />
    </div>
  );
}
```

## Phase 3: Styling Migration

### Migrate from CSS Variables to Theme

#### Before (CSS Variables)

```css
/* apps/client/src/index.css */
.button-primary {
  background-color: var(--shade-09);
  color: var(--shade-01);
}
```

#### After (Theme Tokens)

```tsx
// apps/client/src/components/StyledButton.tsx
import { styled } from "@atomiton/ui/system";
import { theme } from "@atomiton/theme";

const StyledButton = styled("button", {
  base: {
    backgroundColor: theme.colors.neutral[900],
    color: theme.colors.neutral[50],
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: theme.colors.primary[500],
      },
      secondary: {
        backgroundColor: theme.colors.neutral[300],
      },
    },
  },
});
```

### Create CSS Variable Bridge

```css
/* apps/client/src/styles/theme-bridge.css */
@import "@atomiton/ui/styles";

/* Map old variables to new theme */
:root {
  /* Map to theme tokens */
  --shade-01: theme(colors.neutral.50);
  --shade-09: theme(colors.neutral.900);

  /* Keep app-specific variables */
  --app-sidebar-width: 260px;
  --app-header-height: 64px;
}
```

## Phase 4: Testing Migration

### Unit Test Example

```tsx
// apps/client/src/components/__tests__/ButtonMigration.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ButtonAdapter";
import { Button as UIButton } from "@atomiton/ui";

describe("Button Migration", () => {
  it("maintains backward compatibility", () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("works with UI package button", () => {
    render(<UIButton variant="primary">UI Button</UIButton>);
    expect(screen.getByRole("button")).toHaveTextContent("UI Button");
  });

  it("handles routing correctly", () => {
    render(<Button href="/test">Link Button</Button>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/test");
  });
});
```

### Visual Regression Test

```tsx
// apps/client/tests/visual/components.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Component Migration Visual Tests", () => {
  test("Button appearance matches", async ({ page }) => {
    await page.goto("/components/button");

    // Test old button
    const oldButton = page.locator("[data-testid='old-button']");
    await expect(oldButton).toHaveScreenshot("button-old.png");

    // Test new button
    const newButton = page.locator("[data-testid='new-button']");
    await expect(newButton).toHaveScreenshot("button-new.png");
  });
});
```

## Phase 5: Cleanup

### Remove Old Components

```bash
#!/bin/bash
# scripts/remove-migrated-components.sh

# List of migrated components
MIGRATED_COMPONENTS=(
  "Button"
  "Field"
  "Image"
  "Search"
  "Select"
)

# Remove component directories
for component in "${MIGRATED_COMPONENTS[@]}"; do
  echo "Removing $component..."
  rm -rf "apps/client/src/components/$component"
done

# Update barrel exports
echo "Updating exports..."
node scripts/update-exports.js
```

### Update Imports Script

```javascript
// scripts/update-imports.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const IMPORT_MAPPINGS = {
  "@/components/Button": "@atomiton/ui",
  "@/components/Field": "@atomiton/ui",
  "@/components/Image": "@atomiton/ui",
  // ... add more mappings
};

// Find all TypeScript files
const files = glob.sync("apps/client/src/**/*.{ts,tsx}");

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // Replace imports
  Object.entries(IMPORT_MAPPINGS).forEach(([oldImport, newImport]) => {
    const regex = new RegExp(
      `from ['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`,
      "g",
    );

    if (regex.test(content)) {
      content = content.replace(regex, `from "${newImport}"`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in ${file}`);
  }
});
```

## Common Issues and Solutions

### Issue 1: TypeScript Path Resolution

```json
// apps/client/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@atomiton/ui": ["../../packages/ui/src/index.ts"],
      "@atomiton/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

### Issue 2: Tailwind Classes Not Applied

```typescript
// apps/client/tailwind.config.ts
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    // Include UI package files
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  // Extend theme from UI package
  presets: [require("@atomiton/ui/tailwind.preset")],
};
```

### Issue 3: Hot Reload Not Working

```typescript
// apps/client/vite.config.ts
export default defineConfig({
  server: {
    watch: {
      // Force watch UI package
      ignored: ["!**/packages/ui/src/**"],
    },
  },
  // Force full reload on UI changes
  optimizeDeps: {
    exclude: ["@atomiton/ui"],
  },
});
```

## Validation Checklist

Before marking a component as migrated:

- [ ] Component renders correctly
- [ ] All props work as expected
- [ ] Styles apply correctly
- [ ] TypeScript types are correct
- [ ] Tests pass
- [ ] No console errors
- [ ] Hot reload works
- [ ] Build succeeds
- [ ] Bundle size acceptable

---

This guide provides practical examples for implementing the migration strategy.
Follow each phase sequentially and test thoroughly at each step.
