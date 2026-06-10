export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const monthlyData = [
  { month: "Jan", returns: 320, exchanges: 180 },
  { month: "Feb", returns: 280, exchanges: 210 },
  { month: "Mar", returns: 410, exchanges: 260 },
  { month: "Apr", returns: 380, exchanges: 290 },
  { month: "May", returns: 460, exchanges: 320 },
  { month: "Jun", returns: 520, exchanges: 380 },
  { month: "Jul", returns: 490, exchanges: 410 },
  { month: "Aug", returns: 560, exchanges: 440 },
  { month: "Sep", returns: 610, exchanges: 470 },
  { month: "Oct", returns: 580, exchanges: 520 },
  { month: "Nov", returns: 680, exchanges: 560 },
  { month: "Dec", returns: 720, exchanges: 610 },
];

export const refundStatus = [
  { name: "Completed", value: 1248, color: "#22c55e" },
  { name: "Processing", value: 462, color: "#3b82f6" },
  { name: "Pending", value: 318, color: "#f59e0b" },
  { name: "Failed", value: 86, color: "#ef4444" },
];

export const weeklyTrends = [
  { day: "Mon", requests: 64, completed: 42 },
  { day: "Tue", requests: 82, completed: 58 },
  { day: "Wed", requests: 73, completed: 61 },
  { day: "Thu", requests: 96, completed: 70 },
  { day: "Fri", requests: 120, completed: 88 },
  { day: "Sat", requests: 142, completed: 104 },
  { day: "Sun", requests: 98, completed: 76 },
];

export const liveStatus = [
  { label: "Pending Review", value: 48, color: "amber" },
  { label: "In Processing", value: 126, color: "blue" },
  { label: "Pickup Scheduled", value: 73, color: "violet" },
  { label: "Completed Today", value: 214, color: "green" },
  { label: "Failed / Rejected", value: 19, color: "red" },
];

export const recentActivities = [
  { id: 1, type: "return", title: "Return request submitted", customer: "Aarav Mehta", time: "2 min ago", status: "new" },
  { id: 2, type: "refund", title: "Refund processed", customer: "Diya Sharma", time: "14 min ago", status: "success", amount: 2499 },
  { id: 3, type: "pickup", title: "Pickup completed", customer: "Kabir Singh", time: "38 min ago", status: "success" },
  { id: 4, type: "exchange", title: "Exchange approved", customer: "Anaya Reddy", time: "1 hr ago", status: "info" },
  { id: 5, type: "shopify", title: "Shopify order synced", customer: "Order #AMK-10293", time: "2 hr ago", status: "info" },
  { id: 6, type: "return", title: "Return request rejected", customer: "Vivaan Gupta", time: "3 hr ago", status: "error" },
  { id: 7, type: "refund", title: "UPI refund initiated", customer: "Ishaan Patel", time: "4 hr ago", status: "info", amount: 1899 },
];

export const returnReasons = [
  { reason: "Size Issue", value: 38, color: "#6366f1" },
  { reason: "Color Mismatch", value: 22, color: "#8b5cf6" },
  { reason: "Quality", value: 16, color: "#ec4899" },
  { reason: "Damaged", value: 12, color: "#f97316" },
  { reason: "Wrong Item", value: 8, color: "#14b8a6" },
  { reason: "Other", value: 4, color: "#94a3b8" },
];

export const productReturns = [
  { name: "Oversized Cotton Tee", sku: "AMK-TS-204", rate: 18, color: "#6366f1" },
  { name: "Slim Fit Denim Jeans", sku: "AMK-JN-118", rate: 14, color: "#8b5cf6" },
  { name: "Floral Summer Dress", sku: "AMK-DR-076", rate: 26, color: "#ec4899" },
  { name: "Linen Blazer", sku: "AMK-BL-052", rate: 9, color: "#14b8a6" },
  { name: "Knit Wool Sweater", sku: "AMK-SW-091", rate: 21, color: "#f97316" },
];

export type ReqStatus = "Pending" | "Approved" | "Rejected" | "Pickup Scheduled" | "Refund Completed";

export interface ReturnRow {
  id: string;
  orderId: string;
  customer: string;
  mobile: string;
  product: string;
  sku: string;
  reason: string;
  status: ReqStatus;
  refundType: string;
  date: string;
  time: string;
  amount: number;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  paymentMethod: string;
  orderDate: string;
  pickupStatus: "Pending" | "Scheduled" | "Picked Up" | "Failed";
  refundStatus: "Not Initiated" | "Initiated" | "Processing" | "Completed";
}

const names = ["Aarav Mehta", "Diya Sharma", "Kabir Singh", "Anaya Reddy", "Vivaan Gupta", "Ishaan Patel", "Saanvi Iyer", "Reyansh Nair", "Myra Kapoor", "Aditya Rao", "Kiara Joshi", "Arjun Verma"];
const products = ["Premium Men's Lycra Denim", "Oversized Cotton Tee", "Slim Fit Denim Jeans", "Floral Summer Dress", "Linen Blazer", "Knit Wool Sweater", "Pleated Midi Skirt", "Graphic Hoodie", "Tailored Trousers"];
const skus = ["J08AKLBLUE32", "T12AKWHITE-M", "J05AKBLACK34", "D22AKFLORAL-S", "B11AKBEIGE-L", "S14AKMAROON-M", "K09AKOLIVE-S", "H07AKGREY-L", "P03AKNAVY-32"];
const reasons = ["Size Issue", "Color Mismatch", "Quality", "Damaged", "Wrong Item", "Other"];
const statuses: ReqStatus[] = ["Pending", "Approved", "Rejected", "Pickup Scheduled", "Refund Completed"];
const refundTypes = ["UPI", "Bank Transfer", "Store Credit", "Original Payment"];

const mobile = (i: number) =>
  "+91 " + (90000 + ((i * 7919) % 9999)).toString() + " " + (10000 + ((i * 1373) % 89999)).toString().slice(0, 5);

const timeStr = (i: number) => {
  const h = 8 + (i % 11);
  const m = (i * 7) % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h > 12 ? h - 12 : h;
  return `${hh.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const paymentMethods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "COD"];
const paymentStatuses: ReturnRow["paymentStatus"][] = ["Paid", "Refunded", "Paid", "Paid", "Pending"];
const pickupStatusList: ReturnRow["pickupStatus"][] = ["Pending", "Scheduled", "Picked Up", "Failed"];
const refundStatusList: ReturnRow["refundStatus"][] = ["Not Initiated", "Initiated", "Processing", "Completed"];

export const returnRows: ReturnRow[] = Array.from({ length: 48 }).map((_, i) => ({
  id: "RET-" + (1001 + i),
  orderId: "AMK-" + (20933 - i * 3),
  customer: names[i % names.length],
  mobile: mobile(i),
  product: products[i % products.length],
  sku: skus[i % skus.length],
  reason: reasons[i % reasons.length],
  status: statuses[i % statuses.length],
  refundType: refundTypes[i % refundTypes.length],
  date: new Date(2026, 0, 28 - (i % 28)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  time: timeStr(i),
  amount: 899 + (i % 9) * 420,
  paymentStatus: paymentStatuses[i % paymentStatuses.length],
  paymentMethod: paymentMethods[i % paymentMethods.length],
  orderDate: new Date(2026, 0, Math.max(1, 25 - (i % 25))).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  pickupStatus: pickupStatusList[i % pickupStatusList.length],
  refundStatus: refundStatusList[i % refundStatusList.length],
}));

export interface ExchangeRow {
  id: string;
  orderId: string;
  customer: string;
  mobile: string;
  product: string;
  sku: string;
  currentSize: string;
  newSize: string;
  currentColor: string;
  newColor: string;
  currentVariant: string;
  requestedVariant: string;
  reason: string;
  status: ReqStatus;
  courier: string;
  awb: string;
  date: string;
  time: string;
  amount: number;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  paymentMethod: string;
  orderDate: string;
}

const sizes = ["XS", "S", "M", "L", "XL"];
const colors = ["Black", "Navy", "Olive", "Beige", "White", "Maroon"];
const couriers = ["Delhivery", "BlueDart", "Ekart", "DTDC", "Shadowfax"];

export const exchangeRows: ExchangeRow[] = Array.from({ length: 32 }).map((_, i) => {
  const currentSize = sizes[i % sizes.length];
  const newSize = sizes[(i + 1) % sizes.length];
  const currentColor = colors[i % colors.length];
  const newColor = colors[(i + 2) % colors.length];
  return {
    id: "EXC-" + (1001 + i),
    orderId: "AMK-" + (20910 - i * 4),
    customer: names[(i + 3) % names.length],
    mobile: mobile(i + 5),
    product: products[(i + 2) % products.length],
    sku: skus[(i + 2) % skus.length],
    currentSize,
    newSize,
    currentColor,
    newColor,
    currentVariant: `${currentSize} / ${currentColor}`,
    requestedVariant: `${newSize} / ${newColor}`,
    reason: reasons[i % reasons.length],
    status: statuses[(i + 1) % statuses.length],
    courier: couriers[i % couriers.length],
    awb: "AWB" + (98213400 + i * 137),
    date: new Date(2026, 0, 27 - (i % 26)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: timeStr(i + 3),
    amount: 1299 + (i % 8) * 480,
    paymentStatus: paymentStatuses[(i + 1) % paymentStatuses.length],
    paymentMethod: paymentMethods[(i + 1) % paymentMethods.length],
    orderDate: new Date(2026, 0, Math.max(1, 24 - (i % 24))).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  };
});

export interface PickupRow {
  id: string;
  customer: string;
  address: string;
  courier: string;
  awb: string;
  slot: string;
  status: "Scheduled" | "Out for Pickup" | "Picked Up" | "Failed";
  attempts: number;
}

const pickupStatuses: PickupRow["status"][] = ["Scheduled", "Out for Pickup", "Picked Up", "Failed"];
const cities = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Jaipur", "Kolkata"];

export const pickupRows: PickupRow[] = Array.from({ length: 24 }).map((_, i) => ({
  id: "PCK-" + (5400 - i),
  customer: names[(i + 5) % names.length],
  address: `${cities[i % cities.length]}, India`,
  courier: couriers[(i + 1) % couriers.length],
  awb: "AWB" + (77120300 + i * 211),
  slot: ["10:00 - 13:00", "13:00 - 16:00", "16:00 - 19:00"][i % 3],
  status: pickupStatuses[i % pickupStatuses.length],
  attempts: (i % 3) + 1,
}));

export interface RefundRow {
  id: string;
  customer: string;
  method: "UPI" | "Bank Transfer" | "Store Credit";
  amount: number;
  status: "Completed" | "Processing" | "Pending" | "Failed";
  ref: string;
  date: string;
}

const refundStatuses: RefundRow["status"][] = ["Completed", "Processing", "Pending", "Failed"];
const methods: RefundRow["method"][] = ["UPI", "Bank Transfer", "Store Credit"];

export const refundRows: RefundRow[] = Array.from({ length: 28 }).map((_, i) => ({
  id: "RFD-" + (6300 - i),
  customer: names[(i + 2) % names.length],
  method: methods[i % methods.length],
  amount: 699 + (i % 12) * 380,
  status: refundStatuses[i % refundStatuses.length],
  ref: "TXN" + (552130 + i * 73),
  date: new Date(2026, 0, 28 - (i % 25)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
}));

export const courierPerf = [
  { courier: "Delhivery", success: 96, pickups: 1240 },
  { courier: "BlueDart", success: 94, pickups: 980 },
  { courier: "Ekart", success: 91, pickups: 1120 },
  { courier: "DTDC", success: 88, pickups: 760 },
  { courier: "Shadowfax", success: 93, pickups: 640 },
];
