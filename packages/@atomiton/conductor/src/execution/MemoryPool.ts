/**
 * Memory pool for reduced allocation overhead
 */
export class MemoryPool {
  private readonly buffers: ArrayBuffer[] = [];
  private readonly size: number;
  private readonly bufferSize: number = 1024 * 1024; // 1MB buffers

  constructor(size: number) {
    this.size = size;
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.size; i++) {
      this.buffers.push(new ArrayBuffer(this.bufferSize));
    }
  }

  acquire(): ArrayBuffer {
    return this.buffers.pop() || new ArrayBuffer(this.bufferSize);
  }

  release(buffer: ArrayBuffer): void {
    if (this.buffers.length < this.size) {
      // Clear buffer before returning to pool
      new Uint8Array(buffer).fill(0);
      this.buffers.push(buffer);
    }
  }

  destroy(): void {
    this.buffers.length = 0;
  }
}
