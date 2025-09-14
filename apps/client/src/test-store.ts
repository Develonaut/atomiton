/**
 * Test file to verify Redux DevTools integration
 * This creates a simple store to test if it appears in DevTools
 */

import { store } from "@atomiton/store";

// Create a test store with a descriptive name for DevTools
const testStore = store.createStore({
  name: "TestStore", // This name will appear in Redux DevTools
  initialState: {
    count: 0,
    message: "Redux DevTools Test",
    timestamp: Date.now(),
  },
});

// Add some actions
const increment = store.createAction(testStore, (state) => {
  state.count++;
});

const decrement = store.createAction(testStore, (state) => {
  state.count--;
});

const setMessage = store.createAction(testStore, (state, message: string) => {
  state.message = message;
  state.timestamp = Date.now();
});

// Export for use in the app
export { testStore, increment, decrement, setMessage };

// Log to console for debugging
console.log("Test store created:", testStore.getState());

// Perform some actions to generate DevTools events
setTimeout(() => {
  console.log("Incrementing count...");
  increment();
}, 1000);

setTimeout(() => {
  console.log("Setting message...");
  setMessage("DevTools should show this action!");
}, 2000);

setTimeout(() => {
  console.log("Decrementing count...");
  decrement();
}, 3000);
