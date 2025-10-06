import { useState } from "react";

export type CompletionAnimation =
  | "none"
  | "pulse-subtle"
  | "pulse"
  | "pulse-strong";
export type ErrorAnimation = "none" | "pulse-subtle" | "pulse" | "pulse-strong";
export type HandleAnimation = "none" | "pulse" | "ping" | "ripple";

export type AnimationPreferences = {
  completionAnimation: CompletionAnimation;
  errorAnimation: ErrorAnimation;
  handleAnimation: HandleAnimation;
};

const STORAGE_KEY = "atomiton-animation-preferences";

const DEFAULT_PREFERENCES: AnimationPreferences = {
  completionAnimation: "pulse",
  errorAnimation: "pulse",
  handleAnimation: "pulse",
};

/**
 * Hook to manage animation preferences for nodes and handles
 * Preferences are persisted to localStorage
 */
export function useAnimationPreferences() {
  const [preferences, setPreferencesState] = useState<AnimationPreferences>(
    () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
      } catch {
        return DEFAULT_PREFERENCES;
      }
    },
  );

  const setPreferences = (newPreferences: Partial<AnimationPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...newPreferences };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error(
          "[useAnimationPreferences] Failed to save preferences:",
          error,
        );
      }
      return updated;
    });
  };

  return { preferences, setPreferences };
}

/**
 * Get current animation preferences without React state
 * Useful for reading preferences in non-React contexts
 */
export function getAnimationPreferences(): AnimationPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
