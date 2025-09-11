# Next Work Queue - @atomiton/form

## Phase 2: Core Form Features 🚧 CURRENT

**Timeline**: 1 week (Started Sept 11, 2025)  
**Goal**: Complete core form management functionality

### Essential Form Features

1. **Validation System** - Complete Zod integration
2. **Field State Management** - Dirty, touched, error states
3. **Form Submission** - Async handling with loading states
4. **Cross-field Validation** - Field dependencies and conditional logic
5. **Error Handling** - Comprehensive error display patterns

### Hook Enhancements

1. **useField improvements** - Better state management
2. **useForm hook** - Complete form lifecycle management
3. **useValidation** - Centralized validation logic
4. **useFormMode** - View/edit mode switching

## Phase 3: Form Components & Patterns

**Timeline**: 1 week  
**Goal**: Reusable form components and patterns

### Pre-built Components

- [ ] FormField wrapper with label/error display
- [ ] FormSection for grouping related fields
- [ ] SubmitButton with loading states
- [ ] ResetButton with confirmation

### Common Patterns

- [ ] Multi-step forms
- [ ] Dynamic field arrays
- [ ] Conditional field rendering
- [ ] Auto-save functionality

## Phase 4: Integration & Testing

**Timeline**: 1 week  
**Goal**: Testing and integration with UI components

### Testing Strategy

- [ ] Unit tests for all hooks
- [ ] Integration tests with @atomiton/ui components
- [ ] Form validation edge cases
- [ ] Performance testing with large forms

### UI Integration

- [ ] Integration with @atomiton/ui form components
- [ ] Consistent styling patterns
- [ ] Accessibility compliance
- [ ] Error message standardization

## Phase 5: Advanced Features

**Timeline**: Future sprints  
**Goal**: Advanced form management capabilities

### Advanced Features

- Schema-driven form generation
- Form serialization/deserialization
- Undo/redo functionality
- Real-time collaboration on forms

### Performance Optimizations

- Field-level subscriptions
- Minimal re-renders
- Lazy validation
- Virtual scrolling for large forms

## What We're NOT Doing

- ❌ Building a form builder UI (that's separate)
- ❌ Supporting every validation library (focus on Zod)
- ❌ Complex wizard/stepper components (keep simple)
- ❌ Form analytics/tracking (not core functionality)

## Integration Points

### With @atomiton/store

- Form state management through Zustand
- Integration with application state
- Persistence and hydration

### With @atomiton/ui

- Form component styling
- Error display patterns
- Loading states and feedback

### With @atomiton/hooks

- Shared utility hooks
- Event handling patterns
- Performance optimizations

---

**Last Updated**: 2025-09-11
**Next Review**: 2025-09-18