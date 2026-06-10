import { useState } from "react";
import { Building2, Upload, FileText, Repeat2, Bell, Mail, Users } from "lucide-react";
import { PageHeader, Card, SectionTitle, Btn } from "../components/ui";
import { cn } from "../utils/cn";

const tabs = [
  { id: "branding", label: "Company Branding", icon: Building2 },
  { id: "policy", label: "Return Policy", icon: FileText },
  { id: "exchange", label: "Exchange Rules", icon: Repeat2 },
  { id: "notif", label: "Notifications", icon: Bell },
  { id: "email", label: "Email Templates", icon: Mail },
  { id: "roles", label: "Roles & Permissions", icon: Users },
];

function Toggle({ label, on = false }: { label: string; on?: boolean }) {
  const [v, setV] = useState(on);
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <button onClick={() => setV(!v)} className={cn("relative h-6 w-11 rounded-full transition", v ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition", v ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

export default function Settings() {
  const [tab, setTab] = useState("branding");
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure branding, policies, notifications & user roles." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="h-fit lg:col-span-1">
          <div className="space-y-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                tab === t.id ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
              )}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          {tab === "branding" && (
            <div className="space-y-5">
              <SectionTitle title="Company Branding" subtitle="Your brand identity across the ERP & portal" />
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-black text-white">A</div>
                <Btn variant="outline"><Upload className="h-4 w-4" /> Upload Logo</Btn>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-500">Brand Name</label><input className={inputCls} defaultValue="AMHUK Fashion" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-500">Support Email</label><input className={inputCls} defaultValue="care@amhukfashion.in" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-500">Brand Color</label><input type="color" className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700" defaultValue="#2563eb" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-500">Currency</label><input className={inputCls} defaultValue="₹ INR" /></div>
              </div>
              <Btn>Save Changes</Btn>
            </div>
          )}
          {tab === "policy" && (
            <div className="space-y-5">
              <SectionTitle title="Return Policy" subtitle="Define window & eligibility" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-500">Return Window (days)</label><input className={inputCls} defaultValue="15" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-500">Restocking Fee (%)</label><input className={inputCls} defaultValue="0" /></div>
              </div>
              <textarea rows={4} className={inputCls} defaultValue="Items must be unworn, unwashed with original tags. Final sale items are not eligible for return." />
              <Toggle label="Allow returns on discounted items" on />
              <Toggle label="Require product images for damage claims" on />
              <Btn>Save Policy</Btn>
            </div>
          )}
          {tab === "exchange" && (
            <div className="space-y-4">
              <SectionTitle title="Exchange Rules" subtitle="Configure size & color swap rules" />
              <Toggle label="Allow size exchanges" on />
              <Toggle label="Allow color exchanges" on />
              <Toggle label="Allow cross-product exchanges" />
              <Toggle label="Auto-approve exchanges below ₹2,000" on />
              <Btn>Save Rules</Btn>
            </div>
          )}
          {tab === "notif" && (
            <div className="space-y-4">
              <SectionTitle title="Notification Settings" subtitle="Channels & alerts" />
              <Toggle label="Email notifications" on />
              <Toggle label="SMS / WhatsApp alerts" on />
              <Toggle label="Failed pickup alerts" on />
              <Toggle label="Daily summary report" />
              <Btn>Save Preferences</Btn>
            </div>
          )}
          {tab === "email" && (
            <div className="space-y-4">
              <SectionTitle title="Email Templates" subtitle="Customize customer emails" />
              {["Return Approved", "Refund Processed", "Pickup Scheduled", "Exchange Shipped"].map((t) => (
                <div key={t} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t}</span>
                  <Btn variant="outline">Edit</Btn>
                </div>
              ))}
            </div>
          )}
          {tab === "roles" && (
            <div className="space-y-4">
              <SectionTitle title="User Roles & Permissions" subtitle="Team access control" />
              {[
                ["Aanya Kapoor", "Admin", "Full access"],
                ["Rohan Das", "Manager", "Returns, Refunds"],
                ["Sneha Pillai", "Support", "Read-only"],
              ].map(([name, role, perm]) => (
                <div key={name} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white">{name.split(" ").map((n) => n[0]).join("")}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{name}</p>
                      <p className="text-xs text-slate-400">{perm}</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15">{role}</span>
                </div>
              ))}
              <Btn>Invite User</Btn>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
