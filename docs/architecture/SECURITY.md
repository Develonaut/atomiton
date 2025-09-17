# Security Architecture

## Overview

Atomiton's security architecture provides comprehensive protection for user data, API credentials, and Blueprint content across all deployment environments. The system prioritizes simplicity and reliability over complex security theater.

## Security Principles

### Keep It Simple

- Use platform-provided security features (OS keychain, Web Crypto API)
- Avoid custom encryption schemes or over-engineered solutions
- Fail gracefully when security features are unavailable
- Clear, auditable implementations

### Defense in Depth

- Multiple layers of protection for sensitive data
- OS-level encryption combined with application-level controls
- Secure transport and storage across all components
- Regular security audits and updates

## Threat Model

### What We Protect Against

- Casual access to stored credentials and API keys
- Basic malware scanning local storage
- Accidental credential exposure in logs or version control
- Unauthorized access to Blueprint content

### What We Don't Protect Against

- Nation-state actors or advanced persistent threats
- Physical access to unlocked machines
- Memory dumps from running processes (future consideration)
- Sophisticated malware with administrative privileges

## Platform-Specific Security

### Desktop (Electron) - Primary Focus

**Technology Stack:**

- **Primary**: Electron `safeStorage` API (industry standard)
- **Keychain**: OS-native credential storage (Keychain Access, Credential Manager, Secret Service)
- **Storage**: Encrypted files in application data directory

**Implementation:**

```typescript
// Secure credential storage
const storage = await createSecureStorage();
await storage.store("api-key", credentials);
const retrieved = await storage.retrieve("api-key");
```

**Security Properties:**

- Encryption keys stored in OS keychain
- Data encrypted at rest using platform-native encryption
- Only accessible to current user and Atomiton application
- Automatic cleanup on application uninstall

### Web Browser

**Technology Stack:**

- **Primary**: Web Crypto API for encryption
- **Storage**: Encrypted data in IndexedDB
- **Transport**: HTTPS for all communications

**Implementation Strategy:**

- Client-side encryption before storage
- Origin-specific storage isolation
- Secure key derivation using Web Crypto API
- XSS protection through encrypted storage

### Development Environment

**Technology Stack:**

- **Local**: `.env.local` files (gitignored)
- **Team**: Shared development tokens (non-production)
- **CI/CD**: Environment variables in secure runners

## Storage Security Strategy

### Credential Types & Storage Methods

| Credential Type | Desktop     | Web             | Lifetime   | Notes            |
| --------------- | ----------- | --------------- | ---------- | ---------------- |
| API Keys        | OS Keychain | Encrypted Local | Permanent  | User-provided    |
| Auth Tokens     | OS Keychain | Encrypted Local | Session    | OAuth/JWT        |
| Session Data    | Memory Only | Session Storage | Tab        | Non-sensitive    |
| Blueprint Data  | File System | IndexedDB       | Persistent | Optional encrypt |

### Implementation Components

**@atomiton/storage Package:**

- Universal storage abstraction across platforms
- Auto-detection of appropriate storage backend
- Consistent API for all storage operations
- Built-in encryption for sensitive data

**Secure Storage Interface:**

```typescript
interface ISecureStorage {
  store(key: string, value: string): Promise<void>;
  retrieve(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
  isAvailable(): boolean;
}
```

## Authentication & Authorization

### User Authentication

**Primary Method**: OAuth 2.0 with PKCE

- Supabase integration for user management
- No password storage in application
- Automatic token refresh handling
- Secure logout with token revocation

**Flow Architecture:**

```
Desktop App → OAuth Provider → Supabase → Application Access
```

### API Authorization

**Third-Party APIs:**

- User-provided API keys stored securely
- Automatic key validation and error handling
- Per-service credential isolation
- Clear indication of required permissions

## Network Security

### Transport Security

**All Communications:**

- HTTPS/TLS 1.3 for all external communications
- Certificate validation and pinning
- Secure WebSocket connections (WSS)
- No fallback to insecure protocols

**API Security:**

- Rate limiting on all endpoints
- Request validation and sanitization
- CORS configuration for web deployments
- Authentication headers for sensitive operations

### Cloud Integration Security

**Supabase Integration:**

- Row-level security for user data isolation
- Encrypted storage for sensitive Blueprint content
- Audit logging for administrative operations
- Regular security updates and monitoring

## Blueprint Content Security

### Sensitive Data Handling

**Classification:**

- **Public**: Blueprint structure and logic (unencrypted)
- **Private**: API keys and credentials (encrypted)
- **Confidential**: Proprietary business logic (optional encryption)

**Storage Strategy:**

- Automatic detection of sensitive content in Blueprints
- Selective encryption of credential-containing nodes
- Clear indication of security status in UI
- User control over encryption preferences

### Data at Rest

**Desktop Storage:**

- Blueprints stored in user documents directory
- Sensitive content encrypted using secure storage
- Regular file system permissions
- Optional full-Blueprint encryption

**Cloud Storage:**

- End-to-end encryption for synchronized Blueprints
- User-controlled encryption keys
- Secure backup and recovery processes
- Geographic data residency options

## Security Monitoring & Compliance

### Audit Logging

**Events Logged:**

- Credential access and modifications
- Blueprint encryption/decryption operations
- Authentication events and failures
- Security-related configuration changes

**Log Security:**

- No sensitive data in log files
- Secure log storage and transmission
- Regular log rotation and archival
- Compliance with data retention policies

### Vulnerability Management

**Process:**

- Regular dependency updates and security scans
- Automated vulnerability detection in CI/CD
- Security patch deployment procedures
- Third-party security audit schedule

## Implementation Timeline

### Phase 1: Core Security (Current)

- Electron secure storage implementation
- Basic credential management
- Transport security for all communications
- Development environment security

### Phase 2: Enhanced Features

- Web browser secure storage
- Advanced Blueprint encryption options
- Team credential sharing capabilities
- Comprehensive audit logging

### Phase 3: Enterprise Features

- SOC 2 compliance capabilities
- Advanced threat detection
- Enterprise key management
- Compliance reporting tools

## Migration & Compatibility

### Upgrading Security

**Approach:**

- Graceful migration from existing storage
- Backward compatibility during transition
- User notification of security improvements
- Optional security feature adoption

**Migration Process:**

1. Detect existing credential storage
2. Prompt user for migration to secure storage
3. Safely transfer credentials with validation
4. Clean up old storage after confirmation

## Security Testing

### Automated Testing

**Test Coverage:**

- Credential storage and retrieval operations
- Encryption/decryption functionality
- Cross-platform compatibility
- Error handling and recovery scenarios

**Security-Specific Tests:**

- Verify OS keychain integration
- Test encryption key isolation
- Validate secure transport protocols
- Check for credential leakage in logs

### Manual Security Reviews

**Regular Reviews:**

- Code review for security-sensitive changes
- Architecture review for new features
- Third-party dependency security assessment
- Penetration testing of critical flows

## Related Documentation

### Implementation Details

- **[Storage Architecture](./STORAGE.md)** - Complete storage system design
- **[Secure Token Storage Strategy](../strategies/SECURE_TOKEN_STORAGE_STRATEGY.md)** - Detailed implementation strategy

### Package Documentation

- **Storage Package**: `/packages/@atomiton/storage/README.md` - Package usage and API
- **Security Recommendations**: `/packages/@atomiton/storage/SECURITY_RECOMMENDATIONS.md` - Research and best practices

### Development Guidelines

- **[Development Principles](../guides/DEVELOPMENT_PRINCIPLES.md)** - Security-aware development practices
- **[Code Style](../guides/CODE_STYLE.md)** - Secure coding standards

---

**Last Updated**: 2025-09-17
**Security Review**: Required for all changes to this document
**Compliance Status**: Internal security standards - SOC 2 assessment pending
