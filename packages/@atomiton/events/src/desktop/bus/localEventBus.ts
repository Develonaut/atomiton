import { createLocalEventBus } from '#desktop/bus/createDesktopEventBus';
export { createLocalEventBus };

// Re-export the function with alternative name for clarity
export const createNodeEventBus = createLocalEventBus;