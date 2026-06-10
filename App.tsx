import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { ToastProvider } from "./lib/toast";
import { Layout } from "./components/Layout";
import { pingSupabase } from "./services/supabase";
import Dashboard from "./pages/Dashboard";
import Returns from "./pages/Returns";
import Exchanges from "./pages/Exchanges";
import Pickups from "./pages/Pickups";
import Refunds from "./pages/Refunds";
import CustomerPortalStandalone from "./pages/CustomerPortalStandalone";
import Shopify from "./pages/Shopify";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

export default function App() {
  useEffect(() => {
    // Verify Supabase credentials and table visibility on app load
    pingSupabase();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            {/* ========================================================
                STANDALONE CUSTOMER PORTAL
                Reachable at /#/customer-portal (and aliases).
                Defined BEFORE any layout / catch-all so it wins.
                ======================================================== */}
            <Route path="/customer-portal" element={<CustomerPortalStandalone />} />
            <Route path="/customer-portal/*" element={<CustomerPortalStandalone />} />

            {/* ========================================================
                ADMIN ERP — wrapped in the Layout with sidebar/topbar.
                NOTE: There is intentionally NO /portal route here.
                The Customer Portal is only reachable via the standalone
                /customer-portal route declared above. Any old links to
                /portal redirect to the standalone portal instead.
                ======================================================== */}
            <Route path="/portal" element={<Navigate to="/customer-portal" replace />} />

            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/exchanges" element={<Exchanges />} />
              <Route path="/pickups" element={<Pickups />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/shopify" element={<Shopify />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Final catch-all redirects UNKNOWN routes to dashboard.
                It is OUTSIDE the Layout group so it cannot accidentally
                match more specific routes above (e.g. /customer-portal). */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
