import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title = "No data found",
  message = "There are no records to display yet.",
  icon,
}: {
  title?: string;
  message?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-400">{message}</p>
    </div>
  );
}
