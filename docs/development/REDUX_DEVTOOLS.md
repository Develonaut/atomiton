# Redux DevTools Integration with Zustand

## Overview

Our Zustand stores are configured to work with Redux DevTools for state debugging. However, there are platform-specific considerations.

## ✅ Working in Chrome Browser

Redux DevTools integration works perfectly when accessing the app directly in Chrome:

1. Open http://localhost:5173 in Chrome
2. Open Redux DevTools Extension
3. You'll see all Zustand stores listed (TestStore, NodeStore, NodeMetadata, etc.)
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

All stores are configured with Redux DevTools support:

```typescript
// From packages/@atomiton/store/src/base.ts
export function createStore<T extends object>(
  config: StoreConfig<T>,
): Store<T> {
  return create<T>()(
    devtools(
      immer((set) => config.initialState),
      {
        name: storeName,
        enabled: true,
      },
    ),
  ) as Store<T>;
}
```

### Key Changes Made

1. **Replaced Map objects with plain objects** - Maps aren't serializable by default in Redux DevTools
2. **Proper middleware order** - immer → persist → devtools
3. **Always enable devtools** - Let the middleware handle the connection

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
