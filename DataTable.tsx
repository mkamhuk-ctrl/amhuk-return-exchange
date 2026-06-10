import { useMemo, useState, type ReactNode } from "react";
import { Search, Download, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Btn } from "./ui";
import { cn } from "../utils/cn";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters,
  filterKey,
  searchKeys,
  pageSize = 8,
}: {
  data: T[];
  columns: Column<T>[];
  filters?: string[];
  filterKey?: keyof T;
  searchKeys: (keyof T)[];
  pageSize?: number;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchesFilter = filter === "All" || !filterKey || row[filterKey] === filter;
      const matchesSearch =
        !q || searchKeys.some((k) => String(row[k]).toLowerCase().includes(q.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [data, q, filter, filterKey, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  const exportCsv = () => {
    const head = columns.map((c) => c.label).join(",");
    const body = filtered
      .map((r) => columns.map((c) => `"${String(r[c.key as keyof T] ?? "")}"`).join(","))
      .join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "amhuk-export.csv";
    a.click();
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>
        {filters && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="h-4 w-4 shrink-0 text-slate-400" />
            {["All", ...filters].map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        )}
        <Btn variant="outline" onClick={exportCsv} className="shrink-0">
          <Download className="h-4 w-4" /> Export Excel
        </Btn>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {columns.map((c) => (
                <th key={String(c.key)} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 transition hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                {columns.map((c) => (
                  <td key={String(c.key)} className={cn("px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300", c.className)}>
                    {c.render ? c.render(row) : String(row[c.key as keyof T])}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-slate-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4">
        <p className="text-xs text-slate-400">
          Showing {rows.length} of {filtered.length} records
        </p>
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
