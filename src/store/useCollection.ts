import { useEffect, useState } from "react";
import { collection } from "./collection";

export function useCollection() {
  const [glassIds, setGlassIds] = useState(collection.getState().glassIds);

  useEffect(() => {
    return collection.subscribe((s) => setGlassIds(s.glassIds));
  }, []);

  return {
    glassIds,
    add: collection.add,
    remove: collection.remove,
    has: collection.has,
  };
}
