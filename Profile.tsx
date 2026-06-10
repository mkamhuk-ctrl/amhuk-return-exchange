import { Mail, Phone, MapPin, Shield, Monitor, Smartphone, LogIn } from "lucide-react";
import { PageHeader, Card, SectionTitle, Btn, StatusBadge } from "../components/ui";

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

const loginHistory = [
  { device: "MacBook Pro · Chrome", location: "Mumbai, India", time: "Today, 09:14 AM", icon: Monitor, status: "Completed" },
  { device: "iPhone 15 · Safari", location: "Mumbai, India", time: "Yesterday, 08:02 PM", icon: Smartphone, status: "Completed" },
  { device: "Windows · Edge", location: "Pune, India", time: "Jan 26, 11:30 AM", icon: Monitor, status: "Completed" },
];

const activityLogs = [
  "Approved return RET-10500",
  "Processed refund ₹2,499 for Diya Sharma",
  "Updated return policy settings",
  "Synced Shopify orders",
  "Rejected exchange EXC-8195",
];

export default function Profile() {
  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account, security & activity." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <img src="https://i.pravatar.cc/160?img=47" alt="" className="h-24 w-24 rounded-2xl object-cover shadow-lg" />
            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">Aanya Kapoor</h3>
            <span className="mt-1 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/15">Administrator</span>
            <div className="mt-4 w-full space-y-2 text-left">
              <p className="flex items-center gap-2 text-sm text-slate-500"><Mail className="h-4 w-4" /> aanya@amhukfashion.in</p>
              <p className="flex items-center gap-2 text-sm text-slate-500"><Phone className="h-4 w-4" /> +91 98765 43210</p>
              <p className="flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" /> Mumbai, India</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <SectionTitle title="Change Password" subtitle="Keep your account secure" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input type="password" placeholder="Current password" className={inputCls} />
              <input type="password" placeholder="New password" className={inputCls} />
              <input type="password" placeholder="Confirm password" className={inputCls} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"><Shield className="h-4 w-4" /> Two-factor authentication enabled</p>
            </div>
            <Btn className="mt-3">Update Password</Btn>
          </Card>

          <Card>
            <SectionTitle title="Login History" subtitle="Recent sign-in activity" />
            <div className="space-y-2">
              {loginHistory.map((l, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800"><l.icon className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{l.device}</p>
                    <p className="text-xs text-slate-400">{l.location} · {l.time}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Activity Logs" subtitle="Your recent actions" />
            <div className="space-y-2">
              {activityLogs.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <LogIn className="h-4 w-4 text-blue-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">{a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
