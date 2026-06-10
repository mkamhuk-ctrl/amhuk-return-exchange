import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Generic async data hook with caching, manual refetch and error capture.
 * Keeps previous data visible while refetching to avoid blank screens.
 */
export function useSupabaseData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setStatus((s) => (s === "success" ? "success" : "loading"));
    setError(null);
    try {
      const result = await fetcher();
      if (!mounted.current) return;
      setData(result);
      setStatus("success");
    } catch (e) {
      if (!mounted.current) return;
      const msg = e instanceof Error ? e.message : "Failed to load data";
      setError(msg);
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, status, error, refetch: load, setData } as const;
}
