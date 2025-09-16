import { describe, it, expect } from 'vitest';

describe('Hooks Package API Smoke Tests', () => {
  it('should export useAtomitonStore hook', async () => {
    const { useAtomitonStore } = await import('../../index');
    expect(useAtomitonStore).toBeDefined();
    expect(typeof useAtomitonStore).toBe('function');
  });

  it('should export useLocalStorage hook', async () => {
    const { useLocalStorage } = await import('../../index');
    expect(useLocalStorage).toBeDefined();
    expect(typeof useLocalStorage).toBe('function');
  });

  it('should export useDebounce hook', async () => {
    const { useDebounce } = await import('../../index');
    expect(useDebounce).toBeDefined();
    expect(typeof useDebounce).toBe('function');
  });

  it('should export core hooks', async () => {
    const hooksModule = await import('../../index');
    expect(Object.keys(hooksModule).length).toBeGreaterThan(0);
  });
});