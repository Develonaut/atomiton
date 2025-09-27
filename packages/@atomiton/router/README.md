# @atomiton/router

A clean, simplified wrapper around TanStack Router for React applications.

> **Note**: This package has been significantly simplified from its previous
> complex implementation. It now consists of just 174 lines across 4 focused
> files, providing a clean wrapper around TanStack Router without
> over-engineered abstractions.

## Features

- **Simplified Architecture**: Clean wrapper around TanStack Router with minimal
  abstraction
- **Type Safety**: Full TypeScript support with auto-completion
- **Component Lazy Loading**: Built-in support for code splitting with loading
  states
- **Modular Design**: 4 focused files with clear separation of concerns
- **Domain Agnostic**: No knowledge of business logic or app-specific concepts
- **TanStack Router**: Leverages the power and reliability of TanStack Router

## Installation

```bash
pnpm add @atomiton/router
```

## Usage

### Basic Setup

```typescript
import { createRouter } from "@atomiton/router";

const { router, navigate, useRouter, Link, RouterProvider } = createRouter({
  routes: [
    {
      name: "home",
      path: "/",
      component: () => import("./pages/HomePage"),
    },
    {
      name: "editor",
      path: "/editor/$flowId",
      component: () => import("./pages/EditorPage"),
    },
    {
      name: "profile",
      path: "/profile/$userId",
      component: () => import("./pages/ProfilePage"),
    },
  ],
});

// Use TanStack Router's navigation methods
navigate({ to: "/" }); // Navigate to home
navigate({ to: "/editor/$flowId", params: { flowId: "123" } }); // Navigate to editor
navigate({ to: "/profile/$userId", params: { userId: "456" } }); // Navigate to profile
```

### In React Components

```tsx
import { useNavigate, Link } from "@atomiton/router";

function MyComponent() {
  const navigate = useNavigate();

  return (
    <div>
      <Link to="/">Home</Link>
      <button
        onClick={() =>
          navigate({
            to: "/editor/$flowId",
            params: { flowId: "123" },
          })
        }
      >
        Open Editor
      </button>
    </div>
  );
}
```

### Application Setup

```tsx
import React from "react";
import { createRouter } from "@atomiton/router";

const { RouterProvider } = createRouter({
  routes: [
    {
      name: "home",
      path: "/",
      component: () => import("./pages/HomePage"),
    },
    {
      name: "editor",
      path: "/editor/$flowId",
      component: () => import("./pages/EditorPage"),
    },
  ],
});

function App() {
  return <RouterProvider />;
}

export default App;
```

### Route Parameters

The router uses TanStack Router's parameter system:

```typescript
// Required parameter
{
  name: "user",
  path: "/user/$id",
  component: () => import("./pages/UserPage"),
}

// Optional parameter (use search params or conditional paths)
{
  name: "search",
  path: "/search",
  component: () => import("./pages/SearchPage"),
}
```

### Configuration Options

```typescript
createRouter({
  routes: [...], // Required: Array of route configurations
  basePath: "/app", // Optional: Base path for all routes
  defaultPendingComponent: LoadingSpinner, // Optional: Default loading component for lazy routes
  defaultErrorComponent: ErrorBoundary, // Optional: Default error boundary component
});
```

## API Reference

### `createRouter(options)`

Creates a router instance with a clean API wrapper around TanStack Router.

#### Options

- `routes`: Array of route configurations
- `basePath?`: Base path for all routes (default: "/")
- `defaultPendingComponent?`: Default loading component for lazy routes
- `defaultErrorComponent?`: Default error boundary component

#### Returns

- `router`: TanStack Router instance
- `navigate`: TanStack Router's navigation function
- `useRouter`: Hook to access router instance
- `useNavigate`: Hook to access navigation function
- `useCurrentRoute`: Hook to get current route match
- `useParams`: Hook to get route parameters
- `usePathname`: Hook to get current pathname
- `useLocation`: Hook to get current location object
- `Link`: TanStack Router's Link component
- `RouterProvider`: Configured router provider component

### Route Configuration

Each route accepts:

- `name`: Unique route identifier
- `path`: Route path (follows TanStack Router path syntax)
- `component`: Component or lazy component loader function
- `errorComponent?`: Route-specific error component
- `pendingComponent?`: Route-specific loading component

### Architecture

The package consists of 4 core files:

- `types.ts` - TypeScript type definitions
- `routeFactory.ts` - Route creation and component handling
- `createRouter.tsx` - Main router factory function
- `index.ts` - Public API exports

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
