import { store as storeAPI } from "@atomiton/store";
import { useEffect, useRef, useState } from "react";
import { editorStore } from "../store";
import type { EditorState } from "../store/types";

/**
 * Hook to reactively subscribe to store state changes with equality checking
 */
export function useStore<T>(
  selector: (state: EditorState) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is,
): T {
  const [state, setState] = useState(() => selector(editorStore.getState()));
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);

  // Update refs to avoid stale closures
  selectorRef.current = selector;
  equalityFnRef.current = equalityFn;

  useEffect(() => {
    const checkForUpdates = () => {
      const nextState = selectorRef.current(editorStore.getState());
      setState((prevState) => {
        if (equalityFnRef.current(prevState, nextState)) {
          return prevState;
        }
        return nextState;
      });
    };

    // Check for initial updates
    checkForUpdates();

    // Subscribe to store changes
    const unsubscribe = editorStore.subscribe(checkForUpdates);
    return unsubscribe;
  }, []);

  return state;
}

export const shallow = storeAPI.shallow;
