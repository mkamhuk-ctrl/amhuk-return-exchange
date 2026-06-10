import { useEffect, useState, useCallback } from "react";

/**
 * Persisted overrides keyed by request ID -> status string.
 * Lets us mutate the row status without touching the source data file
 * and survive page refresh via localStorage.
 */
export function useStatusOverrides(storageKey: string) {
  const [overrides, setOverrides] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(overrides));
    } catch {
      // ignore quota errors
    }
  }, [overrides, storageKey]);

  const setStatus = useCallback((id: string, status: string) => {
    setOverrides((prev) => ({ ...prev, [id]: status }));
  }, []);

  const resolve = useCallback(
    <T extends { id: string; status: string }>(row: T): T => {
      const override = overrides[row.id];
      return override ? ({ ...row, status: override } as T) : row;
    },
    [overrides],
  );

  return { overrides, setStatus, resolve };
}
