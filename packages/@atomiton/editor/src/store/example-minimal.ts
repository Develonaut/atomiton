/**
 * Example of minimal boilerplate store creation
 * This shows how simple it is to create a store with the new architecture
 */

import { core } from "@atomiton/core";

// 1. Define your state shape
interface CounterState {
  count: number;
  history: number[];
}

// 2. Create the store with initial state
const store = core.store.createStore<CounterState>({
  initialState: {
    count: 0,
    history: [],
  },
});

// 3. Export store with actions - one-liners!
export const counterStore = {
  ...store,

  increment: core.store.createAction(store, (state) => {
    state.count++;
    state.history.push(state.count);
  }),

  decrement: core.store.createAction(store, (state) => {
    state.count--;
    state.history.push(state.count);
  }),

  reset: core.store.createAction(store, (state) => {
    state.count = 0;
    state.history = [0];
  }),

  setCount: core.store.createAction(store, (state, value: number) => {
    state.count = value;
    state.history.push(value);
  }),

  // Simple getters
  getCount: () => store.getState().count,
  getHistory: () => store.getState().history,
};

// That's it! Usage in React:
// const [state, setState] = useState(counterStore.getState());
// useEffect(() => counterStore.subscribe(setState), []);
// counterStore.increment();
