import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

export interface Col<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function SimpleTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 8,
}: {
  data: T[];
  columns: Col<T>[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const current = Math.min(page, totalPages);
  const rows = data.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-100 bg-slate-50/95 backdrop-blur dark:border-slate-800 dark:bg-slate-800/70">
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 transition hover:bg-slate-50/70 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300", c.className)}>
                    {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-2">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No records found</p>
                    <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800">
        <p className="text-xs text-slate-400">Showing {rows.length} of {data.length} records</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 dark:border-slate-700">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-sm font-medium text-slate-600 dark:text-slate-300">{current} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={current === totalPages} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 dark:border-slate-700">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
