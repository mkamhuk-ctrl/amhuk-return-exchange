import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ErrorBoundary } from "./ErrorBoundary";
import CustomerPortalStandalone from "../pages/CustomerPortalStandalone";

export function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  // ===== DEFENSIVE BYPASS =====
  // If we somehow ended up here for the customer portal (stale cache, route
  // misorder, or anything else), render the standalone portal WITHOUT the
  // admin sidebar / topbar. This is a belt-and-braces guarantee that the
  // Customer Portal NEVER appears inside the admin shell.
  const isPortal =
    pathname.includes("customer-portal") ||
    hash.includes("customer-portal") ||
    window.location.hash.includes("customer-portal");

  if (isPortal) {
    return <CustomerPortalStandalone />;
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar — unchanged */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Main wrapper — guaranteed visible */}
      <div className="relative z-0 min-h-screen w-full lg:pl-72">
        <Topbar onMenu={() => setOpen(true)} />

        <main
          className="relative z-0 w-full opacity-100 visible overflow-visible"
          style={{ minHeight: "calc(100vh - 64px)" }}
        >
          <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
