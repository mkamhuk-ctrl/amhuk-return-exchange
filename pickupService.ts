import { supabase, isMissingTable } from "./supabase";
import { pickupRows as seedPickupRows, type PickupRow } from "../lib/data";

const TABLE = "pickups";

interface PickupRowDB {
  pickup_id: string;
  request_id?: string | null;
  customer: string;
  address: string | null;
  courier: string | null;
  awb: string | null;
  slot: string | null;
  status: PickupRow["status"];
  attempts: number;
  created_at?: string;
}

function dbToRow(r: PickupRowDB): PickupRow {
  return {
    id: r.pickup_id,
    customer: r.customer,
    address: r.address || "—",
    courier: r.courier || "Delhivery",
    awb: r.awb || "—",
    slot: r.slot || "10:00 - 13:00",
    status: r.status,
    attempts: r.attempts ?? 1,
  };
}

export async function fetchPickups(): Promise<PickupRow[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      if (isMissingTable(error)) return seedPickupRows;
      throw error;
    }
    if (!data || data.length === 0) return seedPickupRows;
    return (data as PickupRowDB[]).map(dbToRow);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("fetchPickups failed, using seed:", e);
    return seedPickupRows;
  }
}

export async function updatePickupStatus(pickupId: string, status: PickupRow["status"]): Promise<void> {
  const { error } = await supabase.from(TABLE).update({ status }).eq("pickup_id", pickupId);
  if (error && !isMissingTable(error)) throw error;
}
