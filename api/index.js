function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function last10(value) {
  const phone = normalizePhone(value);
  return phone.length >= 10 ? phone.slice(-10) : phone;
}

function normalizeOrderId(orderId) {
  const clean = String(orderId || "").trim();
  return clean.startsWith("#") ? clean : `#${clean}`;
}
