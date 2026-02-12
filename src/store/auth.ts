import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  token: string | null;
};

const STORAGE_KEY = "badierbeer_auth_token";

let state: AuthState = { token: null };
let listeners: Array<(s: AuthState) => void> = [];

function notify() {
  listeners.forEach((l) => l(state));
}

export const auth = {
  getState(): AuthState {
    return state;
  },

  subscribe(listener: (s: AuthState) => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  async loadFromStorage() {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    state = { token };
    notify();
  },

  async login(fakeToken: string) {
    state = { token: fakeToken };
    await AsyncStorage.setItem(STORAGE_KEY, fakeToken);
    notify();
  },

  async logout() {
    state = { token: null };
    await AsyncStorage.removeItem(STORAGE_KEY);
    notify();
  },
};
