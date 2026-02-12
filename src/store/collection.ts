type CollectionState = {
  glassIds: string[];
};

let state: CollectionState = { glassIds: [] };
let listeners: Array<(s: CollectionState) => void> = [];

function notify() {
  listeners.forEach((l) => l(state));
}

export const collection = {
  getState() {
    return state;
  },

  subscribe(listener: (s: CollectionState) => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  add(glassId: string) {
    if (state.glassIds.includes(glassId)) return;
    state = { glassIds: [...state.glassIds, glassId] };
    notify();
  },

  remove(glassId: string) {
    state = { glassIds: state.glassIds.filter((id) => id !== glassId) };
    notify();
  },

  has(glassId: string) {
    return state.glassIds.includes(glassId);
  },
};
