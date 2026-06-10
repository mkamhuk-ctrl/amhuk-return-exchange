import { useRef, useState } from "react";
import { ArrowLeft, Upload, CheckCircle2, X as XIcon, Image as ImgIcon } from "lucide-react";
import { useToast } from "../lib/toast";
import { cn } from "../utils/cn";
import { uploadProductImage } from "../services/supabase";
import { createReturnRequest } from "../services/returnService";
import { createExchangeRequest } from "../services/exchangeService";

const sizes = ["28", "30", "32", "34", "36", "38", "40", "42"];

const returnReasons = [
  "Size Issue",
  "Color Mismatch",
  "Quality Issue",
  "Damaged Product",
  "Wrong Item Delivered",
  "Not As Described",
  "Other",
];

const exchangeReasons = [
  "Size Doesn't Fit",
  "Want Different Color",
  "Want Different Size",
  "Quality Issue",
  "Damaged Product",
  "Other",
];

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

const selectCls =
  "w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

function SelectArrow() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
    </svg>
  );
}

interface Props {
  mode: "return" | "exchange";
  orderId: string;
  prefillCustomer?: string;
  prefillEmail?: string;
  prefillMobile?: string;
  prefillProduct?: string;
  prefillSku?: string;
  onBack: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export function RequestFormStep({
  mode,
  orderId,
  prefillCustomer,
  prefillEmail,
  prefillMobile,
  prefillProduct,
  prefillSku,
  onBack,
  onCancel,
  onSuccess,
}: Props) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(prefillCustomer || "");
  const [order, setOrder] = useState(orderId);
  const [mobile, setMobile] = useState(prefillMobile || "8568568565");
  const [email, setEmail] = useState(prefillEmail || "");
  const [product, setProduct] = useState(prefillProduct || "");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [reqSize, setReqSize] = useState("");
  const [reqColor, setReqColor] = useState("");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
      toast.error("Only JPG or PNG images are allowed.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be 3MB or smaller.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((e) => {
      const { image: _img, ...rest } = e;
      void _img;
      return rest;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Customer name is required.";
    if (!order.trim()) e.order = "Order ID is required.";
    if (mode === "return") {
      if (!size) e.size = "Size is required.";
      if (!color.trim()) e.color = "Colour is required.";
    } else {
      if (!size) e.size = "Current size is required.";
      if (!reqSize) e.reqSize = "Requested size is required.";
      if (!color.trim()) e.color = "Current colour is required.";
      if (!reqColor.trim()) e.reqColor = "Requested colour is required.";
    }
    if (!reason) e.reason = `Reason for ${mode} is required.`;
    if (!imageFile) e.image = "Product image is required.";
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.image) toast.error("Product image is required.");
      else toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    // ---- Step 1: Attempt image upload (non-blocking) ----
    // If the bucket is missing or RLS denies anon uploads, this resolves to
    // null and we continue with product_image = null. Submission is NEVER
    // blocked because of an image upload problem.
    let imageUrl: string | null = null;
    if (imageFile) {
      try {
        imageUrl = await uploadProductImage(imageFile);
        if (!imageUrl) {
          // eslint-disable-next-line no-console
          console.warn("[Portal] Image upload returned null — continuing without image URL");
          toast.info("Image upload skipped — submitting without image.");
        }
      } catch (upErr) {
        // eslint-disable-next-line no-console
        console.error("Upload failed:", upErr);
        toast.info("Image upload failed — continuing without image.");
        imageUrl = null;
      }
    }

    // ---- Step 2: Insert request row (this MUST succeed for success state) ----
    try {
      if (mode === "return") {
        const created = await createReturnRequest({
          order_id: order.trim(),
          customer_name: name.trim(),
          mobile_number: mobile.trim() || undefined,
          email: email.trim() || undefined,
          product_name: product.trim() || undefined,
          sku: prefillSku || undefined,
          size: size || undefined,
          colour: color.trim() || undefined,
          reason: reason || undefined,
          additional_comments: comments.trim() || undefined,
          product_image: imageUrl || undefined,
        });
        // eslint-disable-next-line no-console
        console.log("[Portal] Return created:", created);
        toast.success(`Return request ${created.id} submitted successfully!`);
      } else {
        const created = await createExchangeRequest({
          order_id: order.trim(),
          customer_name: name.trim(),
          mobile_number: mobile.trim() || undefined,
          email: email.trim() || undefined,
          product_name: product.trim() || undefined,
          sku: prefillSku || undefined,
          current_size: size || undefined,
          requested_size: reqSize || undefined,
          current_colour: color.trim() || undefined,
          requested_colour: reqColor.trim() || undefined,
          reason: reason || undefined,
          additional_comments: comments.trim() || undefined,
          product_image: imageUrl || undefined,
        });
        // eslint-disable-next-line no-console
        console.log("[Portal] Exchange created:", created);
        toast.success(`Exchange request ${created.id} submitted successfully!`);
      }
      onSuccess();
    } catch (err) {
      // ====== SHOW RAW ERROR — NO TRANSLATION / ASSUMPTIONS ======
      // eslint-disable-next-line no-console
      console.error("Supabase Error (raw):", err);
      const raw = err instanceof Error ? err.message : String(err);
      toast.error(raw || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldErr = (k: string) =>
    errors[k] ? <p className="mt-1 text-xs font-medium text-rose-500">{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === "return" ? "Return Request" : "Exchange Request"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {mode === "return"
              ? "Please fill out all required fields below."
              : "Tell us what you have and what you want instead."}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-5 md:gap-y-4">
        {/* Customer Name */}
        <div>
          <Label required>Customer Name</Label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={cn(inputCls, errors.name && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
          />
          {fieldErr("name")}
        </div>

        {/* Order ID */}
        <div>
          <Label required>Order ID</Label>
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="e.g. 85458"
            className={cn(inputCls, errors.order && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
          />
          {fieldErr("order")}
        </div>

        {/* Mobile */}
        <div>
          <Label>Mobile Number</Label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="9876543210"
            className={inputCls}
          />
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />
        </div>

        {/* Product Name — full width */}
        <div className="md:col-span-2">
          <Label>Product Name</Label>
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder={mode === "return" ? "e.g. ASHTOM Cotton Kurti - Floral Print" : "Product you received"}
            className={inputCls}
          />
        </div>

        {/* RETURN MODE: Size + Colour */}
        {mode === "return" && (
          <>
            <div>
              <Label required>Size</Label>
              <div className="relative">
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={cn(selectCls, errors.size && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
                >
                  <option value="">Select size</option>
                  {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <SelectArrow />
              </div>
              {fieldErr("size")}
            </div>
            <div>
              <Label required>Colour</Label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Enter Colour"
                className={cn(inputCls, errors.color && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
              />
              {fieldErr("color")}
            </div>
          </>
        )}

        {/* EXCHANGE MODE: Current Size / Requested Size, then Current Colour / Requested Colour */}
        {mode === "exchange" && (
          <>
            <div>
              <Label required>Current Size</Label>
              <div className="relative">
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={cn(selectCls, errors.size && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
                >
                  <option value="">Select size</option>
                  {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <SelectArrow />
              </div>
              {fieldErr("size")}
            </div>
            <div>
              <Label required>Requested Size</Label>
              <div className="relative">
                <select
                  value={reqSize}
                  onChange={(e) => setReqSize(e.target.value)}
                  className={cn(selectCls, errors.reqSize && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
                >
                  <option value="">Select size</option>
                  {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <SelectArrow />
              </div>
              {fieldErr("reqSize")}
            </div>
            <div>
              <Label required>Current Colour</Label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Enter Current Colour"
                className={cn(inputCls, errors.color && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
              />
              {fieldErr("color")}
            </div>
            <div>
              <Label required>Requested Colour</Label>
              <input
                value={reqColor}
                onChange={(e) => setReqColor(e.target.value)}
                placeholder="Enter Requested Colour"
                className={cn(inputCls, errors.reqColor && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
              />
              {fieldErr("reqColor")}
            </div>
          </>
        )}

        {/* Reason — full width */}
        <div className="md:col-span-2">
          <Label required>{mode === "return" ? "Reason for Return" : "Reason for Exchange"}</Label>
          <div className="relative">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={cn(selectCls, errors.reason && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
            >
              <option value="">Select a reason</option>
              {(mode === "return" ? returnReasons : exchangeReasons).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <SelectArrow />
          </div>
          {fieldErr("reason")}
        </div>

        {/* Comments — full width */}
        <div className="md:col-span-2">
          <Label>Additional Comments</Label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder={mode === "return" ? "Tell us more about the issue..." : "Anything else we should know..."}
            className={cn(inputCls, "resize-y")}
          />
          <p className="mt-1 text-xs text-slate-400">
            {mode === "return" ? "Optional - share more about the issue" : "Optional"}
          </p>
        </div>

        {/* Product Image Upload — full width, mandatory */}
        <div className="md:col-span-2">
          <Label>Product Image <span className="ml-0.5 text-rose-500">*</span></Label>
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "group relative flex h-28 w-28 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-slate-50 text-slate-500 transition hover:border-orange-400 hover:bg-orange-50 dark:bg-slate-800",
                errors.image
                  ? "border-rose-300 bg-rose-50/50 dark:border-rose-500/40"
                  : "border-slate-300 dark:border-slate-700",
              )}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
                  <span
                    onClick={(e) => { e.stopPropagation(); handleFile(null); }}
                    role="button"
                    className="absolute right-1 top-1 z-10 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-white"
                  >
                    <XIcon className="h-3 w-3" />
                  </span>
                </>
              ) : (
                <>
                  <Upload className="mb-1 h-6 w-6" />
                  <span className="text-[11px] font-semibold">Upload</span>
                </>
              )}
            </button>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm leading-snug text-slate-700 dark:text-slate-200">
                Click the box to upload a product photo.
                <br />
                <span className="text-slate-500 dark:text-slate-400">This helps us verify the issue faster.</span>
              </p>
              {imageFile && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ImgIcon className="h-3 w-3" /> {imageFile.name}
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <p className="mt-2 text-xs text-slate-400">JPG/PNG, max 3MB</p>
          {fieldErr("image")}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="mt-7 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-orange-900/40"
        >
          <CheckCircle2 className="h-4 w-4" />
          {submitting
            ? "Submitting..."
            : mode === "return"
              ? "Submit Return Request"
              : "Submit Exchange Request"}
        </button>
      </div>
    </form>
  );
}
