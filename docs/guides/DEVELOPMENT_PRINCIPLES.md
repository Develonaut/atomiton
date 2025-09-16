# Core Development Principles

## Table of Contents

- [Foundation Principles](#foundation-principles)
  - [Simplicity First (Voorhees' Law)](#simplicity-first-voorhees-law)
  - [DRY (Don't Repeat Yourself)](#dry-dont-repeat-yourself)
  - [YAGNI (You Aren't Gonna Need It)](#yagni-you-arent-gonna-need-it)
  - [KISS (Keep It Simple, Stupid)](#kiss-keep-it-simple-stupid)
  - [Composition Over Inheritance](#composition-over-inheritance)
  - [Separation of Concerns](#separation-of-concerns)
- [Code Quality Standards](#code-quality-standards)
- [Performance Principles](#performance-principles)
- [Error Handling](#error-handling)
- [Testing Philosophy](#testing-philosophy)
- [Documentation Standards](#documentation-standards)
- [API Design](#api-design)
- [Security Principles](#security-principles)
- [Monitoring & Observability](#monitoring--observability)
- [Continuous Improvement](#continuous-improvement)

## Foundation Principles

### Simplicity First (Voorhees' Law)

**"Cut through architectural complexity. What's the SIMPLEST possible solution that still meets all requirements?"**

- **Simple is better than complex**
- **Complex is better than complicated**
- **Don't over-engineer - EVER**
- Challenge every abstraction: Is it actually needed?
- Obvious code over clever code
- If you can't explain it simply, it's too complex
- Delete code whenever possible
- Make it work, make it right, make it simple

### DRY (Don't Repeat Yourself)

- Single source of truth for every piece of knowledge
- Extract common patterns into reusable components, utilities, or abstractions
- When duplication is found, refactor to a shared solution
- Configuration over duplication

### YAGNI (You Aren't Gonna Need It)

**Core Simplicity Principle:**

- Build only what's needed NOW
- No speculative features
- No "might be useful later" code
- Delete unused code immediately
- Features should be pulled by requirements, not pushed by developers

### KISS (Keep It Simple, Stupid)

**Enhanced with Voorhees' Simplicity Mandate:**

- Start with the simplest solution that could possibly work
- Add complexity ONLY when proven necessary
- Refactor to simplify, not to show off
- Ask: "What can we remove?" before "What can we add?"
- Flat is better than nested
- Explicit is better than implicit

### Minimal Barrel Exports (Performance First)

**Barrel exports (index.ts files) slow down builds and bundlers. Use sparingly.**

**ONLY use barrel exports for:**

- Component composition and slot organization (UI components with variants/slots)
- Public API surfaces of packages (single entry point)

**NEVER use barrel exports for:**

- Internal utilities or helpers
- Types and interfaces (import directly)
- Services or stores
- Constants or configuration
- Testing utilities

**Why this matters:**

- Barrel exports prevent tree-shaking
- They increase build times exponentially
- They create circular dependency risks
- They obscure the actual import source

**Instead of:**

```typescript
// utils/index.ts ❌
export * from "./string";
export * from "./array";
export * from "./date";
```

**Do this:**

```typescript
// Import directly ✅
import { formatDate } from "@/utils/date";
import { capitalize } from "@/utils/string";
```

### Build for Extensibility

- Design systems that can grow without breaking existing functionality
- Use composition over inheritance where possible
- Create plugin-like architectures for features that may vary
- Leave hooks and extension points for future requirements
- Prefer configuration and strategy patterns over hardcoded behavior

### Layered Architecture & Abstraction

- Multiple layers of abstraction to isolate change impact
- Clear separation of concerns between layers
- Each layer should only know about the layer directly below it
- Changes in one layer shouldn't ripple through the entire system
- Use facade patterns to simplify complex subsystems

### Consistent APIs

- Uniform method naming conventions across the codebase
- Predictable input/output patterns
- Consistent error handling and response formats
- Standard patterns for similar operations (CRUD, events, etc.)
- Documentation embedded in the interface design

## Implementation Principles

### Defensive Programming

- Validate inputs at system boundaries
- Fail fast with clear error messages
- Use type systems to catch errors at compile time
- Handle edge cases explicitly
- Never trust external data

### Testability First

- Design components with testing in mind
- Dependency injection for better unit testing
- Clear boundaries between units of work
- Avoid hidden dependencies and global state
- Mock-friendly interfaces

### Performance Consciousness

- Measure before optimizing
- Design for performance from the start where it matters
- Lazy loading and code splitting strategies
- Efficient data structures and algorithms
- Cache strategically, invalidate intelligently

### Maintainability

- Self-documenting code through clear naming
- Complexity isolation - complex logic in well-tested modules
- Regular refactoring as understanding improves
- Clear module boundaries and dependencies
- Principle of least surprise

## Architectural Patterns

### Separation of Concerns

- Business logic separate from UI
- Data access separate from business logic
- Cross-cutting concerns (logging, auth) as aspects
- Domain models independent of frameworks

### Dependency Management

- Depend on abstractions, not concretions
- Inversion of control where appropriate
- Minimize coupling between modules
- Clear, explicit dependencies
- Avoid circular dependencies

### State Management

- Single source of truth for application state
- Predictable state mutations
- Immutable data where possible
- Clear data flow patterns
- Event-driven updates for loose coupling

### Error Handling

- Graceful degradation over complete failure
- User-friendly error messages
- Detailed logging for debugging
- Error boundaries to contain failures
- Recovery strategies where possible

## Code Quality Standards

### Simplicity Review Gate (Voorhees Check)

**Before ANY code is accepted:**

- Has unnecessary complexity been removed?
- Can this be done with less code?
- Are all abstractions justified?
- Would a junior developer understand this?
- Have we avoided premature optimization?

### Readability Over Cleverness

- Clear, obvious code over clever one-liners
- Meaningful variable and function names
- Small, focused functions
- Consistent formatting and style
- Comments for why, not what

### Progressive Enhancement

- Start with core functionality
- Layer on enhancements
- Graceful fallbacks
- Feature detection over assumptions
- Accessibility as a default

### Security by Design

- Principle of least privilege
- Input sanitization
- Output encoding
- Secure defaults
- Regular security audits

## Team Principles

### Collective Code Ownership

- Everyone responsible for code quality
- Refactor when you see opportunities
- Fix broken windows immediately
- Share knowledge through code reviews
- Document decisions and rationale

### Continuous Improvement

- Regular retrospectives on architecture
- Embrace refactoring as part of development
- Learn from failures and successes
- Stay current with best practices
- Question existing patterns when better ones emerge

## Domain-Specific Applications

While these principles apply globally, specific domains may have additional considerations:

- **UI Components**: Emphasis on reusability, accessibility, and consistent UX
- **Data Layer**: Focus on integrity, validation, and efficient queries
- **API Design**: RESTful principles, versioning strategies, and backward compatibility
- **Node System**: Composability, type safety, and clear contracts
- **Theme System**: Flexibility, performance, and maintainability

Refer to domain-specific documentation for additional principles and patterns relevant to each area.

## Decision Making Framework

When faced with architectural decisions:

1. **Identify the problem** clearly before jumping to solutions
2. **Consider multiple approaches** with pros/cons
3. **Evaluate against these principles** for alignment
4. **Choose the simplest solution** that meets requirements
5. **Document the decision** and reasoning
6. **Plan for change** - no decision is permanent

## Anti-Patterns to Avoid

- God objects/functions that do everything
- Premature optimization without metrics
- Over-engineering for unlikely scenarios
- Tight coupling between unrelated components
- Magic numbers and hardcoded values
- Ignoring error cases
- Inconsistent patterns within the same domain
- Framework lock-in without abstraction

---

These principles guide our development but are not rigid rules. Use judgment and context to apply them appropriately. When principles conflict, discuss trade-offs with the team and document decisions.
