import { create } from "zustand";
import type { StateCreator } from "zustand";
import { addToCollectionApi, listMyCollectionApi, removeFromCollectionApi } from "../api/collectionApi";

export type CollectionRow = {
  id: number;
  userId: number;
  glassId: number;
  createdAt: string;
  Glass: any;
};

export type CollectionState = {
  items: CollectionRow[];
  loading: boolean;
  error: string | null;

  clear: () => void;
  refresh: () => Promise<void>;
  has: (glassId: number) => boolean;
  add: (glassId: number) => Promise<void>;
  remove: (glassId: number) => Promise<void>;
  toggle: (glassId: number) => Promise<void>;
};

const creator: StateCreator<CollectionState> = (set, get) => ({
  items: [],
  loading: false,
  error: null,

  clear: () => set({ items: [], loading: false, error: null }),

  has: (glassId: number) => get().items.some((row: CollectionRow) => row.glassId === glassId),

  refresh: async () => {
    try {
      set({ loading: true, error: null });
      const res = await listMyCollectionApi();
      set({ items: res.items as any, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur de chargement collection";
      set({ loading: false, error: msg });
    }
  },

  add: async (glassId: number) => {
    await addToCollectionApi(glassId);
    await get().refresh();
  },

  remove: async (glassId: number) => {
    await removeFromCollectionApi(glassId);
    await get().refresh();
  },

  toggle: async (glassId: number) => {
    const inCol = get().has(glassId);
    if (inCol) await get().remove(glassId);
    else await get().add(glassId);
  },
});

export const useCollectionStore = create<CollectionState>(creator);
