import { useEffect, useMemo, useState } from "react";
import { Check, X, Eye, Loader2, AlertTriangle, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { FilterBar } from "../components/FilterBar";
import { SimpleTable, type Col } from "../components/SimpleTable";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { type ReturnRow } from "../lib/data";
import { useToast } from "../lib/toast";
import { useSupabaseData } from "../services/useSupabaseData";
import { fetchReturnRequests, updateReturnStatus } from "../services/returnService";
import { subscribe } from "../services/events";
import { cn } from "../utils/cn";

const searchFields = [
  { value: "orderId", label: "Order ID" },
  { value: "id", label: "Return ID" },
  { value: "customer", label: "Customer" },
  { value: "product", label: "Product" },
];

const statusOptions = ["Pending", "Approved", "Rejected", "Pickup Scheduled", "Refund Completed"];

const stats = [
  { key: "Pending", label: "Pending", color: "text-amber-600", dark: "dark:text-amber-400" },
  { key: "Approved", label: "Approved", color: "text-blue-600", dark: "dark:text-blue-400" },
  { key: "Rejected", label: "Rejected", color: "text-rose-600", dark: "dark:text-rose-400" },
  { key: "Pickup Scheduled", label: "Pickup Scheduled", color: "text-violet-600", dark: "dark:text-violet-400" },
  { key: "Refund Completed", label: "Refund Completed", color: "text-emerald-600", dark: "dark:text-emerald-400" },
];

export default function Returns() {
  const toast = useToast();
  const { data, status, error, refetch, setData } = useSupabaseData(fetchReturnRequests, []);

  const [searchField, setSearchField] = useState("orderId");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<ReturnRow | null>(null);

  const rows = data || [];

  // Refetch whenever a new return is submitted from the Customer Portal
  useEffect(() => subscribe("returns:changed", () => { refetch(); }), [refetch]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    stats.forEach((s) => (c[s.key] = 0));
    rows.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status]++;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      const matchesSearch =
        !query || String(r[searchField as keyof ReturnRow]).toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchField, query, statusFilter, from, to]);

  const updateRowStatus = (id: string, newStatus: string) => {
    setData(rows.map((r) => (r.id === id ? { ...r, status: newStatus as ReturnRow["status"] } : r)));
  };

  const handleApprove = async (r: ReturnRow) => {
    updateRowStatus(r.id, "Approved");
    if (selected?.id === r.id) setSelected({ ...selected, status: "Approved" });
    try {
      await updateReturnStatus(r.id, "Approved");
      toast.success("Request approved successfully.");
    } catch (e) {
      toast.error("Failed to update status. Please try again.");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleReject = async (r: ReturnRow) => {
    updateRowStatus(r.id, "Rejected");
    if (selected?.id === r.id) setSelected({ ...selected, status: "Rejected" });
    try {
      await updateReturnStatus(r.id, "Rejected");
      toast.error("Request rejected successfully.");
    } catch (e) {
      toast.error("Failed to update status. Please try again.");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const columns: Col<ReturnRow>[] = [
    {
      key: "id",
      label: "Return ID",
      render: (r) => (
        <button
          onClick={() => setSelected(r)}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
        >
          {r.id}
        </button>
      ),
    },
    {
      key: "orderId",
      label: "Order ID",
      render: (r) => (
        <button
          onClick={() => setSelected(r)}
          className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
        >
          {r.orderId}
        </button>
      ),
    },
    {
      key: "customer",
      label: "Customer / Contact",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-[11px] font-bold text-white">
            {r.customer.split(" ").map((n) => n[0]).join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-800 dark:text-white">{r.customer}</p>
            <p className="text-xs text-slate-400">{r.mobile}</p>
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Products",
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800 dark:text-slate-200">{r.product}</p>
          <p className="mt-0.5 text-xs text-slate-400">SKU: {r.sku}</p>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date / Time",
      render: (r) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{r.date}</p>
          <p className="mt-0.5 text-xs text-slate-400">{r.time}</p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelected(r)}
            title="View Details"
            className="rounded-lg bg-blue-100 p-1.5 text-blue-600 transition hover:bg-blue-200 active:scale-95 dark:bg-blue-500/15 dark:text-blue-400"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleApprove(r)}
            disabled={r.status === "Approved"}
            title={r.status === "Approved" ? "Already approved" : "Approve"}
            className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600 transition hover:bg-emerald-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500/15 dark:text-emerald-400"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleReject(r)}
            disabled={r.status === "Rejected"}
            title={r.status === "Rejected" ? "Already rejected" : "Reject"}
            className="rounded-lg bg-rose-100 p-1.5 text-rose-600 transition hover:bg-rose-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-500/15 dark:text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const onExport = () => {
    const head = ["Return ID", "Order ID", "Customer", "Mobile", "Product", "SKU", "Date", "Time"].join(",");
    const body = filtered
      .map((r) => `"${r.id}","${r.orderId}","${r.customer}","${r.mobile}","${r.product}","${r.sku}","${r.date}","${r.time}"`)
      .join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "return-requests.csv";
    a.click();
  };

  return (
    <div>
      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setStatusFilter(statusFilter === s.key ? "All" : s.key)}
            className={cn(
              "cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900",
              statusFilter === s.key
                ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/40"
                : "border-slate-200/70 dark:border-slate-800",
            )}
          >
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {status === "loading" && !data ? "—" : counts[s.key]}
            </p>
            <p className={cn("mt-1 text-sm font-semibold", s.color, s.dark)}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <FilterBar
        searchField={searchField}
        setSearchField={setSearchField}
        searchFields={searchFields}
        query={query}
        setQuery={setQuery}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        status={statusFilter}
        setStatus={setStatusFilter}
        statusOptions={statusOptions}
        onExport={onExport}
      />

      {/* Body: loading / error / data */}
      {status === "loading" && !data && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">Loading return requests…</p>
        </div>
      )}

      {status === "error" && !data && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white py-16 dark:border-rose-900/40 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Failed to load data</p>
          <p className="mt-1 text-xs text-slate-400">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <RotateCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {data && <SimpleTable data={filtered} columns={columns} />}

      {/* Details Drawer */}
      <DetailsDrawer
        row={
          selected
            ? {
                kind: "return",
                id: selected.id,
                orderId: selected.orderId,
                customer: selected.customer,
                mobile: selected.mobile,
                product: selected.product,
                sku: selected.sku,
                status: selected.status,
                date: selected.date,
                time: selected.time,
                reason: selected.reason,
                amount: selected.amount,
                paymentStatus: selected.paymentStatus,
                paymentMethod: selected.paymentMethod,
                orderDate: selected.orderDate,
                pickupStatus: selected.pickupStatus,
                refundStatus: selected.refundStatus,
              }
            : null
        }
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
