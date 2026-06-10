import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { FileText, FileSpreadsheet, TrendingUp, RotateCcw, Repeat2, Truck } from "lucide-react";
import { PageHeader, Card, SectionTitle, Btn } from "../components/ui";
import { monthlyData, courierPerf, inr } from "../lib/data";

const revenueImpact = monthlyData.map((m) => ({
  month: m.month, lost: m.returns * 620, recovered: m.exchanges * 740,
}));

const gauges = [
  { name: "Return %", value: 14, fill: "#6366f1" },
  { name: "Exchange Success", value: 92, fill: "#10b981" },
  { name: "Refund Rate", value: 78, fill: "#3b82f6" },
];

export default function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics & Reports" subtitle="Advanced insights into returns, revenue impact & courier performance." />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: TrendingUp, label: "Revenue Impact", value: inr(2840000), color: "from-blue-500 to-indigo-500" },
            { icon: RotateCcw, label: "Return %", value: "14.2%", color: "from-violet-500 to-purple-500" },
            { icon: Repeat2, label: "Exchange Success", value: "92%", color: "from-emerald-500 to-teal-500" },
            { icon: Truck, label: "Courier Score", value: "94/100", color: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <Card key={s.label}>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white`}><s.icon className="h-5 w-5" /></div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Btn><FileText className="h-4 w-4" /> Download PDF</Btn>
        <Btn variant="outline"><FileSpreadsheet className="h-4 w-4" /> Export Excel</Btn>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Revenue Impact" subtitle="Revenue lost vs recovered (₹)" />
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueImpact}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => inr(Number(v))} />
              <Bar dataKey="lost" fill="#fca5a5" radius={[5, 5, 0, 0]} name="Lost" />
              <Line type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={3} name="Recovered" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="Key Rates" subtitle="Performance gauges" />
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="30%" outerRadius="100%" data={gauges} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {gauges.map((g) => (
              <div key={g.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.fill }} />
                <span className="text-slate-500">{g.name}</span>
                <span className="ml-auto font-bold text-slate-700 dark:text-slate-200">{g.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <SectionTitle title="Courier Performance" subtitle="Success rate & total pickups by partner" />
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={courierPerf}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-20" />
            <XAxis dataKey="courier" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Bar dataKey="pickups" fill="#c7d2fe" radius={[5, 5, 0, 0]} name="Pickups" />
            <Line type="monotone" dataKey="success" stroke="#6366f1" strokeWidth={3} name="Success %" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
