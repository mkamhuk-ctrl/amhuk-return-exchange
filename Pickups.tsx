import { useMemo } from "react";
import { RefreshCw, MapPin, Calendar, Loader2, AlertTriangle, RotateCw } from "lucide-react";
import { PageHeader, StatusBadge, Card, SectionTitle } from "../components/ui";
import { DataTable, type Column } from "../components/DataTable";
import { type PickupRow } from "../lib/data";
import { useSupabaseData } from "../services/useSupabaseData";
import { fetchPickups, updatePickupStatus } from "../services/pickupService";
import { useToast } from "../lib/toast";

const timeline = [
  { label: "Pickup Scheduled", time: "Today, 09:14 AM", done: true },
  { label: "Courier Assigned — Delhivery", time: "Today, 09:30 AM", done: true },
  { label: "Out for Pickup", time: "Today, 11:05 AM", done: true },
  { label: "Picked Up", time: "Pending", done: false },
  { label: "Reached Warehouse", time: "Pending", done: false },
];

export default function Pickups() {
  const toast = useToast();
  const { data, status, error, refetch, setData } = useSupabaseData(fetchPickups, []);
  const rows = data || [];

  const counts = useMemo(() => {
    const c = { Scheduled: 0, "Out for Pickup": 0, "Picked Up": 0, Failed: 0 };
    rows.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status]++;
    });
    return c;
  }, [rows]);

  const handleRetry = async (r: PickupRow) => {
    setData(rows.map((x) => (x.id === r.id ? { ...x, status: "Scheduled" as const, attempts: x.attempts + 1 } : x)));
    try {
      await updatePickupStatus(r.id, "Scheduled");
      toast.success(`Pickup ${r.id} rescheduled.`);
    } catch {
      toast.error("Failed to reschedule pickup.");
    }
  };

  const columns: Column<PickupRow>[] = [
    { key: "id", label: "Pickup ID", render: (r) => <span className="font-semibold text-slate-800 dark:text-white">{r.id}</span> },
    { key: "customer", label: "Customer" },
    {
      key: "address",
      label: "Address",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {r.address}
        </div>
      ),
    },
    { key: "courier", label: "Courier" },
    { key: "awb", label: "AWB", render: (r) => <span className="font-mono text-xs">{r.awb}</span> },
    {
      key: "slot",
      label: "Slot",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {r.slot}
        </div>
      ),
    },
    { key: "attempts", label: "Attempts", render: (r) => <span className="font-semibold">{r.attempts}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Action",
      render: (r) =>
        r.status === "Failed" ? (
          <button
            onClick={() => handleRetry(r)}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200 dark:bg-amber-500/15"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        ) : (
          <button className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:bg-slate-800">
            Track
          </button>
        ),
    },
  ];

  const statsCards = [
    { label: "Pending Pickups", value: counts.Scheduled, color: "text-amber-600" },
    { label: "Out for Pickup", value: counts["Out for Pickup"], color: "text-blue-600" },
    { label: "Failed Pickups", value: counts.Failed, color: "text-rose-600" },
    { label: "Completed Today", value: counts["Picked Up"], color: "text-emerald-600" },
  ];

  return (
    <div>
      <PageHeader title="Pickup Management" subtitle="Schedule pickups, assign couriers, track AWB & retry failures." />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Pickup Timeline" subtitle="Live status for latest pickup" />
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 h-[calc(100%-1.5rem)] w-0.5 bg-slate-200 dark:bg-slate-700" />
            {timeline.map((t) => (
              <div key={t.label} className="relative mb-5 last:mb-0">
                <span className={`absolute -left-[22px] top-0.5 h-3.5 w-3.5 rounded-full border-2 ${t.done ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"}`} />
                <p className={`text-sm font-medium ${t.done ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>{t.label}</p>
                <p className="text-xs text-slate-400">{t.time}</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          {statsCards.map((s) => (
            <Card key={s.label} className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>
                {status === "loading" && !data ? "—" : s.value}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {status === "loading" && !data && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">Loading pickups…</p>
        </div>
      )}

      {status === "error" && !data && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white py-16 dark:border-rose-900/40 dark:bg-slate-900">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Failed to load pickups</p>
          <p className="mt-1 text-xs text-slate-400">{error}</p>
          <button onClick={refetch} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            <RotateCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {data && (
        <DataTable
          data={rows}
          columns={columns}
          filters={["Scheduled", "Out for Pickup", "Picked Up", "Failed"]}
          filterKey="status"
          searchKeys={["id", "customer", "awb", "courier"]}
        />
      )}
    </div>
  );
}
