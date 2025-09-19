import { initializeStorage } from "./storage";
import { initializeConductor } from "./conductor";

export function initializeServices() {
  const storage = initializeStorage();
  const conductor = initializeConductor(storage);

  return { storage, conductor };
}
