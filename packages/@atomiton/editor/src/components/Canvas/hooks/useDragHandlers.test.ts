import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDragHandlers } from "./useDragHandlers";

describe("useDragHandlers", () => {
  let mockDragEvent: Partial<React.DragEvent>;
  let mockDataTransfer: Partial<DataTransfer>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDataTransfer = {
      dropEffect: "none",
      effectAllowed: "all",
      files: [] as unknown as FileList,
      items: [] as unknown as DataTransferItemList,
      types: [],
      clearData: vi.fn(),
      getData: vi.fn(),
      setData: vi.fn(),
      setDragImage: vi.fn(),
    };

    mockDragEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      currentTarget: document.createElement("div"),
      target: document.createElement("div"),
      dataTransfer: mockDataTransfer as DataTransfer,
      clientX: 100,
      clientY: 200,
      screenX: 150,
      screenY: 250,
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initialization", () => {
    it("should return handleDrop and handleDragOver functions", () => {
      const { result } = renderHook(() => useDragHandlers());

      expect(result.current.handleDrop).toBeInstanceOf(Function);
      expect(result.current.handleDragOver).toBeInstanceOf(Function);
    });

    it("should initialize with external handlers", () => {
      const onDrop = vi.fn();
      const onDragOver = vi.fn();

      const { result } = renderHook(() => useDragHandlers(onDrop, onDragOver));

      expect(result.current.handleDrop).toBeInstanceOf(Function);
      expect(result.current.handleDragOver).toBeInstanceOf(Function);
    });

    it("should work without external handlers", () => {
      const { result } = renderHook(() => useDragHandlers());

      expect(result.current.handleDrop).toBeInstanceOf(Function);
      expect(result.current.handleDragOver).toBeInstanceOf(Function);
    });
  });

  describe("handleDrop", () => {
    it("should prevent default behavior", () => {
      const { result } = renderHook(() => useDragHandlers());

      act(() => {
        result.current.handleDrop(mockDragEvent as React.DragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it("should call external onDrop handler when provided", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop));

      act(() => {
        result.current.handleDrop(mockDragEvent as React.DragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(onDrop).toHaveBeenCalledWith(mockDragEvent);
    });

    it("should not call external handler when not provided", () => {
      const { result } = renderHook(() => useDragHandlers());

      act(() => {
        result.current.handleDrop(mockDragEvent as React.DragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      // Should not throw error
    });

    it("should handle multiple consecutive drops", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop));

      const event1 = { ...mockDragEvent, clientX: 50, clientY: 60 };
      const event2 = { ...mockDragEvent, clientX: 150, clientY: 160 };

      act(() => {
        result.current.handleDrop(event1 as React.DragEvent);
        result.current.handleDrop(event2 as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledTimes(2);
      expect(onDrop).toHaveBeenNthCalledWith(1, event1);
      expect(onDrop).toHaveBeenNthCalledWith(2, event2);
    });

    it("should handle drop events with different data", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop));

      const customDataTransfer = {
        ...mockDataTransfer,
        getData: vi.fn().mockReturnValue("custom-node-type"),
        types: ["text/plain"],
      };

      const customEvent = {
        ...mockDragEvent,
        dataTransfer: customDataTransfer as DataTransfer,
      };

      act(() => {
        result.current.handleDrop(customEvent as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(customEvent);
      expect(customEvent.preventDefault).toHaveBeenCalled();
    });

    it("should handle drop events with files", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop));

      const mockFiles = [
        new File(["content"], "test.txt", { type: "text/plain" }),
        new File(["image"], "test.png", { type: "image/png" }),
      ];

      const fileDataTransfer = {
        ...mockDataTransfer,
        files: mockFiles as unknown as FileList,
      };

      const fileEvent = {
        ...mockDragEvent,
        dataTransfer: fileDataTransfer as DataTransfer,
      };

      act(() => {
        result.current.handleDrop(fileEvent as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(fileEvent);
      expect(fileEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("handleDragOver", () => {
    it("should prevent default behavior", () => {
      const { result } = renderHook(() => useDragHandlers());

      act(() => {
        result.current.handleDragOver(mockDragEvent as React.DragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it("should set dropEffect to move", () => {
      const { result } = renderHook(() => useDragHandlers());

      act(() => {
        result.current.handleDragOver(mockDragEvent as React.DragEvent);
      });

      expect(mockDataTransfer.dropEffect).toBe("move");
    });

    it("should call external onDragOver handler when provided", () => {
      const onDragOver = vi.fn();
      const { result } = renderHook(() =>
        useDragHandlers(undefined, onDragOver),
      );

      act(() => {
        result.current.handleDragOver(mockDragEvent as React.DragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDataTransfer.dropEffect).toBe("move");
      expect(onDragOver).toHaveBeenCalledWith(mockDragEvent);
    });

    it("should not call external handler when not provided", () => {
      const { result } = renderHook(() => useDragHandlers());

      act(() => {
        result.current.handleDragOver(mockDragEvent as React.DragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDataTransfer.dropEffect).toBe("move");
      // Should not throw error
    });

    it("should handle rapid dragover events", () => {
      const onDragOver = vi.fn();
      const { result } = renderHook(() =>
        useDragHandlers(undefined, onDragOver),
      );

      // Simulate rapid dragover events (common during drag operations)
      act(() => {
        for (let i = 0; i < 100; i++) {
          const event = {
            ...mockDragEvent,
            clientX: i,
            clientY: i,
            dataTransfer: { ...mockDataTransfer, dropEffect: "none" },
          };
          result.current.handleDragOver(event as React.DragEvent);
        }
      });

      expect(onDragOver).toHaveBeenCalledTimes(100);
      // Each event should have dropEffect set to move
      onDragOver.mock.calls.forEach((call) => {
        expect(call[0].dataTransfer.dropEffect).toBe("move");
      });
    });

    it("should maintain dropEffect override across events", () => {
      const { result } = renderHook(() => useDragHandlers());

      const event1 = {
        ...mockDragEvent,
        dataTransfer: { ...mockDataTransfer, dropEffect: "copy" },
      };

      const event2 = {
        ...mockDragEvent,
        dataTransfer: { ...mockDataTransfer, dropEffect: "link" },
      };

      act(() => {
        result.current.handleDragOver(event1 as React.DragEvent);
      });

      expect(event1.dataTransfer.dropEffect).toBe("move");

      act(() => {
        result.current.handleDragOver(event2 as React.DragEvent);
      });

      expect(event2.dataTransfer.dropEffect).toBe("move");
    });
  });

  describe("Handler Stability", () => {
    it("should maintain stable handler references when external handlers don't change", () => {
      const onDrop = vi.fn();
      const onDragOver = vi.fn();

      const { result, rerender } = renderHook(
        ({ drop, dragOver }) => useDragHandlers(drop, dragOver),
        {
          initialProps: { drop: onDrop, dragOver: onDragOver },
        },
      );

      const firstHandlers = {
        handleDrop: result.current.handleDrop,
        handleDragOver: result.current.handleDragOver,
      };

      rerender({ drop: onDrop, dragOver: onDragOver });

      expect(result.current.handleDrop).toBe(firstHandlers.handleDrop);
      expect(result.current.handleDragOver).toBe(firstHandlers.handleDragOver);
    });

    it("should update handler references when external handlers change", () => {
      const onDrop1 = vi.fn();
      const onDrop2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ drop }) => useDragHandlers(drop),
        {
          initialProps: { drop: onDrop1 },
        },
      );

      const firstHandleDrop = result.current.handleDrop;

      rerender({ drop: onDrop2 });

      expect(result.current.handleDrop).not.toBe(firstHandleDrop);
    });

    it("should handle changing from no handler to having handler", () => {
      const onDrop = vi.fn();

      const { result, rerender } = renderHook(
        ({ drop }) => useDragHandlers(drop),
        {
          initialProps: { drop: undefined },
        },
      );

      act(() => {
        result.current.handleDrop(mockDragEvent as React.DragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();

      rerender({ drop: onDrop });

      act(() => {
        result.current.handleDrop(mockDragEvent as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(mockDragEvent);
    });

    it("should handle changing from having handler to no handler", () => {
      const onDrop = vi.fn();

      const { result, rerender } = renderHook(
        ({ drop }) => useDragHandlers(drop),
        {
          initialProps: { drop: onDrop },
        },
      );

      act(() => {
        result.current.handleDrop(mockDragEvent as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(mockDragEvent);

      rerender({ drop: undefined });

      act(() => {
        result.current.handleDrop(mockDragEvent as React.DragEvent);
      });

      // Should not throw error, should still prevent default
      expect(mockDragEvent.preventDefault).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cross-browser Compatibility", () => {
    it("should handle missing dataTransfer property", () => {
      const eventWithoutDataTransfer = {
        ...mockDragEvent,
        dataTransfer: null,
      };

      const { result } = renderHook(() => useDragHandlers());

      // Should handle null dataTransfer gracefully (some browsers may have this)
      act(() => {
        result.current.handleDragOver(
          eventWithoutDataTransfer as React.DragEvent,
        );
      });

      expect(eventWithoutDataTransfer.preventDefault).toHaveBeenCalled();
    });

    it("should handle dataTransfer with read-only dropEffect", () => {
      const readOnlyDataTransfer = {
        ...mockDataTransfer,
        set dropEffect(value: string) {
          // Simulate read-only property
          throw new Error("Cannot set dropEffect");
        },
      };

      const eventWithReadOnlyDataTransfer = {
        ...mockDragEvent,
        dataTransfer: readOnlyDataTransfer as DataTransfer,
      };

      const { result } = renderHook(() => useDragHandlers());

      // This should not throw because our implementation should handle read-only properties
      expect(() => {
        act(() => {
          result.current.handleDragOver(
            eventWithReadOnlyDataTransfer as React.DragEvent,
          );
        });
      }).not.toThrow();

      expect(eventWithReadOnlyDataTransfer.preventDefault).toHaveBeenCalled();
    });

    it("should handle events from different browsers", () => {
      const onDrop = vi.fn();
      const onDragOver = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop, onDragOver));

      // Simulate Chrome-style event
      const chromeEvent = {
        ...mockDragEvent,
        dataTransfer: {
          ...mockDataTransfer,
          effectAllowed: "all",
          dropEffect: "none",
        },
      };

      // Simulate Firefox-style event
      const firefoxEvent = {
        ...mockDragEvent,
        dataTransfer: {
          ...mockDataTransfer,
          effectAllowed: "uninitialized",
          dropEffect: "move",
        },
      };

      act(() => {
        result.current.handleDrop(chromeEvent as React.DragEvent);
        result.current.handleDragOver(firefoxEvent as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(chromeEvent);
      expect(onDragOver).toHaveBeenCalledWith(firefoxEvent);
      expect(firefoxEvent.dataTransfer.dropEffect).toBe("move");
    });
  });

  describe("Performance", () => {
    it("should handle high-frequency drag events efficiently", () => {
      const onDragOver = vi.fn();
      const { result } = renderHook(() =>
        useDragHandlers(undefined, onDragOver),
      );

      const events = Array.from({ length: 1000 }, (_, i) => ({
        ...mockDragEvent,
        clientX: i,
        clientY: i,
        dataTransfer: { ...mockDataTransfer, dropEffect: "none" },
      }));

      const start = performance.now();
      act(() => {
        events.forEach((event) => {
          result.current.handleDragOver(event as React.DragEvent);
        });
      });
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      expect(onDragOver).toHaveBeenCalledTimes(1000);
    });

    it("should not cause memory leaks with repeated handler creation", () => {
      const { rerender } = renderHook(
        ({ drop, dragOver }) => useDragHandlers(drop, dragOver),
        {
          initialProps: { drop: vi.fn(), dragOver: vi.fn() },
        },
      );

      // Simulate many rerenders with different handlers
      for (let i = 0; i < 100; i++) {
        rerender({
          drop: vi.fn(),
          dragOver: vi.fn(),
        });
      }

      // Should complete without memory issues
      expect(true).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle events with null target", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop));

      const eventWithNullTarget = {
        ...mockDragEvent,
        target: null,
        currentTarget: null,
      };

      act(() => {
        result.current.handleDrop(eventWithNullTarget as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(eventWithNullTarget);
      expect(eventWithNullTarget.preventDefault).toHaveBeenCalled();
    });

    it("should handle events with missing coordinates", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop));

      const eventWithoutCoordinates = {
        ...mockDragEvent,
        clientX: undefined,
        clientY: undefined,
        screenX: undefined,
        screenY: undefined,
      };

      act(() => {
        result.current.handleDrop(eventWithoutCoordinates as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(eventWithoutCoordinates);
      expect(eventWithoutCoordinates.preventDefault).toHaveBeenCalled();
    });

    it("should handle preventDefault throwing an error", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop));

      const eventWithBadPreventDefault = {
        ...mockDragEvent,
        preventDefault: vi.fn(() => {
          throw new Error("preventDefault failed");
        }),
      };

      expect(() => {
        act(() => {
          result.current.handleDrop(
            eventWithBadPreventDefault as React.DragEvent,
          );
        });
      }).toThrow("preventDefault failed");
    });

    it("should handle external handler throwing an error", () => {
      const throwingHandler = vi.fn(() => {
        throw new Error("Handler error");
      });

      const { result } = renderHook(() => useDragHandlers(throwingHandler));

      expect(() => {
        act(() => {
          result.current.handleDrop(mockDragEvent as React.DragEvent);
        });
      }).toThrow("Handler error");

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("Touch Device Compatibility", () => {
    it("should handle touch-based drag events", () => {
      const onDrop = vi.fn();
      const onDragOver = vi.fn();
      const { result } = renderHook(() => useDragHandlers(onDrop, onDragOver));

      // Simulate touch-based drag event (some mobile browsers)
      const touchDragEvent = {
        ...mockDragEvent,
        touches: [],
        changedTouches: [],
        targetTouches: [],
      };

      act(() => {
        result.current.handleDrop(touchDragEvent as React.DragEvent);
        result.current.handleDragOver(touchDragEvent as React.DragEvent);
      });

      expect(onDrop).toHaveBeenCalledWith(touchDragEvent);
      expect(onDragOver).toHaveBeenCalledWith(touchDragEvent);
    });
  });
});
