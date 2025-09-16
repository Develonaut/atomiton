# Redux DevTools Integration with Zustand

## Overview

Our Zustand stores are configured to work with Redux DevTools for state debugging. However, there are platform-specific considerations.

## ✅ Working in Chrome Browser

Redux DevTools integration works perfectly when accessing the app directly in Chrome:

1. Open http://localhost:5173 in Chrome
2. Open Redux DevTools Extension
3. You'll see all Zustand stores listed with "atomiton-" prefix (e.g., "atomiton-blueprint-store", "atomiton-navigation", etc.)
4. State changes are tracked in real-time

## ⚠️ Electron Limitations

Redux DevTools has known compatibility issues with Electron due to Manifest V3 service worker registration problems. You'll see errors like:

- "Service worker registration failed. Status code: 2"
- "Cannot read properties of undefined (reading 'filter')"

### Workaround for Electron Development

During development, use Chrome browser for state debugging:

1. Run the Electron app normally: `pnpm dev`
2. Open Chrome and navigate to http://localhost:5173
3. Use Redux DevTools in Chrome to debug state changes
4. The state is shared between both instances

## Implementation Details

### Store Configuration

All stores are configured with Redux DevTools support using the simplified API:

```typescript
// From packages/@atomiton/store/src/index.ts
export function createStore<T extends object>(
  initializer: StateCreator<T>,
  config: StoreConfig<T> = {},
): Store<T> {
  const { name = "Store", persist: persistConfig } = config;

  // Auto-format name: prefix with "atomiton-" and convert to kebab-case
  const formattedName = `atomiton-${kebabCase(name)}`;

  // Non-persisted store
  if (!persistConfig) {
    const store = create<T>()(
      devtools(
        immer(() => initializer()),
        {
          name: formattedName,
          enabled: process.env.NODE_ENV === "development",
        },
      ),
    );
    return store as Store<T>;
  }

  // Persisted store with devtools
  const persistedStore = persist(
    immer(() => initializer()),
    persistOptions,
  );
  const store = create<T>()(
    devtools(persistedStore, {
      name: `${formattedName}:${key}`,
      enabled: process.env.NODE_ENV === "development",
    }),
  );
  return store as Store<T>;
}
```

### Key Features

1. **Automatic DevTools Integration** - Enabled in development mode only
2. **Consistent Naming** - All stores automatically prefixed with "atomiton-" and converted to kebab-case
3. **Proper Middleware Order** - immer → persist → devtools
4. **Named Stores** - Each store has a descriptive name in DevTools (e.g., "atomiton-blueprint-store")
5. **Map Support** - enableMapSet() called on module load for Map/Set serialization

## Testing Store Visibility

A test store is created in `apps/client/src/test-store.ts` that:

- Creates a simple store with count and message
- Performs automatic actions to test DevTools tracking
- Logs debug information to console

## Future Improvements

Potential solutions for Electron integration:

1. Use standalone Redux DevTools app instead of browser extension
2. Implement custom DevTools panel for Electron
3. Wait for Electron to better support Manifest V3 extensions
