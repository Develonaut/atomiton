import { initializeStorage } from "#main/services/storage";

export function initializeServices(): {
  storage: ReturnType<typeof initializeStorage>;
} {
  const storage = initializeStorage();

  return { storage };
}
