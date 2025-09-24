import { initializeStorage } from "@/main/services/storage";
import { initializeConductor } from "@/main/services/conductor";

export function initializeServices(): {
  storage: ReturnType<typeof initializeStorage>;
  conductor: ReturnType<typeof initializeConductor>;
} {
  const storage = initializeStorage();
  const conductor = initializeConductor(storage);

  return { storage, conductor };
}
