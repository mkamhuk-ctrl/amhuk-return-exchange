import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Area, AreaChart, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  RotateCcw, Repeat2, Truck, CheckCircle2, Wallet, PackageCheck, ShieldCheck, TrendingUp,
  ArrowUpRight, ArrowDownRight, Image as ImgIcon, Store,
} from "lucide-react";
import { Card, SectionTitle, AnimatedNumber } from "../components/ui";
import {
  monthlyData, refundStatus, weeklyTrends, liveStatus, recentActivities,
  returnReasons, productReturns, inr,
} from "../lib/data";

const kpis = [
  { label: "Total Returns", value: 6420, trend: 8.2, up: true, icon: RotateCcw, grad: "from-blue-500 to-indigo-500", spark: [12, 18, 14, 22, 19, 26, 24] },
  { label: "Total Exchanges", value: 4150, trend: 12.4, up: true, icon: Repeat2, grad: "from-violet-500 to-purple-500", spark: [8, 12, 11, 15, 17, 16, 21] },
  { label: "Pending Pickups", value: 73, trend: 3.1, up: false, icon: Truck, grad: "from-amber-500 to-orange-500", spark: [20, 18, 22, 16, 14, 15, 12] },
  { label: "Approved Requests", value: 5290, trend: 6.8, up: true, icon: CheckCircle2, grad: "from-emerald-500 to-teal-500", spark: [10, 14, 13, 18, 20, 22, 25] },
  { label: "Refund Completed", value: 1248, trend: 9.5, up: true, icon: Wallet, grad: "from-cyan-500 to-blue-500", spark: [9, 11, 14, 13, 17, 19, 22] },
  { label: "Exchange Done", value: 3470, trend: 5.2, up: true, icon: PackageCheck, grad: "from-pink-500 to-rose-500", spark: [7, 9, 12, 11, 14, 16, 18] },
  { label: "Delivery Success", value: 96, suffix: "%", trend: 1.4, up: true, icon: ShieldCheck, grad: "from-green-500 to-emerald-500", spark: [88, 90, 91, 93, 94, 95, 96] },
  { label: "Monthly Growth", value: 18, suffix: "%", trend: 4.6, up: true, icon: TrendingUp, grad: "from-indigo-500 to-blue-500", spark: [6, 9, 11, 13, 15, 16, 18] },
];

function Spark({ data, up }: { data: number[]; up: boolean }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d}>
        <defs>
          <linearGradient id={`sp-${up}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={up ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
            <stop offset="100%" stopColor={up ? "#10b981" : "#f43f5e"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={up ? "#10b981" : "#f43f5e"} strokeWidth={2} fill={`url(#sp-${up})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const liveColors: Record<string, string> = {
  amber: "bg-amber-500", blue: "bg-blue-500", violet: "bg-violet-500", green: "bg-emerald-500", red: "bg-rose-500",
};

const activityIcon: Record<string, any> = {
  return: RotateCcw, refund: Wallet, pickup: Truck, exchange: Repeat2, shopify: Store,
};
const activityColor: Record<string, string> = {
  new: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  info: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  error: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
};

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Real-time overview of returns, exchanges & refunds.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="overflow-hidden hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${k.grad} text-white shadow-lg`}>
                  <k.icon className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold ${k.up ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"}`}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.trend}%
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                <AnimatedNumber value={k.value} suffix={k.suffix || ""} />
              </p>
              <p className="text-xs font-medium text-slate-400">{k.label}</p>
              <div className="mt-2 -mx-1"><Spark data={k.spark} up={k.up} /></div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Monthly Returns & Exchanges" subtitle="Returns vs Exchanges comparison" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="returns" fill="#6366f1" radius={[5, 5, 0, 0]} name="Returns" />
              <Bar dataKey="exchanges" fill="#c084fc" radius={[5, 5, 0, 0]} name="Exchanges" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="Refund Status" subtitle="Distribution of refunds" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={refundStatus} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {refundStatus.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {refundStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-500 dark:text-slate-400">{s.name}</span>
                <span className="ml-auto font-semibold text-slate-700 dark:text-slate-200">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weekly + Live status */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Weekly Request Trends" subtitle="Daily request activity" />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Line type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} name="Requests" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="Live Status" subtitle="Real-time pipeline" />
          <div className="space-y-3">
            {liveStatus.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${liveColors[s.color]}`}>
                  <span className={`block h-2.5 w-2.5 animate-ping rounded-full ${liveColors[s.color]} opacity-60`} />
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{s.label}</span>
                <span className="ml-auto text-sm font-bold text-slate-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activities + reasons + product */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Recent Activities" subtitle="Latest events" />
          <div className="space-y-1">
            {recentActivities.map((a) => {
              const Icon = activityIcon[a.type];
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activityColor[a.status]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{a.title}</p>
                    <p className="text-xs text-slate-400">
                      {a.customer} · {a.time}
                      {a.amount ? ` · ${inr(a.amount)}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Top Return Reasons" subtitle="Why customers return" />
          <div className="space-y-3.5">
            {returnReasons.map((r) => (
              <div key={r.reason}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{r.reason}</span>
                  <span className="font-semibold text-slate-500">{r.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${r.value * 2.6}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Return Rate by Product" subtitle="Top products by return %" />
          <div className="space-y-3">
            {productReturns.map((p) => (
              <div key={p.sku} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <ImgIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.sku}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.rate * 3}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: p.color }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{p.rate}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
