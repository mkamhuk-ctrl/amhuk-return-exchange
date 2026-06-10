import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const Ctx = createContext<ToastCtx>({
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

const config: Record<ToastType, { icon: any; ring: string; iconClass: string }> = {
  success: { icon: CheckCircle2, ring: "ring-emerald-200 dark:ring-emerald-500/30", iconClass: "text-emerald-500" },
  error: { icon: XCircle, ring: "ring-rose-200 dark:ring-rose-500/30", iconClass: "text-rose-500" },
  info: { icon: Info, ring: "ring-blue-200 dark:ring-blue-500/30", iconClass: "text-blue-500" },
  warning: { icon: AlertTriangle, ring: "ring-amber-200 dark:ring-amber-500/30", iconClass: "text-amber-500" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, message }]);
      window.setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const value: ToastCtx = {
    show,
    success: (m: string) => show(m, "success"),
    error: (m: string) => show(m, "error"),
    info: (m: string) => show(m, "info"),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:top-6 sm:items-end">
        <AnimatePresence>
          {toasts.map((t) => {
            const c = config[t.type];
            const Icon = c.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-xl ring-1 ${c.ring} dark:border-slate-700 dark:bg-slate-900`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${c.iconClass}`} />
                <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
