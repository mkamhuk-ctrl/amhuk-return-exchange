import { supabase, isMissingTable, supabaseUrlInUse } from "./supabase";
import { returnRows as seedReturnRows, type ReturnRow } from "../lib/data";
import { emit } from "./events";

const TABLE = "return_requests";

export interface ReturnRowDB {
  id?: string;
  return_id: string;
  order_id: string;
  customer_name: string;
  mobile_number: string | null;
  email: string | null;
  product_name: string | null;
  sku: string | null;
  size: string | null;
  colour: string | null;
  reason: string | null;
  additional_comments: string | null;
  product_image: string | null;
  refund_type: string | null;
  refund_amount: number | null;
  status: string;
  created_at?: string;
}

export interface NewReturnInput {
  order_id: string;
  customer_name: string;
  mobile_number?: string;
  email?: string;
  product_name?: string;
  sku?: string;
  size?: string;
  colour?: string;
  reason?: string;
  additional_comments?: string;
  product_image?: string;
  refund_type?: string;
  refund_amount?: number;
}

// ---- Mapping helpers (DB <-> UI ReturnRow) ----------------------------------

function dbToRow(r: ReturnRowDB): ReturnRow {
  const created = r.created_at ? new Date(r.created_at) : new Date();
  return {
    id: r.return_id,
    orderId: r.order_id,
    customer: r.customer_name,
    mobile: r.mobile_number || "—",
    product: r.product_name || "—",
    sku: r.sku || "—",
    reason: r.reason || "—",
    status: r.status as ReturnRow["status"],
    refundType: r.refund_type || "UPI",
    date: created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    amount: r.refund_amount ?? 0,
    paymentStatus: "Paid",
    paymentMethod: r.refund_type || "UPI",
    orderDate: created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    pickupStatus: "Pending",
    refundStatus:
      r.status === "Refund Completed"
        ? "Completed"
        : r.status === "Approved"
          ? "Initiated"
          : "Not Initiated",
  };
}

// ---- ID generation ----------------------------------------------------------

/**
 * Generate the next sequential Return ID.
 * - First-ever submission → RET-1001
 * - Subsequent → RET-1002, RET-1003, …
 * Never throws — falls back to a timestamp-based ID if the lookup fails.
 */
async function nextReturnId(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("return_id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      // Table missing or RLS issue → start fresh
      // eslint-disable-next-line no-console
      console.warn("[Return] nextId lookup failed, starting from 1001:", error.message);
      return "RET-1001";
    }
    const last = data?.[0]?.return_id as string | undefined;
    if (!last) return "RET-1001";
    const n = parseInt(last.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(n) || n < 1000) return "RET-1001";
    return `RET-${n + 1}`;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[Return] nextId threw, using fallback:", e);
    return `RET-${1001 + (Date.now() % 9000)}`;
  }
}

// ---- CRUD -------------------------------------------------------------------

export async function fetchReturnRequests(): Promise<ReturnRow[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      if (isMissingTable(error)) return seedReturnRows;
      throw error;
    }
    if (!data || data.length === 0) return seedReturnRows;
    return (data as ReturnRowDB[]).map(dbToRow);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("fetchReturnRequests failed, using seed:", e);
    return seedReturnRows;
  }
}

export async function createReturnRequest(input: NewReturnInput): Promise<ReturnRow> {
  const return_id = await nextReturnId();

  // Build payload using EXACT column names from public.return_requests
  const payload: Record<string, unknown> = {
    return_id,
    order_id: input.order_id,
    customer_name: input.customer_name,
    mobile_number: input.mobile_number ?? null,
    email: input.email ?? null,
    product_name: input.product_name ?? null,
    sku: input.sku ?? null,
    size: input.size ?? null,
    colour: input.colour ?? null,
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
  console.log("[Return] INSERT SUCCESS:", data);
  emit("returns:changed");
  return dbToRow(data as ReturnRowDB);
}

export async function updateReturnStatus(returnId: string, status: string): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ status }).eq("return_id", returnId);
  if (error && !isMissingTable(error)) {
    // eslint-disable-next-line no-console
    console.log("UPDATE ERROR:", JSON.stringify(error, null, 2));
    throw error;
  }
  emit("returns:changed");
}
