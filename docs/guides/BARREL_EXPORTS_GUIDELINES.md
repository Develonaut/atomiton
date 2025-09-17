# Barrel Exports Guidelines

## Overview

Barrel exports (index.ts files) are a double-edged sword in TypeScript projects. While they provide organizational benefits and clean import paths, they significantly impact build performance and can prevent optimal tree-shaking. This guide establishes clear rules for when barrel exports are beneficial versus detrimental.

## The Core Philosophy

**Use barrel exports judiciously for organizational benefit, never for convenience alone.**

The key question: "Does this barrel export provide genuine architectural value that justifies the performance cost?"

## When to Use Barrel Exports ✅

### 1. Component Composition Patterns

**Use Case**: When components work together as a cohesive unit with clear hierarchical relationships.

```typescript
// ✅ GOOD: components/Card/index.ts
export { Card } from "./Card";
export { CardHeader } from "./CardHeader";
export { CardBody } from "./CardBody";
export { CardFooter } from "./CardFooter";

// Usage: import { Card, CardHeader, CardBody } from "@/components/Card"
```

**Why this works**:

- Components are designed to work together
- Represents a genuine architectural boundary
- Users consume these as a cohesive API
- Minimal performance impact (few, related exports)

### 2. Package Public APIs

**Use Case**: Main entry point for external package consumers.

```typescript
// ✅ GOOD: packages/@atomiton/ui/src/index.ts
export { Button } from "./components/Button";
export { Card, CardHeader, CardBody } from "./components/Card";
export { Modal } from "./components/Modal";
export type { ButtonProps, CardProps, ModalProps } from "./types";
```

**Why this works**:

- Clear public API boundary
- External consumers need a single entry point
- Package maintainers control what's exposed
- Enables internal reorganization without breaking consumers

### 3. Feature Modules with Tight Coupling

**Use Case**: When a folder represents a complete feature with multiple interdependent parts.

```typescript
// ✅ GOOD: features/user-management/index.ts
export { UserProfile } from "./UserProfile";
export { UserSettings } from "./UserSettings";
export { UserPermissions } from "./UserPermissions";
export { useUserManagement } from "./hooks";
```

**Why this works**:

- Represents a business domain boundary
- Components/hooks are designed to work together
- Clear feature isolation
- Consumers use multiple exports together

## When NOT to Use Barrel Exports ❌

### 1. Utility Collections

```typescript
// ❌ BAD: utils/index.ts
export { formatDate } from "./formatDate";
export { validateEmail } from "./validateEmail";
export { debounce } from "./debounce";

// ✅ GOOD: Direct imports
import { formatDate } from "@/utils/formatDate";
import { validateEmail } from "@/utils/validateEmail";
```

**Why barrels hurt here**:

- Utilities are used independently
- Forces bundlers to analyze entire utility collection
- Prevents effective tree-shaking
- No architectural benefit

### 2. Type Collections

```typescript
// ❌ BAD: types/index.ts
export type { User } from "./User";
export type { Product } from "./Product";
export type { Order } from "./Order";

// ✅ GOOD: Direct imports
import type { User } from "@/types/User";
import type { Product } from "@/types/Product";
```

**Why barrels hurt here**:

- Types are typically used in isolation
- TypeScript must analyze all types in barrel
- No runtime benefit, only organizational
- Direct imports are clearer about dependencies

### 3. Service/Hook Collections

```typescript
// ❌ BAD: hooks/index.ts
export { useLocalStorage } from "./useLocalStorage";
export { useDebounce } from "./useDebounce";
export { useAuth } from "./useAuth";

// ✅ GOOD: Direct imports
import { useLocalStorage } from "@/hooks/useLocalStorage";
```

**Why barrels hurt here**:

- Hooks are used independently
- Different hooks have different dependencies
- Barrel forces loading of unused hook dependencies

### 4. Internal Module Organization

```typescript
// ❌ BAD: Using barrels for internal organization
src / store / index.ts; // Re-exports user.ts, product.ts, order.ts
user.ts;
product.ts;
order.ts;

// ✅ GOOD: Direct internal imports
import { userStore } from "@/store/user";
import { productStore } from "@/store/product";
```

**Why barrels hurt here**:

- Internal organization shouldn't impact external consumers
- Adds unnecessary module resolution steps
- No API boundary benefit

## The Decision Framework

When considering a barrel export, ask these questions in order:

### 1. Architectural Boundary Test

- Does this folder represent a genuine architectural boundary?
- Do the exports work together as a cohesive unit?
- Would consumers typically use multiple exports together?

**If NO**: Don't use a barrel export.

### 2. Performance Impact Test

- How many exports will this barrel contain?
- Will this barrel grow significantly over time?
- Are the exports frequently used independently?

**If high impact**: Don't use a barrel export.

### 3. Alternative Organization Test

- Can we achieve the same organizational benefit with folder structure alone?
- Would direct imports be clearer about actual dependencies?

**If alternatives work well**: Don't use a barrel export.

### 4. API Stability Test

- Is this a stable public API that external consumers depend on?
- Do we need to control what's exposed vs internal?

**If YES to both**: Consider a barrel export.

## Folder Organization Without Barrels

You can achieve excellent organization without barrel exports:

```typescript
// Excellent organization through folder structure
src / components / user / UserProfile.tsx;
UserAvatar.tsx;
UserSettings.tsx;
product / ProductCard.tsx;
ProductList.tsx;
ProductDetail.tsx;
utils / date / formatDate.ts;
parseDate.ts;
validation / validateEmail.ts;
validatePassword.ts;

// Clear, direct imports
import { UserProfile } from "@/components/user/UserProfile";
import { ProductCard } from "@/components/product/ProductCard";
import { formatDate } from "@/utils/date/formatDate";
import { validateEmail } from "@/utils/validation/validateEmail";
```

**Benefits**:

- Clear dependency relationships
- Excellent tree-shaking
- Fast build times
- Easy to understand and maintain

## Performance Considerations

### Build Time Impact

- Each barrel export adds module resolution overhead
- Barrel chains (barrels importing from barrels) multiply the impact
- TypeScript must analyze entire barrel dependency graphs

### Bundle Size Impact

- Barrel exports can prevent dead code elimination
- Bundlers may include unused exports from barrel files
- Complex barrel chains increase bundle analysis time

### Development Experience Impact

- Barrel exports can slow down hot module replacement (HMR)
- IDE performance can degrade with complex barrel structures
- Debugging becomes harder when import sources are obscured

## Migration Strategy

### When Removing Existing Barrels

1. **Assess Impact**: Identify all files importing from the barrel
2. **Update Imports**: Change to direct imports systematically
3. **Test Thoroughly**: Ensure no broken imports or circular dependencies
4. **Measure Performance**: Verify actual build time improvements

### When Adding New Barrels

1. **Apply Decision Framework**: Use the four-question test above
2. **Start Small**: Begin with minimal exports, resist growth
3. **Monitor Performance**: Watch for build time impacts
4. **Regular Review**: Periodically assess if barrel is still justified

## Examples in Practice

### ✅ Good Barrel Export: UI Component Library

```typescript
// packages/@atomiton/ui/src/components/Table/index.ts
export { Table } from "./Table";
export { TableHeader } from "./TableHeader";
export { TableBody } from "./TableBody";
export { TableRow } from "./TableRow";
export { TableCell } from "./TableCell";
export { TableFooter } from "./TableFooter";

// Usage demonstrates the value
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@atomiton/ui";

function DataTable() {
  return (
    <Table>
      <TableHeader>...</TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>...</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### ❌ Poor Barrel Export: Utility Collection

```typescript
// ❌ BAD: utils/index.ts
export { debounce } from "./debounce";
export { throttle } from "./throttle";
export { formatCurrency } from "./formatCurrency";
export { parseJSON } from "./parseJSON";
export { validateURL } from "./validateURL";
// ... 20+ more utilities

// This forces bundlers to analyze 20+ utilities when you only need one
import { debounce } from "@/utils"; // Inefficient

// ✅ BETTER: Direct import
import { debounce } from "@/utils/debounce"; // Efficient
```

## Conclusion

Barrel exports are a powerful tool that should be used sparingly and strategically. Focus on genuine architectural boundaries and component composition patterns. When in doubt, favor direct imports for better performance and clearer dependencies.

**Remember**: Organization through folder structure is often sufficient and more performant than barrel exports.

---

**Related Documentation**:

- [Code Style Guidelines](./CODE_STYLE.md)
- [Development Principles](./DEVELOPMENT_PRINCIPLES.md)
- [Package Integration Guide](./PACKAGE_INTEGRATION.md)
