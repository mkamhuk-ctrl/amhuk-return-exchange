import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  RotateCcw,
  Repeat2,
  Truck,
  Wallet,
  Users,
  Store,
  BarChart3,
  Settings,
  UserCircle,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "../utils/cn";

const mainMenu = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/returns", label: "Return Requests", icon: RotateCcw },
  { to: "/exchanges", label: "Exchange Requests", icon: Repeat2 },
  { to: "/pickups", label: "Pickup Management", icon: Truck },
  { to: "/refunds", label: "Refund Management", icon: Wallet },
];

const platform = [
  { to: "/customer-portal", label: "Customer Portal", icon: Users, external: true },
  { to: "/shopify", label: "Shopify Connection", icon: Store },
  { to: "/analytics", label: "Analytics & Reports", icon: BarChart3 },
];

const account = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

interface NavItemProps {
  to: string;
  label: string;
  icon: any;
  external?: boolean;
  onClose: () => void;
}

function NavItem({ to, label, icon: Icon, external, onClose }: NavItemProps) {
  // External item → pure button click. NO NavLink, NO anchor href, NO router.
  // Always opens in a new tab via window.open using the exact base URL.
  if (external) {
    const handleOpenPortal = () => {
      const base = window.location.origin + window.location.pathname;
      const url = `${base}#${to}`;
      // eslint-disable-next-line no-console
      console.log("[Sidebar] Opening Customer Portal in new tab:", url);
      window.open(url, "_blank", "noopener,noreferrer");
      onClose();
    };

    return (
      <button
        type="button"
        onClick={handleOpenPortal}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all",
          "text-slate-400 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110" />
        <span>{label}</span>
        <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-blue-400" />
      </button>
    );
  }

  return (
    <NavLink to={to} end={to === "/"} onClick={onClose}>
      {({ isActive }) => (
        <div
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110", isActive && "text-white")} />
          <span>{label}</span>
          {isActive && <motion.span layoutId="dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
      )}
    </NavLink>
  );
}

type GroupItem = Omit<NavItemProps, "onClose">;

function Group({ title, items, onClose }: { title: string; items: GroupItem[]; onClose: () => void }) {
  return (
    <div className="mb-5">
      <p className="mb-2 px-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">{title}</p>
      <div className="space-y-1">
        {items.map((it) => (
          <NavItem key={it.to} {...it} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b1120] transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/40">
              <span className="text-lg font-black text-white">A</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">AMHUK Fashion</p>
              <p className="flex items-center gap-1 text-[10px] font-medium text-blue-400">
                <Sparkles className="h-2.5 w-2.5" /> AI Return ERP
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <Group title="Main Menu" items={mainMenu} onClose={onClose} />
          <Group title="Platform" items={platform} onClose={onClose} />
          <Group title="Account" items={account} onClose={onClose} />
        </nav>

        <div className="m-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Sparkles className="h-4 w-4 text-blue-400" /> AI Insights
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            Returns down 12% this week. Size-issue automation saved ₹1.2L.
          </p>
        </div>
      </aside>
    </>
  );
}
