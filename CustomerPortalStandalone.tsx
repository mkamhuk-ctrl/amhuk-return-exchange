import { useEffect } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import Portal from "./Portal";

/**
 * Standalone Customer Portal — opens in its own tab without the admin
 * sidebar/topbar. Reachable via /#/customer-portal
 */
export default function CustomerPortalStandalone() {
  useEffect(() => {
    document.title = "AMHUK Customer Portal";
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <main
        className="relative z-0 w-full opacity-100 visible overflow-visible"
        style={{ minHeight: "100vh" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Portal />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
