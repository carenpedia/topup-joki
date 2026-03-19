// app/lib/loading.ts
type Listener = () => void;

type State = {
  activeCount: number; // support parallel requests
  version: number; // trigger update
};

const state: State = {
  activeCount: 0,
  version: 0,
};

const listeners = new Set<Listener>();

function emit() {
  state.version++;
  for (const l of listeners) l();
}

export const loading = {
  start() {
    state.activeCount++;
    emit();
  },
  stop() {
    state.activeCount = Math.max(0, state.activeCount - 1);
    emit();
  },
  getSnapshot() {
    return state;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};