import { describe, it, expect } from 'vitest';
import { loadTemplate } from './loader.js';

describe('loadTemplate', () => {
  it('should load and validate a valid template', async () => {
    const yaml = `
id: "test-template"
name: "Test Template"
type: "composite"
description: "A test template"
category: "test"
version: "1.0.0"
metadata:
  author: "Test Author"
  source: "system"
  variant: "composite"
  icon: "layers"
  experimental: false
  deprecated: false
nodes:
  - id: "node1"
    name: "Node 1"
    type: "atomic"
edges:
  - id: "edge1"
    source: "node1"
    target: "node1"
`;

    const template = await loadTemplate(yaml);

    expect(template.id).toBe('test-template');
    expect(template.name).toBe('Test Template');
    expect(template.type).toBe('composite');
    expect(template.children).toHaveLength(1);
    expect(template.edges).toHaveLength(1);
  });

  it('should throw error for template without id', async () => {
    const yaml = `
name: "Test Template"
type: "composite"
`;

    await expect(loadTemplate(yaml)).rejects.toThrow('YAML must contain id and name fields');
  });

  it('should throw error for template without name', async () => {
    const yaml = `
id: "test-template"
type: "composite"
`;

    await expect(loadTemplate(yaml)).rejects.toThrow('YAML must contain id and name fields');
  });

  it('should throw error for non-composite template', async () => {
    const yaml = `
id: "test-template"
name: "Test Template"
type: "atomic"
`;

    await expect(loadTemplate(yaml)).rejects.toThrow('Templates must have children (composite type)');
  });

  it('should throw error for invalid edge references', async () => {
    const yaml = `
id: "test-template"
name: "Test Template"
type: "composite"
metadata:
  author: "Test Author"
nodes:
  - id: "node1"
    name: "Node 1"
edges:
  - id: "edge1"
    source: "node1"
    target: "nonexistent"
`;

    await expect(loadTemplate(yaml)).rejects.toThrow('Edge references unknown target node: nonexistent');
  });
});