# Secure Token Storage Strategy

> **Note**: This document contains detailed implementation strategy. For the complete security architecture, see [Security Architecture](../architecture/SECURITY.md).

**Complexity Filter**: 25-line core implementation, ships in 2 days

## The Problem

Atomiton needs to store API keys and authentication tokens securely across:

- Desktop app (Electron)
- Web app (browser storage)
- Development environments

Without over-engineering a NASA-grade security system for a Blueprint automation platform.

## The Solution: Keep It Simple

### Desktop: Use the OS Keychain

**Why**: Every OS has a secure credential store. Don't reinvent the wheel.

```typescript
// Core implementation - 8 lines
import keytar from "keytar";

const SERVICE_NAME = "atomiton";

export const secureStorage = {
  store: (key: string, value: string) =>
    keytar.setPassword(SERVICE_NAME, key, value),
  retrieve: (key: string) => keytar.getPassword(SERVICE_NAME, key),
  remove: (key: string) => keytar.deletePassword(SERVICE_NAME, key),
};
```

### Web: Encrypted localStorage

**Why**: Web Crypto API + localStorage is sufficient for our threat model.

```typescript
// Core implementation - 17 lines
const STORAGE_KEY = "atomiton_secure";

class WebSecureStorage {
  private key = crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  async store(data: Record<string, string>) {
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) },
      await this.key,
      new TextEncoder().encode(JSON.stringify(data)),
    );
    localStorage.setItem(
      STORAGE_KEY,
      btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    );
  }

  async retrieve(): Promise<Record<string, string>> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const encrypted = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: encrypted.slice(0, 12) },
      await this.key,
      encrypted.slice(12),
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  }
}
```

## Architecture Decisions (Michael's Input)

### Threat Model: Be Realistic

**What we're protecting against**:

- Casual access to tokens in storage
- Basic malware scanning files
- Developer accidentally committing tokens

**What we're NOT protecting against**:

- Nation-state actors
- Memory dumps from running processes
- Physical access to unlocked machines

### Storage Strategy

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Desktop   │    │     Web      │    │    Dev      │
│             │    │              │    │             │
│  OS Keychain│    │ Encrypted    │    │  .env.local │
│  (keytar)   │    │ localStorage │    │  (ignored)  │
│             │    │              │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
```

### Token Types & Storage

| Token Type   | Desktop  | Web            | Lifetime  | Notes         |
| ------------ | -------- | -------------- | --------- | ------------- |
| API Keys     | Keychain | Encrypted      | Permanent | User-provided |
| Auth Tokens  | Keychain | Encrypted      | Session   | OAuth/JWT     |
| Session Data | Memory   | sessionStorage | Tab       | Non-sensitive |

### Implementation Phases

**Phase 1: Basic Storage (Day 1)**

- Desktop keychain integration
- Web encrypted localStorage
- Simple API: `store()`, `retrieve()`, `remove()`

**Phase 2: Token Management (Day 2)**

- Token expiration handling
- Automatic refresh logic
- Error recovery

**Phase 3: Future Enhancements**

- Hardware security keys (if needed)
- Multi-environment sync (if needed)
- Audit logging (if needed)

## Implementation Details

### Package Structure

```
packages/@atomiton/secure-storage/
├── src/
│   ├── index.ts                 # Public API
│   ├── desktop.ts               # Electron keychain
│   ├── web.ts                   # Browser encrypted storage
│   └── types.ts                 # TypeScript definitions
├── tests/
│   ├── desktop.test.ts
│   └── web.test.ts
└── package.json
```

### Public API Design

```typescript
// Simple, obvious interface
interface SecureStorage {
  store(key: string, value: string): Promise<void>;
  retrieve(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Platform detection
export const createSecureStorage = (): SecureStorage => {
  return isElectron() ? new DesktopStorage() : new WebStorage();
};
```

### Error Handling Strategy

**Fail gracefully, don't crash the app**:

```typescript
// Never throw, always return null or false
async retrieve(key: string): Promise<string | null> {
  try {
    return await this.actualRetrieve(key)
  } catch (error) {
    console.warn('Token retrieval failed:', error.message)
    return null
  }
}
```

### Migration Strategy

**If storage format changes**:

1. Try new format first
2. Fall back to old format
3. Migrate data lazily
4. Clean up old data after success

```typescript
// Migration wrapper
async retrieve(key: string): Promise<string | null> {
  // Try v2 format
  let value = await this.retrieveV2(key)
  if (value) return value

  // Fall back to v1, migrate if found
  value = await this.retrieveV1(key)
  if (value) {
    await this.storeV2(key, value)
    await this.removeV1(key)
  }

  return value
}
```

## Security Considerations

### Desktop Security

- **Keychain Access**: Only the signed Atomiton app can access its keychain entries
- **Process Isolation**: Tokens never written to disk in plaintext
- **User Control**: User can revoke access via OS keychain manager

### Web Security

- **Origin Isolation**: localStorage is origin-specific
- **XSS Protection**: Tokens encrypted even if XSS accesses localStorage
- **No Network**: Encryption keys never leave the browser

### Development Security

- **Environment Variables**: Use `.env.local` (gitignored)
- **No Hardcoding**: All tokens externalized
- **Team Sharing**: Use shared development tokens (non-production)

## Testing Strategy

### Unit Tests

```typescript
describe("SecureStorage", () => {
  it("stores and retrieves tokens", async () => {
    await storage.store("api-key", "secret-123");
    const retrieved = await storage.retrieve("api-key");
    expect(retrieved).toBe("secret-123");
  });

  it("handles missing keys gracefully", async () => {
    const result = await storage.retrieve("nonexistent");
    expect(result).toBeNull();
  });

  it("clears all tokens", async () => {
    await storage.store("key1", "value1");
    await storage.store("key2", "value2");
    await storage.clear();
    expect(await storage.retrieve("key1")).toBeNull();
    expect(await storage.retrieve("key2")).toBeNull();
  });
});
```

### Integration Tests

- Test actual keychain operations (desktop)
- Test encryption/decryption cycles (web)
- Test cross-session persistence
- Test error scenarios (permissions denied, storage full)

## Dependencies

### Production Dependencies

```json
{
  "keytar": "^7.9.0", // Desktop keychain access
  "@types/node": "^20.0.0" // Node.js types
}
```

### Development Dependencies

```json
{
  "@vitest/ui": "^1.0.0", // Testing framework
  "playwright": "^1.40.0" // E2E testing
}
```

**Why minimal dependencies**:

- Fewer attack vectors
- Easier maintenance
- Faster installs
- Less dependency hell

## Performance Considerations

### Benchmarks

| Operation | Desktop | Web    | Target     |
| --------- | ------- | ------ | ---------- |
| Store     | < 10ms  | < 5ms  | Invisible  |
| Retrieve  | < 5ms   | < 2ms  | Invisible  |
| Clear     | < 50ms  | < 10ms | Acceptable |

### Optimization Strategies

1. **Lazy Loading**: Don't decrypt until needed
2. **Memory Caching**: Cache decrypted values in memory
3. **Batch Operations**: Group multiple store/retrieve calls
4. **Async All The Way**: Never block the UI thread

## Monitoring & Debugging

### Logging Strategy

```typescript
// Structured logging - never log actual tokens
const logger = {
  tokenStored: (key: string) => console.log(`Token stored: ${key}`),
  tokenRetrieved: (key: string) => console.log(`Token retrieved: ${key}`),
  tokenError: (key: string, error: string) =>
    console.warn(`Token error ${key}: ${error}`),
};
```

### Metrics to Track

- Storage operation latencies
- Error rates by platform
- Token expiration events
- Migration completion rates

## Deployment Considerations

### Desktop App

- **Code Signing**: Required for keychain access
- **Permissions**: Request keychain access on first run
- **Fallback**: Gracefully handle denied permissions

### Web App

- **HTTPS Only**: Secure contexts required for Web Crypto API
- **CSP Headers**: Content Security Policy for XSS protection
- **Feature Detection**: Check Web Crypto API support

## Common Pitfalls to Avoid

### Over-Engineering Red Flags

- ❌ Custom encryption algorithms
- ❌ Complex key rotation schemes
- ❌ Distributed token synchronization
- ❌ Hardware security module integration
- ❌ Blockchain-based token storage

### Keep It Simple

- ✅ Use platform-provided security
- ✅ Standard encryption libraries
- ✅ Graceful error handling
- ✅ Clear, obvious API
- ✅ Comprehensive testing

## Migration from Current State

### Current Issues

- Tokens stored in plaintext files
- No encryption for sensitive data
- Manual token management

### Migration Plan

**Week 1**: Implement secure storage package
**Week 2**: Integrate with existing token usage
**Week 3**: Remove plaintext storage
**Week 4**: Documentation and team training

### Backward Compatibility

During migration, support both old and new storage:

```typescript
// Hybrid approach during migration
async getToken(key: string): Promise<string | null> {
  // Try secure storage first
  let token = await secureStorage.retrieve(key)
  if (token) return token

  // Fall back to old plaintext storage
  token = await oldStorage.get(key)
  if (token) {
    // Migrate to secure storage
    await secureStorage.store(key, token)
    await oldStorage.remove(key)
  }

  return token
}
```

## Future Considerations

### Potential Enhancements

**If/when needed** (not now):

- Hardware security key support
- Cross-device token synchronization
- Advanced audit logging
- Token sharing between team members

### Decision Framework

Before adding complexity, ask:

1. **Is this actually needed?** (evidence required)
2. **Can existing solutions handle it?** (platform features)
3. **What's the maintenance cost?** (ongoing complexity)
4. **Does it solve a real user problem?** (not just theoretical)

## Implementation Prompt for Claude Code

```markdown
I need to implement the secure token storage system for Atomiton based on the SECURE_TOKEN_STORAGE_STRATEGY document.

Requirements:

1. Create packages/@atomiton/secure-storage package
2. Implement desktop keychain storage using keytar
3. Implement web encrypted localStorage using Web Crypto API
4. Create platform detection and unified API
5. Add comprehensive tests for both platforms
6. Keep implementation under 200 lines total
7. Follow the exact API design from the strategy document
8. Include error handling that never crashes the app
9. Add TypeScript definitions

Key principles:

- Simple, obvious API
- Fail gracefully on errors
- Use platform-provided security
- No over-engineering
- 25-line core implementations as specified
- Ready to ship in 2 days

Files to create:

- packages/@atomiton/secure-storage/package.json
- packages/@atomiton/secure-storage/src/index.ts (public API)
- packages/@atomiton/secure-storage/src/desktop.ts (keychain impl)
- packages/@atomiton/secure-storage/src/web.ts (encrypted storage)
- packages/@atomiton/secure-storage/src/types.ts (TypeScript defs)
- packages/@atomiton/secure-storage/tests/desktop.test.ts
- packages/@atomiton/secure-storage/tests/web.test.ts

Please implement this exactly as specified in the strategy document, keeping the complexity minimal and the implementation rock-solid.
```

---

**Strategy Status**: Ready for Implementation
**Complexity Level**: Minimal (25-line core implementations)
**Ship Timeline**: 2 days
**Dependencies**: keytar (desktop), Web Crypto API (web)
**Risk Level**: Low (using platform-provided security)
