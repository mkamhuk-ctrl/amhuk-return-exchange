import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// AMHUK Fashion — Supabase Client (LIVE)
// ============================================================

const SUPABASE_URL = "https://ugtccazlwoupoizmthuy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndGNjYXpsd291cG9pem10aHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTcxMTIsImV4cCI6MjA5NjU3MzExMn0.8hOZ4DNRKFDUh7NOn4rcq7ZEoZUuphxW9Aa_T3dwRek";

// ====== STRICT URL/KEY RESOLUTION ======
// We deliberately IGNORE import.meta.env if it points to ANY other project
// or if the key's JWT 'ref' claim doesn't match our project ref. This kills
// the "stale cached env points at a different Supabase project" class of bugs.
const EXPECTED_PROJECT_REF = "ugtccazlwoupoizmthuy";

function decodeJwtRef(jwt: string): string | null {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = JSON.parse(atob(b64));
    return json.ref || null;
  } catch {
    return null;
  }
}

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const envUrlMatches = typeof envUrl === "string" && envUrl.includes(EXPECTED_PROJECT_REF);
const envKeyRef = typeof envKey === "string" ? decodeJwtRef(envKey) : null;
const envKeyMatches = envKeyRef === EXPECTED_PROJECT_REF;

const supabaseUrl: string = envUrlMatches && envUrl ? envUrl : SUPABASE_URL;
const supabaseAnonKey: string = envKeyMatches && envKey ? envKey : SUPABASE_ANON_KEY;

// ====== RUNTIME DIAGNOSTICS — visible in the browser console ======
// eslint-disable-next-line no-console
console.log("================ SUPABASE RUNTIME CONFIG ================");
// eslint-disable-next-line no-console
console.log("SUPABASE URL:", supabaseUrl);
// eslint-disable-next-line no-console
console.log("SUPABASE KEY (last 12):", "…" + supabaseAnonKey.slice(-12));
// eslint-disable-next-line no-console
console.log("Anon JWT project ref:", decodeJwtRef(supabaseAnonKey));
// eslint-disable-next-line no-console
console.log("Expected project ref:", EXPECTED_PROJECT_REF);
// eslint-disable-next-line no-console
console.log("URL matches expected:", supabaseUrl.includes(EXPECTED_PROJECT_REF));
// eslint-disable-next-line no-console
console.log("Env URL (raw):", envUrl || "(unset — using hardcoded fallback)");
// eslint-disable-next-line no-console
console.log("Env URL accepted:", envUrlMatches);
// eslint-disable-next-line no-console
console.log("Env KEY accepted:", envKeyMatches, envKeyRef ? `(env key ref = ${envKeyRef})` : "");
// eslint-disable-next-line no-console
console.log("=========================================================");

export const supabaseUrlInUse = supabaseUrl;
export const supabaseKeyInUse = supabaseAnonKey;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const PRODUCT_IMAGES_BUCKET = "product-images";

// ============================================================
// Health check — runs once on app load
// ============================================================
let healthChecked = false;
let bucketReady = false;

export async function pingSupabase(): Promise<void> {
  if (healthChecked) return;
  healthChecked = true;

  // 1) SELECT test
  try {
    const { data, error } = await supabase
      .from("exchange_requests")
      .select("exchange_id")
      .limit(1);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] SELECT health check failed:", JSON.stringify(error, null, 2));
    } else {
      // eslint-disable-next-line no-console
      console.log("Supabase Connected Successfully — exchange_requests visible rows:", data?.length ?? 0);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[Supabase] SELECT health check exception:", e);
  }

  // 2) INSERT preflight — actually attempt a tiny insert and IMMEDIATELY delete it.
  // This proves whether the anon role can write to exchange_requests right now.
  try {
    const probeId = `PROBE-${Date.now()}`;
    const { error: insErr } = await supabase
      .from("exchange_requests")
      .insert({
        exchange_id: probeId,
        order_id: "preflight",
        customer_name: "preflight",
        status: "Pending",
      });
    if (insErr) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] INSERT preflight FAILED:", JSON.stringify(insErr, null, 2));
      // eslint-disable-next-line no-console
      console.error(
        "[Supabase] If error.code = 42501, RLS is OFF but the anon role lacks INSERT grant.\n" +
          "Run this in the SQL editor:\n" +
          "  grant insert, select, update on public.exchange_requests to anon;\n" +
          "  grant insert, select, update on public.return_requests   to anon;\n" +
          "  grant usage on schema public to anon;",
      );
    } else {
      // eslint-disable-next-line no-console
      console.log("[Supabase] INSERT preflight OK — cleaning up probe row");
      await supabase.from("exchange_requests").delete().eq("exchange_id", probeId);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[Supabase] INSERT preflight exception:", e);
  }
}

/**
 * Ensure the product-images bucket exists (best-effort).
 * Anon may not have privileges to create buckets — that's okay, we just try.
 */
async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === PRODUCT_IMAGES_BUCKET);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
        public: true,
        fileSizeLimit: 3 * 1024 * 1024,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg"],
      });
      if (error) {
        // eslint-disable-next-line no-console
        console.warn("[Supabase] createBucket skipped:", error.message);
      }
    }
    bucketReady = true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[Supabase] ensureBucket exception (continuing):", e);
  }
}

// ============================================================
// Image upload — never throws. Returns public URL or null.
// ============================================================
export async function uploadProductImage(file: File): Promise<string | null> {
  await ensureBucket();
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `uploads/${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || `image/${ext}`,
        cacheControl: "3600",
      });

    if (uploadErr) {
      // eslint-disable-next-line no-console
      console.error("Supabase Upload Error:", uploadErr);
      return null;
    }

    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Supabase Upload Exception:", e);
    return null;
  }
}

// ============================================================
// Helpers — explicitly suppress RLS / missing-table / invalid-key
// errors at the UI layer (we surface them as friendly messages).
// ============================================================
export function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const msg = (error.message || "").toLowerCase();
  return msg.includes("does not exist") || msg.includes("schema cache") || msg.includes("relation");
}

export function isRlsError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "42501") return true;
  const msg = (error.message || "").toLowerCase();
  return msg.includes("row-level security") || msg.includes("rls") || msg.includes("permission denied");
}

export function isInvalidApiKey(error: { message?: string } | null | undefined): boolean {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return msg.includes("invalid api key") || msg.includes("invalid jwt") || msg.includes("invalid signature");
}
