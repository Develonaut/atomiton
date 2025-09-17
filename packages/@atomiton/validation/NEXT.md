# Next Steps - @atomiton/validation

## Overview

Future enhancements for the validation package.

## Planned Features

### Additional Validators

Consider adding commonly used validators as they become needed:

- `validators.phoneNumber` - International phone validation
- `validators.creditCard` - Credit card number validation
- `validators.ipAddress` - IPv4/IPv6 validation
- `validators.jwt` - JWT token validation

### Schema Utilities

If patterns emerge across packages:

- Common schema compositions
- Validation error formatting utilities
- Schema migration helpers

## Potential Improvements

- Add validation performance benchmarks
- Consider caching for expensive validations
- Add validation middleware patterns

## Note

This package is intentionally minimal. Only add features when they provide clear value across multiple consumers.
