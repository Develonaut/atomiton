import type { CompositeNode } from "../CompositeNode";

export function validateCompositeDeep(composite: CompositeNode): {
  valid: boolean;
  errors: Array<{ nodeId: string; errors: string[] }>;
} {
  const errors: Array<{ nodeId: string; errors: string[] }> = [];

  // Validate the composite itself
  const compositeValidation = composite.validate();
  if (!compositeValidation.valid) {
    errors.push({
      nodeId: composite.id,
      errors: compositeValidation.errors,
    });
  }

  // Validate all child nodes
  for (const childNode of composite.getChildNodes()) {
    const childValidation = childNode.validate();
    if (!childValidation.valid) {
      errors.push({
        nodeId: childNode.id,
        errors: childValidation.errors,
      });
    }

    // If child is also composite, validate recursively
    if (childNode.isComposite()) {
      const childComposite = childNode as CompositeNode;
      const deepValidation = validateCompositeDeep(childComposite);
      errors.push(...deepValidation.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
