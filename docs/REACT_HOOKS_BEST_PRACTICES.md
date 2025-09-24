# React Hooks Best Practices

## Core Principle: Hooks as Contracts

React hooks should serve as **contracts** between your business logic and
React's lifecycle. They orchestrate but don't implement.

## The Problem

Many developers write hooks that become junk drawers of business logic, making
them:

- Hard to test
- Difficult to reuse
- Impossible to understand
- Tightly coupled to React

## The Solution: Separation of Concerns

### Hooks Do:

- Manage React state
- Handle effects and lifecycle
- Orchestrate function calls
- Provide the React interface

### Utils Do:

- Implement business logic
- Transform data
- Make API calls
- Validate inputs
- Calculate values

## Pattern: Hook as Orchestra Conductor

Think of hooks as orchestra conductors - they coordinate the musicians (utils)
but don't play the instruments.

## Examples

### ❌ BAD: Business Logic in Hook

```typescript
// hooks/useInvoiceCalculator.ts
export function useInvoiceCalculator() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const calculateInvoice = (items: LineItem[]) => {
    // ❌ Complex business logic in hook
    let subtotal = 0;
    let taxableAmount = 0;

    items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;

      if (item.taxable) {
        taxableAmount += itemTotal;
      }
    });

    // ❌ Business rules in hook
    const taxRate = subtotal > 1000 ? 0.08 : 0.1;
    const calculatedTax = taxableAmount * taxRate;

    // ❌ Discount logic in hook
    let discount = 0;
    if (subtotal > 5000) {
      discount = subtotal * 0.05;
    } else if (subtotal > 2000) {
      discount = subtotal * 0.02;
    }

    const finalTotal = subtotal + calculatedTax - discount;

    setTax(calculatedTax);
    setTotal(finalTotal);
    setInvoice({
      items,
      subtotal,
      tax: calculatedTax,
      discount,
      total: finalTotal,
    });
  };

  return { invoice, tax, total, calculateInvoice };
}
```

### ✅ GOOD: Logic Extracted to Utils

```typescript
// utils/invoice/calculations.ts
export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

export function calculateTaxableAmount(items: LineItem[]): number {
  return items
    .filter((item) => item.taxable)
    .reduce((sum, item) => sum + item.quantity * item.price, 0);
}

// utils/invoice/tax.ts
export function getTaxRate(subtotal: number): number {
  return subtotal > 1000 ? 0.08 : 0.1;
}

export function calculateTax(taxableAmount: number, rate: number): number {
  return taxableAmount * rate;
}

// utils/invoice/discount.ts
export function calculateDiscount(subtotal: number): number {
  if (subtotal > 5000) return subtotal * 0.05;
  if (subtotal > 2000) return subtotal * 0.02;
  return 0;
}

// utils/invoice/builder.ts
export function buildInvoice(items: LineItem[]): Invoice {
  const subtotal = calculateSubtotal(items);
  const taxableAmount = calculateTaxableAmount(items);
  const taxRate = getTaxRate(subtotal);
  const tax = calculateTax(taxableAmount, taxRate);
  const discount = calculateDiscount(subtotal);
  const total = subtotal + tax - discount;

  return {
    items,
    subtotal,
    tax,
    discount,
    total,
  };
}

// hooks/useInvoiceCalculator.ts
export function useInvoiceCalculator() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // ✅ Hook only orchestrates
  const calculateInvoice = useCallback((items: LineItem[]) => {
    const newInvoice = buildInvoice(items);
    setInvoice(newInvoice);
  }, []);

  // ✅ Derived values using utils
  const tax = invoice?.tax ?? 0;
  const total = invoice?.total ?? 0;

  return { invoice, tax, total, calculateInvoice };
}
```

## Testing Benefits

### Testing the BAD Pattern

```typescript
// ❌ Need React testing library, complex setup
it("calculates invoice", () => {
  const { result } = renderHook(() => useInvoiceCalculator());

  act(() => {
    result.current.calculateInvoice([
      { quantity: 2, price: 100, taxable: true },
    ]);
  });

  expect(result.current.total).toBe(220);
});
```

### Testing the GOOD Pattern

```typescript
// ✅ Pure function tests, no React needed
describe("invoice calculations", () => {
  it("calculates subtotal", () => {
    const items = [{ quantity: 2, price: 100, taxable: true }];
    expect(calculateSubtotal(items)).toBe(200);
  });

  it("applies correct tax rate", () => {
    expect(getTaxRate(500)).toBe(0.1);
    expect(getTaxRate(1500)).toBe(0.08);
  });

  it("builds complete invoice", () => {
    const invoice = buildInvoice(items);
    expect(invoice.total).toBe(220);
  });
});
```

## More Examples

### Form Validation Hook

```typescript
// ❌ BAD
function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validate = (values) => {
    const newErrors = {};

    // Complex validation logic in hook
    if (!values.email || !values.email.includes("@")) {
      newErrors.email = "Invalid email";
    }

    if (!values.password || values.password.length < 8) {
      newErrors.password = "Password too short";
    }

    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate };
}

// ✅ GOOD
// utils/validation/rules.ts
export const emailValidator = (email: string) =>
  email?.includes("@") ? null : "Invalid email";

export const passwordValidator = (password: string) =>
  password?.length >= 8 ? null : "Password too short";

export const matchValidator = (value: string, match: string) =>
  value === match ? null : "Values do not match";

// utils/validation/form.ts
export function validateForm(values: FormValues, rules: ValidationRules) {
  const errors: FormErrors = {};

  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(values[field], values);
    if (error) errors[field] = error;
  });

  return errors;
}

// hooks/useFormValidation.ts
function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback(
    (values: FormValues) => {
      const newErrors = validateForm(values, rules);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules],
  );

  return { errors, validate };
}
```

### Data Fetching Hook

```typescript
// ❌ BAD
function usePosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // API logic in hook
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        // Transform logic in hook
        const transformed = data.map((post) => ({
          ...post,
          excerpt: post.content.substring(0, 100),
          readTime: Math.ceil(post.content.split(" ").length / 200),
        }));
        setPosts(transformed);
      });
  }, []);

  return posts;
}

// ✅ GOOD
// utils/api/posts.ts
export async function fetchPosts(): Promise<RawPost[]> {
  const response = await fetch("/api/posts");
  return response.json();
}

// utils/posts/transform.ts
export function transformPost(post: RawPost): Post {
  return {
    ...post,
    excerpt: createExcerpt(post.content),
    readTime: calculateReadTime(post.content),
  };
}

export function createExcerpt(content: string, length = 100): string {
  return content.substring(0, length);
}

export function calculateReadTime(content: string, wpm = 200): number {
  return Math.ceil(content.split(" ").length / wpm);
}

// hooks/usePosts.ts
function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const rawPosts = await fetchPosts();
        const transformed = rawPosts.map(transformPost);
        setPosts(transformed);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return { posts, loading };
}
```

## Guidelines

### DO:

- Keep hooks under 50 lines
- Extract logic to pure functions
- Make utils independently testable
- Use hooks for React lifecycle only
- Name utils clearly by their purpose

### DON'T:

- Put business logic in hooks
- Make API calls directly in hooks
- Transform data in hooks
- Validate in hooks
- Calculate values in hooks

## Benefits

1. **Testability**: Pure functions are easy to test
2. **Reusability**: Logic can be used outside React
3. **Clarity**: Clear separation of concerns
4. **Maintainability**: Easy to find and modify logic
5. **Performance**: Utils can be memoized/optimized independently

## Hook Checklist

Before approving a hook:

- [ ] Is it under 50 lines?
- [ ] Is all business logic in utils?
- [ ] Are utils pure functions?
- [ ] Can utils be tested without React?
- [ ] Does the hook only orchestrate?
- [ ] Are there clear input/output contracts?

## Remember

> "A hook should be so simple that it's boring. The interesting stuff happens in
> utils."

Hooks are the glue, not the engine. Keep them thin, testable, and focused on
React integration only.
