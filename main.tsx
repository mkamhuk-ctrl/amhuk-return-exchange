import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import CustomerPortalStandalone from "./pages/CustomerPortalStandalone";
import { ThemeProvider } from "./lib/theme";
import { ToastProvider } from "./lib/toast";

// ============================================================
// HARD ROUTING SHORT-CIRCUIT
// If the URL points at the Customer Portal, mount a tiny app that
// ONLY contains the standalone portal — no HashRouter, no Layout,
// no Sidebar, no Topbar can possibly render. This works even with
// a stale bundle because the check runs before App.tsx evaluates.
// ============================================================
const hash = window.location.hash || "";
const path = window.location.pathname || "";
const isCustomerPortal =
  hash.includes("customer-portal") ||
  path.includes("customer-portal");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isCustomerPortal ? (
      <ThemeProvider>
        <ToastProvider>
          <CustomerPortalStandalone />
        </ToastProvider>
      </ThemeProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
