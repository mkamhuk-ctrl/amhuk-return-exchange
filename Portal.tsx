import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ShieldCheck,
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  RotateCcw,
  Repeat2,
  ShieldAlert,
  Mail,
  MessageCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { RequestFormStep } from "../components/RequestFormStep";
import { cn } from "../utils/cn";
import { useToast } from "../lib/toast";

const steps = [
  { num: 1, label: "Verify" },
  { num: 2, label: "Choose" },
  { num: 3, label: "Details" },
  { num: 4, label: "Done" },
];

const features = [
  {
    icon: Calendar,
    title: "7-Day Window",
    desc: "From delivery date",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: ShieldCheck,
    title: "100% Safe",
    desc: "Quality assured pickup",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Wallet,
    title: "Quick Refund",
    desc: "To original payment",
    color: "from-blue-400 to-indigo-500",
  },
];

interface VerifiedOrder {
  orderId: string;
  customer: string;
  email: string;
  phone: string;
  product: string;
  sku: string;
  variant: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  orderDate: string;
}

// Mock order-lookup: deterministically derives sample order details from the entered orderId.
// In production this would call Shopify / your OMS — the shape stays the same.
function fakeOrderLookup(orderId: string, contact: string): VerifiedOrder {
  const names = ["Aarav Mehta", "Diya Sharma", "Kabir Singh", "Anaya Reddy", "Ishaan Patel"];
  const products = ["Premium Men's Lycra Denim", "ASHTOM Cotton Kurti - Floral Print", "Slim Fit Black Tee", "Linen Blazer"];
  const skus = ["J08AKLBLUE32", "K04AKFLORAL-M", "T11AKBLACK-L", "B22AKBEIGE-XL"];
  const variants = ["Size M / Blue", "Size L / Floral", "Size XL / Black", "Size 32 / Beige"];
  const hash = Array.from(orderId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    orderId,
    customer: names[hash % names.length],
    email: contact.includes("@") ? contact : "customer@amhuk.in",
    phone: contact.includes("@") ? "+91 98765 43210" : contact,
    product: products[hash % products.length],
    sku: skus[hash % skus.length],
    variant: variants[hash % variants.length],
    paymentStatus: "Paid",
    fulfillmentStatus: "Delivered",
    orderDate: new Date(Date.now() - (3 + (hash % 5)) * 86400000).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }),
  };
}

export default function Portal() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"return" | "exchange">("return");
  const [modeChosen, setModeChosen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("85458");
  const [contact, setContact] = useState("");
  const [verified, setVerified] = useState<VerifiedOrder | null>(null);
  const toast = useToast();

  const goToVerifiedStep = () => {
    if (!orderId.trim()) { toast.error("Please enter your Order ID."); return; }
    setVerified(fakeOrderLookup(orderId.trim(), contact.trim() || "customer@amhuk.in"));
    setStep(1);
  };

  const next = () => {
    if (step === 0) { goToVerifiedStep(); return; }
    if (step < steps.length - 1) setStep(step + 1);
    else {
      toast.success("Request submitted successfully!");
      setStep(0);
    }
  };

  const chooseMode = (m: "return" | "exchange") => {
    setMode(m);
    setModeChosen(true);
    setStep(2);
  };

  // ===== Stepper navigation with validation =====
  const goToStep = (target: number) => {
    if (target === step) return;

    // Step 1 (Verify) — always accessible
    if (target === 0) {
      setStep(0);
      return;
    }

    // Step 2 (Choose) — requires verified order
    if (target === 1) {
      if (!verified) {
        toast.error("Please verify your order first.");
        return;
      }
      setStep(1);
      return;
    }

    // Step 3 (Details) — requires verified order AND mode chosen
    if (target === 2) {
      if (!verified) {
        toast.error("Please verify your order first.");
        return;
      }
      if (!modeChosen) {
        toast.error("Please choose Return or Exchange first.");
        return;
      }
      setStep(2);
      return;
    }

    // Step 4 (Done) — requires successful submission
    if (target === 3) {
      if (!submitted) {
        toast.error("Please submit your request first.");
        return;
      }
      setStep(3);
      return;
    }
  };

  // A step is "reachable" (clickable, dark/colored) if the user has met its prerequisites
  const isStepReachable = (i: number): boolean => {
    if (i === 0) return true;
    if (i === 1) return !!verified;
    if (i === 2) return !!verified && modeChosen;
    if (i === 3) return submitted;
    return false;
  };

return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      {/* ===== Compact Bordered Header Card ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-5 shadow-sm dark:border-amber-500/20 dark:from-amber-500/5 dark:via-slate-900 dark:to-orange-500/5 sm:p-6">
        {/* Top row: icon + title */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/40">
            <ShoppingBag className="h-7 w-7" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
              AMHUK / ASHTOM CUSTOMER PORTAL
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Easy Returns & Exchanges
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Submit your return or exchange request in just a few simple steps.
            </p>
          </div>
        </div>

        {/* Feature cards INSIDE the header card */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-white/80 p-3 backdrop-blur-sm dark:border-amber-500/15 dark:bg-slate-900/60"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== Premium Circular Stepper (clickable with validation) ===== */}
      <div className="mt-8 px-2 sm:px-4">
        <div className="flex items-start justify-between">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const reachable = isStepReachable(i);
            return (
              <div key={s.label} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {/* Left connector */}
                  <div className={cn(
                    "h-0.5 flex-1 transition-colors",
                    i === 0 ? "opacity-0" : done || active ? "bg-orange-400" : "bg-slate-200 dark:bg-slate-700",
                  )} />
                  {/* Clickable circle */}
                  <button
                    type="button"
                    onClick={() => goToStep(i)}
                    aria-label={`Go to step ${i + 1}: ${s.label}`}
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md transition-all hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 sm:h-11 sm:w-11",
                      done
                        ? "cursor-pointer bg-emerald-500 text-white shadow-emerald-200"
                        : active
                          ? "cursor-pointer bg-slate-900 text-white shadow-slate-300 dark:bg-white dark:text-slate-900"
                          : reachable
                            ? "cursor-pointer bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
                            : "cursor-not-allowed bg-slate-100 text-slate-400 hover:scale-100 dark:bg-slate-800 dark:text-slate-500",
                    )}
                  >
                    {done ? <Check className="h-5 w-5" strokeWidth={3} /> : s.num}
                  </button>
                  {/* Right connector */}
                  <div className={cn(
                    "h-0.5 flex-1 transition-colors",
                    i === steps.length - 1 ? "opacity-0" : done ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700",
                  )} />
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(i)}
                  className={cn(
                    "mt-2 text-xs font-semibold transition-colors focus:outline-none",
                    done || active
                      ? "cursor-pointer text-slate-900 hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                      : reachable
                        ? "cursor-pointer text-slate-600 hover:text-orange-600 dark:text-slate-300"
                        : "cursor-not-allowed text-slate-400",
                  )}
                >
                  {s.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== White Premium Form Card ===== */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8"
          >
            {step === 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Your Order</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Enter your Order ID and registered mobile number or email to begin.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</label>
                    <input
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value.replace(/^#/, ""))}
                      placeholder="e.g. #18630"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Mobile Number or Email</label>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="9876543210 or you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <p className="mt-1.5 text-xs text-slate-400">Use the contact you provided at checkout</p>
                  </div>
                </div>
              </div>
            )}

{step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What would you like to do?</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Order <span className="font-bold text-slate-700 dark:text-slate-200">{orderId}</span> verified successfully. Choose one option below.
                </p>

                {/* ===== Verified Order Details Card ===== */}
                {verified && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/5 dark:via-slate-900 dark:to-orange-500/5">
                    <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/70 px-5 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Order verified successfully</p>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 sm:grid-cols-2">
                      {[
                        ["Customer Name", verified.customer],
                        ["Order ID", `#${verified.orderId}`],
                        ["Email", verified.email],
                        ["Phone", verified.phone],
                        ["Product", verified.product],
                        ["SKU", verified.sku],
                        ["Variant", verified.variant],
                        ["Order Date", verified.orderDate],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
                        </div>
                      ))}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Status</p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          ● {verified.paymentStatus}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfillment Status</p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                          ● {verified.fulfillmentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Return Card */}
                  <button
                    type="button"
                    onClick={() => chooseMode("return")}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-500/40"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/40">
                      <RotateCcw className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Return</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      Please note: A reverse shipment charge of{" "}
                      <span className="font-bold text-rose-600 dark:text-rose-400">₹200 per product</span>{" "}
                      will be deducted from your refund amount as per our return policy.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-slate-900 transition group-hover:gap-2 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                      Start <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>

                  {/* Exchange Card */}
                  <button
                    type="button"
                    onClick={() => chooseMode("exchange")}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500/40"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                      <Repeat2 className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Exchange</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      Exchange your product completely{" "}
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Free of Cost</span>.
                      Simply select your preferred size or color.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-slate-900 transition group-hover:gap-2 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      Start <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </div>
            )}

{step === 2 && (
              <RequestFormStep
                mode={mode}
                orderId={orderId}
                prefillCustomer={verified?.customer}
                prefillEmail={verified?.email}
                prefillMobile={verified?.phone}
                prefillProduct={verified?.product}
                prefillSku={verified?.sku}
                onBack={() => setStep(1)}
                onCancel={() => setStep(0)}
                onSuccess={() => { setSubmitted(true); setStep(3); }}
              />
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Request Submitted!</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  We've received your {mode} request. You'll get an update within 24 hours.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700 dark:bg-orange-500/15">
                  Reference: #AMK-{Math.floor(Math.random() * 90000) + 10000}
                </div>
              </div>
            )}

{/* Footer actions — hidden on Step 2 (cards act as CTA) and Step 3 (form has its own footer) */}
            {step !== 1 && step !== 2 && (
              <div className={cn(
                "mt-6 flex items-center gap-3",
                "justify-between",
              )}>
                {step > 0 ? (
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : <span />}

                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {step === steps.length - 1 ? "Done" : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===== Return & Refund Policy — ONLY on Step 1 (Verify) ===== */}
      {step === 0 && (
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
        {/* Policy header */}
        <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 dark:border-slate-800 dark:from-orange-500/10 dark:to-amber-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Return & Refund Policy</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Please review our Return and Exchange Policy carefully before initiating a request. To start a return, enter your order number along with your registered email ID or mobile number.
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="px-6 py-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" /> Important Notice
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span><span className="font-semibold">₹200 reverse shipment charge</span> applies per product.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span><span className="font-semibold">COD orders</span> are refunded as <span className="font-semibold">Store Credit only</span>.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Need Assistance */}
        <div className="border-t border-slate-100 px-6 py-5 dark:border-slate-800">
          <h4 className="mb-3 text-base font-bold text-slate-900 dark:text-white">Need Assistance?</h4>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            For any return, exchange, refund or pickup-related queries, please contact our support team.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href="mailto:ashtomamk@gmail.com"
              className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Support Email</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-200">
                  ashtomamk@gmail.com
                </p>
              </div>
            </a>

            <a
              href="https://wa.me/918796322955"
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-700 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">WhatsApp Now</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800 group-hover:text-emerald-600 dark:text-slate-200">
                  +91 87963 22955
                </p>
              </div>
            </a>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Response Time</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Mon – Sat
                </p>
                <p className="text-xs text-slate-500">10:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
