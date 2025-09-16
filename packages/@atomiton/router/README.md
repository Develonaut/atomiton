# @atomiton/router

Domain-agnostic router package with auto-generated navigation methods and TanStack Router integration.

## Features

- **Auto-generated Navigation Methods**: Routes automatically generate typed navigation methods like `toEditor()`, `toHome()`
- **Type Safety**: Full TypeScript support with auto-completion
- **TanStack Router**: Built on top of TanStack Router for robust routing
- **Zustand Integration**: Global navigation state accessible anywhere
- **Domain Agnostic**: No knowledge of business logic or app-specific concepts
- **Lazy Loading**: Built-in support for code splitting
- **Error Boundaries**: Automatic error handling
- **Loading States**: Configurable loading components

## Installation

```bash
pnpm add @atomiton/router
```

## Usage

### Basic Setup

```typescript
import { createRouter } from "@atomiton/router";

const { router, navigate, useNavigate, Link } = createRouter({
  routes: [
    {
      name: "home",
      path: "/",
      component: () => import("./pages/HomePage"),
    },
    {
      name: "editor",
      path: "/editor/$blueprintId?",
      component: () => import("./pages/EditorPage"),
    },
    {
      name: "profile",
      path: "/profile/$userId",
      component: () => import("./pages/ProfilePage"),
    },
  ],
});

// Use auto-generated navigation methods
navigate.toHome(); // Navigate to /
navigate.toEditor({ blueprintId: "123" }); // Navigate to /editor/123
navigate.toProfile({ userId: "456" }); // Navigate to /profile/456

// Or use generic navigation
navigate.to("/custom/path");
navigate.back();
navigate.forward();
navigate.replace("/new/path");
```

### In React Components

```tsx
import { useNavigate, Link } from "./router";

function MyComponent() {
  const navigate = useNavigate();

  return (
    <div>
      <Link to="/">Home</Link>
      <button onClick={() => navigate.toEditor({ blueprintId: "123" })}>
        Open Editor
      </button>
    </div>
  );
}
```

### Custom Navigators

You can provide custom navigation logic for specific routes:

```typescript
const { navigate } = createRouter({
  routes: [
    {
      name: "editor",
      path: "/editor/$blueprintId?",
      component: () => import("./pages/EditorPage"),
      navigator: (blueprintId?: string) => {
        // Custom logic here
        if (!blueprintId) {
          return "/editor/new";
        }
        return `/editor/${blueprintId}`;
      },
    },
  ],
});
```

### Route Parameters

The router supports both required and optional parameters:

- Required: `$paramName` (e.g., `/user/$id`)
- Optional: `$paramName?` (e.g., `/search/$query?`)

```typescript
// Required parameter
{
  name: "user",
  path: "/user/$id",
  component: () => import("./pages/UserPage"),
}

// Optional parameter
{
  name: "search",
  path: "/search/$query?",
  component: () => import("./pages/SearchPage"),
}

// Mixed parameters
{
  name: "post",
  path: "/blog/$category/$postId?",
  component: () => import("./pages/PostPage"),
}
```

### Configuration Options

```typescript
createRouter({
  routes: [...],
  basePath: "/app", // Base path for all routes
  defaultPendingComponent: LoadingSpinner, // Default loading component
  defaultErrorComponent: ErrorBoundary, // Default error component
  enableDevtools: true, // Enable Redux DevTools for navigation store
});
```

### Navigation Store

The router uses Zustand for state management, making navigation state accessible anywhere:

```typescript
import { createNavigationStore } from "@atomiton/router";

const store = createNavigationStore();
const state = store();

console.log(state.currentPath); // Current route path
console.log(state.history); // Navigation history
console.log(state.params); // Current route params
```

## API Reference

### `createRouter(options)`

Creates a router instance with auto-generated navigation methods.

#### Options

- `routes`: Array of route configurations
- `basePath?`: Base path for all routes (default: "/")
- `defaultPendingComponent?`: Default loading component
- `defaultErrorComponent?`: Default error component
- `enableDevtools?`: Enable Redux DevTools (default: true)

#### Returns

- `router`: TanStack Router instance
- `navigate`: Object with auto-generated navigation methods
- `useRouter`: Hook to access router instance
- `useNavigate`: Hook to access navigation methods
- `useCurrentRoute`: Hook to get current route
- `useParams`: Hook to get route parameters
- `Link`: Link component

### Route Configuration

Each route accepts:

- `name`: Unique route identifier (used for method generation)
- `path`: Route path with optional parameters
- `component`: Component loader function
- `navigator?`: Custom navigation function
- `errorComponent?`: Route-specific error component
- `pendingComponent?`: Route-specific loading component
- `meta?`: Additional route metadata

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Run benchmarks
pnpm test:benchmark

# Type checking
pnpm typecheck

# Linting
pnpm lint
```
