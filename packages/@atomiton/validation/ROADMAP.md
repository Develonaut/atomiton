# Roadmap - @atomiton/validation

## Vision

A minimal, maintainable validation package that centralizes our validation library dependency while providing commonly needed validators.

## Design Principles

1. **Minimal Abstraction** - Direct re-export of Zod, no unnecessary wrappers
2. **Essential Validators Only** - Only add validators used by multiple packages
3. **Future Flexibility** - Centralized dependency enables library changes
4. **Zero Overhead** - No performance impact vs direct Zod usage

## Long-term Goals

### Phase 1: Current (Complete)

- ✅ Basic package with Zod re-export
- ✅ Essential validators (uuid, email, url, semver)
- ✅ Migration of existing packages

### Phase 2: Stabilization

- Monitor usage patterns
- Identify common validation needs
- Add validators only when justified by usage

### Phase 3: Potential Evolution

- Consider validation middleware if patterns emerge
- Explore performance optimizations if needed
- Evaluate alternative validation libraries if Zod becomes limiting

## Non-Goals

- Building a validation framework
- Creating custom validation DSL
- Abstracting away Zod's API
- Adding validators "just in case"

## Success Metrics

- Zero performance regression vs direct Zod
- Easy migration path for new packages
- Minimal maintenance burden
- Clear value for centralization
