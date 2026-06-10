import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CheckCircle2, RefreshCw, Store, Users, Webhook, Clock } from "lucide-react";
import { PageHeader, Card, SectionTitle, Btn, StatusBadge } from "../components/ui";
import { monthlyData } from "../lib/data";

const webhookLogs = [
  { event: "orders/create", status: "Completed", time: "2 min ago" },
  { event: "orders/updated", status: "Completed", time: "8 min ago" },
  { event: "refunds/create", status: "Completed", time: "15 min ago" },
  { event: "customers/update", status: "Processing", time: "22 min ago" },
  { event: "orders/cancelled", status: "Failed", time: "1 hr ago" },
];

export default function Shopify() {
  return (
    <div>
      <PageHeader title="Shopify Connection" subtitle="Manage your store sync, webhooks and connected analytics." />

      <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-slate-900">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                amhuk-fashion.myshopify.com
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15"><CheckCircle2 className="h-3 w-3" /> Connected</span>
              </p>
              <p className="text-sm text-slate-500">API Status: Healthy · Last sync 2 minutes ago</p>
            </div>
          </div>
          <Btn><RefreshCw className="h-4 w-4" /> Sync Now</Btn>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Store, label: "Orders Synced", value: "12,840", color: "from-blue-500 to-indigo-500" },
          { icon: Users, label: "Customers Synced", value: "8,420", color: "from-violet-500 to-purple-500" },
          { icon: Webhook, label: "Active Webhooks", value: "9", color: "from-emerald-500 to-teal-500" },
          { icon: Clock, label: "Last Sync", value: "2 min", color: "from-amber-500 to-orange-500" },
        ].map((s) => (
          <Card key={s.label}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white`}><s.icon className="h-5 w-5" /></div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Connected Store Analytics" subtitle="Monthly order volume" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="returns" fill="#10b981" radius={[5, 5, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn variant="outline"><RefreshCw className="h-4 w-4" /> Sync Orders</Btn>
            <Btn variant="outline"><Users className="h-4 w-4" /> Sync Customers</Btn>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Webhook Logs" subtitle="Recent events" />
          <div className="space-y-2">
            {webhookLogs.map((w, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div>
                  <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{w.event}</p>
                  <p className="text-[11px] text-slate-400">{w.time}</p>
                </div>
                <StatusBadge status={w.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
