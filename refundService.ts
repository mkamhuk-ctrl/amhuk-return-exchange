import { supabase, isMissingTable } from "./supabase";
import { refundRows as seedRefundRows, type RefundRow } from "../lib/data";

const TABLE = "refunds";

interface RefundRowDB {
  refund_id: string;
  return_id?: string | null;
  customer: string;
  method: RefundRow["method"];
  amount: number;
  status: RefundRow["status"];
  txn_ref: string | null;
  created_at?: string;
}

function dbToRow(r: RefundRowDB): RefundRow {
  const created = r.created_at ? new Date(r.created_at) : new Date();
  return {
    id: r.refund_id,
    customer: r.customer,
    method: r.method,
    amount: r.amount,
    status: r.status,
    ref: r.txn_ref || "—",
    date: created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

export async function fetchRefunds(): Promise<RefundRow[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      if (isMissingTable(error)) return seedRefundRows;
      throw error;
    }
    if (!data || data.length === 0) return seedRefundRows;
    return (data as RefundRowDB[]).map(dbToRow);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("fetchRefunds failed, using seed:", e);
    return seedRefundRows;
  }
}

export async function createRefund(input: {
  return_id?: string;
  customer: string;
  method: RefundRow["method"];
  amount: number;
}): Promise<RefundRow | null> {
  const payload = {
    refund_id: `RFD-${1001 + Math.floor(Math.random() * 9000)}`,
    return_id: input.return_id ?? null,
    customer: input.customer,
    method: input.method,
    amount: input.amount,
    status: "Processing" as const,
    txn_ref: `TXN${Date.now()}`,
  };
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
  if (error) throw error;
  return dbToRow(data as RefundRowDB);
}
