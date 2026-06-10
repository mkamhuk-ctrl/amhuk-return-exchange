import { supabase, isMissingTable, supabaseUrlInUse } from "./supabase";
import { exchangeRows as seedExchangeRows, type ExchangeRow } from "../lib/data";
import { emit } from "./events";

const TABLE = "exchange_requests";

export interface ExchangeRowDB {
  id?: string;
  exchange_id: string;
  order_id: string;
  customer_name: string;
  mobile_number: string | null;
  email: string | null;
  product_name: string | null;
  sku: string | null;
  current_size: string | null;
  requested_size: string | null;
  current_colour: string | null;
  requested_colour: string | null;
  reason: string | null;
  additional_comments: string | null;
  product_image: string | null;
  courier: string | null;
  awb: string | null;
  status: string;
  created_at?: string;
}

export interface NewExchangeInput {
  order_id: string;
  customer_name: string;
  mobile_number?: string;
  email?: string;
  product_name?: string;
  sku?: string;
  current_size?: string;
  requested_size?: string;
  current_colour?: string;
  requested_colour?: string;
  reason?: string;
  additional_comments?: string;
  product_image?: string;
}

function dbToRow(r: ExchangeRowDB): ExchangeRow {
  const created = r.created_at ? new Date(r.created_at) : new Date();
  const cs = r.current_size || "—";
  const cc = r.current_colour || "—";
  const ns = r.requested_size || "—";
  const nc = r.requested_colour || "—";
  return {
    id: r.exchange_id,
    orderId: r.order_id,
    customer: r.customer_name,
    mobile: r.mobile_number || "—",
    product: r.product_name || "—",
    sku: r.sku || "—",
    currentSize: cs,
    newSize: ns,
    currentColor: cc,
    newColor: nc,
    currentVariant: `${cs} / ${cc}`,
    requestedVariant: `${ns} / ${nc}`,
    reason: r.reason || "—",
    status: r.status as ExchangeRow["status"],
    courier: r.courier || "Delhivery",
    awb: r.awb || "—",
    date: created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    amount: 0,
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    orderDate: created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

/**
 * Generate the next sequential Exchange ID.
 * - First-ever submission → EXC-1001
 * - Subsequent → EXC-1002, EXC-1003, …
 * Never throws — falls back to a timestamp-based ID if the lookup fails.
 */
async function nextExchangeId(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("exchange_id")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[Exchange] nextId lookup failed, starting from 1001:", error.message);
      return "EXC-1001";
    }
    const last = data?.[0]?.exchange_id as string | undefined;
    if (!last) return "EXC-1001";
    const n = parseInt(last.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(n) || n < 1000) return "EXC-1001";
    return `EXC-${n + 1}`;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[Exchange] nextId threw, using fallback:", e);
    return `EXC-${1001 + (Date.now() % 9000)}`;
  }
}

export async function fetchExchangeRequests(): Promise<ExchangeRow[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      if (isMissingTable(error)) return seedExchangeRows;
      throw error;
    }
    if (!data || data.length === 0) return seedExchangeRows;
    return (data as ExchangeRowDB[]).map(dbToRow);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("fetchExchangeRequests failed, using seed:", e);
    return seedExchangeRows;
  }
}

export async function createExchangeRequest(input: NewExchangeInput): Promise<ExchangeRow> {
  const exchange_id = await nextExchangeId();

  // Build payload using EXACT column names from public.exchange_requests
  const payload: Record<string, unknown> = {
    exchange_id,
    order_id: input.order_id,
    customer_name: input.customer_name,
    mobile_number: input.mobile_number ?? null,
    email: input.email ?? null,
    product_name: input.product_name ?? null,
    sku: input.sku ?? null,
    current_size: input.current_size ?? null,
    requested_size: input.requested_size ?? null,
    current_colour: input.current_colour ?? null,
    requested_colour: input.requested_colour ?? null,
    reason: input.reason ?? null,
    additional_comments: input.additional_comments ?? null,
    product_image: input.product_image ?? null,
    status: "Pending",
  };

  // ====== FULL DIAGNOSTICS ======
  // eslint-disable-next-line no-console
  console.log("SUPABASE URL:", supabaseUrlInUse);
  // eslint-disable-next-line no-console
  console.log("INSERT TABLE:", `public.${TABLE}`);
  // eslint-disable-next-line no-console
  console.log("INSERT PAYLOAD:", JSON.stringify(payload, null, 2));

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    // ====== RAW ERROR — NO ASSUMPTIONS ======
    // eslint-disable-next-line no-console
    console.log("REAL INSERT ERROR:", JSON.stringify(error, null, 2));
    // eslint-disable-next-line no-console
    console.log("  error.message:", error.message);
    // eslint-disable-next-line no-console
    console.log("  error.code   :", error.code);
    // eslint-disable-next-line no-console
    console.log("  error.details:", error.details);
    // eslint-disable-next-line no-console
    console.log("  error.hint   :", error.hint);
    // eslint-disable-next-line no-console
    console.error("Supabase Error object:", error);

    // Surface the RAW message — DO NOT translate or guess
    const parts: string[] = [];
    if (error.message) parts.push(error.message);
    if (error.code) parts.push(`(code: ${error.code})`);
    if (error.details) parts.push(`— ${error.details}`);
    if (error.hint) parts.push(`Hint: ${error.hint}`);
    throw new Error(parts.join(" ") || "Insert failed with no error message.");
  }

  // eslint-disable-next-line no-console
  console.log("[Exchange] INSERT SUCCESS:", data);
  emit("exchanges:changed");
  return dbToRow(data as ExchangeRowDB);
}

export async function updateExchangeStatus(exchangeId: string, status: string): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ status }).eq("exchange_id", exchangeId);
  if (error && !isMissingTable(error)) {
    // eslint-disable-next-line no-console
    console.log("UPDATE ERROR:", JSON.stringify(error, null, 2));
    throw error;
  }
  emit("exchanges:changed");
}
