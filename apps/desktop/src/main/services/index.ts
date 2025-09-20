import { initializeStorage } from "@/main/services/storage";
import { initializeConductor } from "@/main/services/conductor";

export function initializeServices() {
  const storage = initializeStorage();
  const conductor = initializeConductor(storage);

  return { storage, conductor };
}
