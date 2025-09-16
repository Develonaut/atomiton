import { describe, it, expect } from 'vitest';

describe('UI Package API Smoke Tests', () => {
  it('should export Button component', async () => {
    const { Button } = await import('../../index');
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('function');
  });

  it('should export Card component', async () => {
    const { Card } = await import('../../index');
    expect(Card).toBeDefined();
    expect(typeof Card).toBe('function');
  });

  it('should export Input component', async () => {
    const { Input } = await import('../../index');
    expect(Input).toBeDefined();
    expect(typeof Input).toBe('function');
  });

  it('should export Box component', async () => {
    const { Box } = await import('../../index');
    expect(Box).toBeDefined();
    expect(typeof Box).toBe('function');
  });

  it('should export theme utilities', async () => {
    const uiModule = await import('../../index');
    expect(uiModule.theme).toBeDefined();
  });
});