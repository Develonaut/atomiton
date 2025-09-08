import { useMemo } from "react";
import core from "@atomiton/core";
import type { NodeCategory } from "@atomiton/core";

export function useAvailableNodes() {
  // Since the API is now synchronous, we can get categories directly
  const nodeCategories = useMemo<NodeCategory[]>(() => {
    try {
      // Simply get the categories from core - it's now synchronous
      return core.nodes.getCategories();
    } catch (err) {
      console.error("Failed to load nodes:", err);
      return [];
    }
  }, []);

  return {
    nodeCategories,
    loading: false, // Always false since it's synchronous
    error: null, // Handle errors internally for now
  };
}
