import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Search, Sun, Moon, Bell, ChevronDown, Plus, Zap } from "lucide-react";
import { useTheme } from "../lib/theme";
import { motion, AnimatePresence } from "framer-motion";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/returns": "Return Requests",
  "/exchanges": "Exchange Requests",
  "/pickups": "Pickup Management",
  "/refunds": "Refund Management",

  "/shopify": "Shopify Connection",
  "/analytics": "Analytics & Reports",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggle } = useTheme();
  const [qa, setQa] = useState(false);
  const [notif, setNotif] = useState(false);
  const { pathname } = useLocation();
  const title = titles[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button onClick={onMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">{title}</h1>
          <p className="hidden truncate text-xs text-slate-400 sm:block">Welcome back, Admin Kumar</p>
        </div>

        <div className="relative ml-auto hidden flex-1 max-w-md md:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search orders, customers…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900 dark:focus:ring-blue-900/40"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <div className="relative">
            <button
              onClick={() => { setQa(!qa); setNotif(false); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {qa && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  {["New Return Request", "New Exchange", "Schedule Pickup", "Process Refund", "Sync Shopify"].map((a) => (
                    <button key={a} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                      <Zap className="h-3.5 w-3.5 text-blue-500" /> {a}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={toggle} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </button>

          <div className="relative">
            <button
              onClick={() => { setNotif(!notif); setQa(false); }}
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow">3</span>
            </button>
            <AnimatePresence>
              {notif && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-white">Notifications</p>
                  {[
                    ["New return from Aarav Mehta", "2 min ago"],
                    ["Refund ₹2,499 completed", "14 min ago"],
                    ["Pickup failed for PCK-5392", "1 hr ago"],
                  ].map(([t, time]) => (
                    <div key={t} className="border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{t}</p>
                      <p className="text-xs text-slate-400">{time}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/30">
            AK
          </button>
        </div>
      </div>
    </header>
  );
}
