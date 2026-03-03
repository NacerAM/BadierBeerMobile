import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const STORAGE_KEY_V1 = "badierbeer_auth_v1";
const LEGACY_TOKEN_KEY = "badierbeer_auth_token";

let state: AuthState = { token: null, user: null };
let listeners: Array<(s: AuthState) => void> = [];

function notify() {
  listeners.forEach((l) => l(state));
}

async function save() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_V1, JSON.stringify(state));
  } catch {}
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
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_V1);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        state = { token: parsed.token ?? null, user: parsed.user ?? null };
        notify();
        return;
      }
      // Fallback legacy only-token storage
      const legacyToken = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
      state = { token: legacyToken, user: null };
      notify();
    } catch {
      state = { token: null, user: null };
      notify();
    }
  },

  // Backward compatible: accept a token string OR an object with token+user
  async login(input: string | { token: string; user: AuthUser }) {
    if (typeof input === "string") {
      state = { token: input, user: null };
    } else {
      state = { token: input.token, user: input.user };
    }
    await save();
    // Clean legacy key if we migrated
    try { await AsyncStorage.removeItem(LEGACY_TOKEN_KEY); } catch {}
    notify();
  },

  async logout() {
    state = { token: null, user: null };
    await save();
    try { await AsyncStorage.removeItem(LEGACY_TOKEN_KEY); } catch {}
    notify();
  },
};


