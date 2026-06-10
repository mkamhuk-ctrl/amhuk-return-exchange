import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import { StatusBadge } from "./ui";
import { inr } from "../lib/data";
import { cn } from "../utils/cn";

interface BaseDetails {
  id: string;
  orderId: string;
  customer: string;
  mobile: string;
  product: string;
  sku: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  orderDate: string;
  date: string;
  time: string;
  status: string;
}

export interface ReturnDetails extends BaseDetails {
  kind: "return";
  reason: string;
  pickupStatus: string;
  refundStatus: string;
}

export interface ExchangeDetails extends BaseDetails {
  kind: "exchange";
  currentSize: string;
  newSize: string;
  currentColor: string;
  newColor: string;
  reason: string;
}

export type Details = ReturnDetails | ExchangeDetails;

// Two-column key/value row
function KV({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className={cn("text-right text-sm font-semibold text-slate-800 dark:text-slate-100", valueClass)}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{title}</p>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
    </div>
  );
}

const paymentColor: Record<string, string> = {
  Paid: "text-emerald-600",
  Refunded: "text-blue-600",
  Pending: "text-amber-600",
};

export function DetailsDrawer({ row, onClose }: { row: Details | null; onClose: () => void }) {
  // Lock body scroll & close on escape
  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [row, onClose]);

  return (
    <AnimatePresence>
      {row && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:max-w-[460px]"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-slate-800 dark:from-slate-800 dark:to-slate-800">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {row.kind === "return" ? "Return Request" : "Exchange Request"}
                </p>
                <h2 className="mt-1 truncate text-xl font-bold text-slate-900 dark:text-white">{row.id}</h2>
                <div className="mt-2"><StatusBadge status={row.status} /></div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-white/60 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {/* Order Info */}
              <Section title="Order Information">
                <KV label="Request ID" value={<span className="font-mono">{row.id}</span>} />
                <KV label="Order ID" value={<span className="font-mono text-blue-600 dark:text-blue-400">{row.orderId}</span>} />
                <KV label="Order Date" value={row.orderDate} />
                <KV label="Order Amount" value={<span className="text-emerald-600">{inr(row.amount)}</span>} />
              </Section>

              {/* Customer */}
              <Section title="Customer Details">
                <KV
                  label="Customer Name"
                  value={
                    <div className="flex items-center justify-end gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-[10px] font-bold text-white">
                        {row.customer.split(" ").map((n) => n[0]).join("")}
                      </span>
                      {row.customer}
                    </div>
                  }
                />
                <KV label="Mobile Number" value={<span className="font-mono">{row.mobile}</span>} />
              </Section>

              {/* Product */}
              <Section title="Product Details">
                <KV label="Product Name" value={row.product} />
                <KV label="SKU" value={<span className="font-mono text-xs">{row.sku}</span>} />
              </Section>

              {/* Payment */}
              <Section title="Payment Details">
                <KV
                  label="Payment Status"
                  value={<span className={paymentColor[row.paymentStatus] || "text-slate-600"}>● {row.paymentStatus}</span>}
                />
                <KV label="Payment Method" value={row.paymentMethod} />
              </Section>

              {/* Date & Time */}
              <Section title="Request Date & Time">
                <KV label="Date" value={row.date} />
                <KV label="Time" value={row.time} />
                <KV
                  label="Current Status"
                  value={<StatusBadge status={row.status} />}
                />
              </Section>

              {/* Request Summary */}
              {row.kind === "exchange" ? (
                <Section title="Exchange Summary">
                  <KV
                    label="Size"
                    value={
                      <span className="flex items-center justify-end gap-1.5">
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-700">{row.currentSize}</span>
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{row.newSize}</span>
                      </span>
                    }
                  />
                  <KV
                    label="Color"
                    value={
                      <span className="flex items-center justify-end gap-1.5">
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-700">{row.currentColor}</span>
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{row.newColor}</span>
                      </span>
                    }
                  />
                  <KV label="Reason" value={row.reason} />
                  <KV label="Exchange Status" value={<StatusBadge status={row.status} />} />
                </Section>
              ) : (
                <Section title="Return Summary">
                  <KV label="Return Reason" value={row.reason} />
                  <KV label="Pickup Status" value={<StatusBadge status={row.pickupStatus} />} />
                  <KV label="Refund Status" value={<StatusBadge status={row.refundStatus} />} />
                  <KV label="Refund Amount" value={<span className="text-emerald-600">{inr(row.amount)}</span>} />
                </Section>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-blue-600/40">
                View Full Details <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
