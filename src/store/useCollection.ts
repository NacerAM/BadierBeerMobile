import { useCollectionStore } from "./collection";

export function useCollection() {
  const items = useCollectionStore((s) => s.items);
  const loading = useCollectionStore((s) => s.loading);
  const error = useCollectionStore((s) => s.error);

  const refresh = useCollectionStore((s) => s.refresh);
  const has = useCollectionStore((s) => s.has);
  const toggle = useCollectionStore((s) => s.toggle);
  const clear = useCollectionStore((s) => s.clear);

  return { items, loading, error, refresh, has, toggle, clear };
}
