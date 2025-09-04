# Attribution

## @n8n/di

This package is based on the `@n8n/di` package from the n8n project.

- **Original Source**: https://github.com/n8n-io/n8n/tree/master/packages/%40n8n/di
- **Original Authors**: n8n GmbH and contributors
- **Original License**: Fair-code license (Sustainable Use License and n8n Enterprise License)
- **Copyright**: © 2024 n8n GmbH

### Modifications

The original code has been adapted for use in the Atomiton project with the following changes:

1. Simplified to remove n8n-specific features
2. Added additional convenience methods (`clear()`, `getRegisteredServices()`)
3. Added `@Injectable` alias for compatibility
4. Enhanced JSDoc documentation with examples
5. Adjusted error messages and branding
6. Removed n8n-specific build tooling references

### Why We Chose This Implementation

n8n's DI implementation provides:

- A lightweight, maintainable alternative to TypeDI
- Built-in circular dependency detection
- Support for factory functions
- Clean, understandable codebase
- Proven in production use

### License Compliance

The original n8n code is licensed under their Fair-code license. Our adaptation is licensed under MIT as part of the Atomiton project. Users should review both licenses to ensure compliance with their use case.

## reflect-metadata

This package depends on `reflect-metadata`:

- **Source**: https://github.com/rbuckton/reflect-metadata
- **License**: Apache-2.0
- **Copyright**: Ron Buckton

---

We are grateful to the n8n team for their excellent DI implementation that served as the foundation for this package.
