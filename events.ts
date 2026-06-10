// Tiny pub/sub so the Customer Portal can notify the admin pages
// to refetch their data immediately after a new submission.

type Listener = () => void;

const listeners: Record<string, Set<Listener>> = {
  "returns:changed": new Set(),
  "exchanges:changed": new Set(),
};

export function emit(event: "returns:changed" | "exchanges:changed"): void {
  listeners[event]?.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
}

export function subscribe(event: "returns:changed" | "exchanges:changed", fn: Listener): () => void {
  listeners[event]?.add(fn);
  return () => listeners[event]?.delete(fn);
}
