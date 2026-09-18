"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Tracks a set of selected row/item ids for admin list bulk actions.
 */
export function useSelection() {
  const [selected, setSelected] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const isSelected = useCallback((id: string) => selectedSet.has(id), [selectedSet]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev) =>
      prev.length === ids.length && ids.every((id) => prev.includes(id)) ? [] : ids
    );
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  return { selected, setSelected, isSelected, toggle, toggleAll, clear };
}
