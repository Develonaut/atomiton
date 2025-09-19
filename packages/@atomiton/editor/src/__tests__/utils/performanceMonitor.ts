/**
 * Performance monitoring utilities for the editor.
 * Use these during development to track and optimize performance.
 */

export type PerformanceMetrics = {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  peakRenderTime: number;
  nodeCount: number;
  edgeCount: number;
  selectedNodeCount: number;
  memoryUsage?: number;
  fps: number;
};

class EditorPerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    peakRenderTime: 0,
    nodeCount: 0,
    edgeCount: 0,
    selectedNodeCount: 0,
    fps: 60,
  };

  private renderTimes: number[] = [];
  private fpsFrames: number[] = [];
  private lastFrameTime = performance.now();
  private isMonitoring = false;

  /**
   * Start monitoring performance
   */
  start(): void {
    this.isMonitoring = true;
    this.monitorFPS();
    this.logMetrics();
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * Track a render cycle
   */
  trackRender(duration: number): void {
    if (!this.isMonitoring) return;

    this.metrics.renderCount++;
    this.metrics.lastRenderTime = duration;
    this.renderTimes.push(duration);

    // Keep only last 100 render times for average calculation
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }

    this.metrics.averageRenderTime =
      this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;

    this.metrics.peakRenderTime = Math.max(
      this.metrics.peakRenderTime,
      duration,
    );

    // Warn if render took too long
    if (duration > 16.67) {
      console.warn(
        `⚠️ Slow render detected: ${duration.toFixed(2)}ms (target: 16.67ms for 60fps)`,
      );
    }
  }

  /**
   * Update node and edge counts
   */
  updateCounts(
    nodeCount: number,
    edgeCount: number,
    selectedNodeCount: number,
  ): void {
    this.metrics.nodeCount = nodeCount;
    this.metrics.edgeCount = edgeCount;
    this.metrics.selectedNodeCount = selectedNodeCount;
  }

  /**
   * Monitor FPS
   */
  private monitorFPS(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    this.fpsFrames.push(1000 / deltaTime);

    // Keep only last 60 frames for FPS calculation
    if (this.fpsFrames.length > 60) {
      this.fpsFrames.shift();
    }

    this.metrics.fps = Math.round(
      this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length,
    );

    // Update memory usage if available
    const perfWithMemory = performance as {
      memory?: { usedJSHeapSize: number };
    };
    if (perfWithMemory.memory) {
      this.metrics.memoryUsage = perfWithMemory.memory.usedJSHeapSize;
    }

    requestAnimationFrame(() => this.monitorFPS());
  }

  /**
   * Log metrics to console
   */
  private logMetrics(): void {
    if (!this.isMonitoring) return;

    const metrics = this.getMetrics();
    const memoryMB = metrics.memoryUsage
      ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`
      : "N/A";

    console.log(
      `📊 Editor Performance:
      FPS: ${metrics.fps}
      Nodes: ${metrics.nodeCount} | Edges: ${metrics.edgeCount} | Selected: ${metrics.selectedNodeCount}
      Avg Render: ${metrics.averageRenderTime.toFixed(2)}ms | Peak: ${metrics.peakRenderTime.toFixed(2)}ms
      Memory: ${memoryMB}
      Total Renders: ${metrics.renderCount}`,
    );

    // Log again in 5 seconds
    setTimeout(() => this.logMetrics(), 5000);
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      peakRenderTime: 0,
      nodeCount: 0,
      edgeCount: 0,
      selectedNodeCount: 0,
      fps: 60,
    };
    this.renderTimes = [];
    this.fpsFrames = [];
  }
}

// Singleton instance
export const performanceMonitor = new EditorPerformanceMonitor();

/**
 * React hook to use performance monitoring
 */
export function usePerformanceMonitor() {
  return performanceMonitor;
}

/**
 * Performance tracking helper for components
 * Use this to track render performance of specific components
 */
export function trackComponentRender(
  componentName: string,
  renderCallback: () => void,
): void {
  const renderStart = performance.now();

  // Execute the render
  renderCallback();

  // Track render time after paint
  requestAnimationFrame(() => {
    const renderTime = performance.now() - renderStart;
    performanceMonitor.trackRender(renderTime);

    if (renderTime > 16.67) {
      console.warn(
        `⚠️ ${componentName} slow render: ${renderTime.toFixed(2)}ms`,
      );
    }
  });
}

/**
 * Performance thresholds for different graph sizes
 */
export const PERFORMANCE_THRESHOLDS = {
  small: {
    // < 100 nodes
    nodeCount: 100,
    targetRenderTime: 5,
    targetFPS: 60,
  },
  medium: {
    // 100-1000 nodes
    nodeCount: 1000,
    targetRenderTime: 16.67,
    targetFPS: 60,
  },
  large: {
    // 1000-5000 nodes
    nodeCount: 5000,
    targetRenderTime: 33.33,
    targetFPS: 30,
  },
  xlarge: {
    // 5000+ nodes
    nodeCount: Infinity,
    targetRenderTime: 50,
    targetFPS: 20,
  },
};

/**
 * Get performance threshold based on node count
 */
export function getPerformanceThreshold(nodeCount: number) {
  if (nodeCount < PERFORMANCE_THRESHOLDS.small.nodeCount) {
    return PERFORMANCE_THRESHOLDS.small;
  } else if (nodeCount < PERFORMANCE_THRESHOLDS.medium.nodeCount) {
    return PERFORMANCE_THRESHOLDS.medium;
  } else if (nodeCount < PERFORMANCE_THRESHOLDS.large.nodeCount) {
    return PERFORMANCE_THRESHOLDS.large;
  } else {
    return PERFORMANCE_THRESHOLDS.xlarge;
  }
}
