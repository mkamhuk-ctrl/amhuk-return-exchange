import express from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

const {
  SHOPIFY_CLIENT_ID,
  SHOPIFY_CLIENT_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_REDIRECT_URI,
  SHOPIFY_API_VERSION,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function verifyShopifyHmac(query) {
  const { hmac, signature, ...params } = query;

  if (!hmac) return false;

  const message = Object.keys(params)
    .sort()
    .map((key) => {
      const value = Array.isArray(params[key])
        ? params[key].join(",")
        : params[key];

      return `${key}=${value}`;
    })
    .join("&");

  const generatedHmac = crypto
    .createHmac("sha256", SHOPIFY_CLIENT_SECRET)
    .update(message)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac, "utf8"),
      Buffer.from(hmac, "utf8")
    );
  } catch {
    return false;
  }
}

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

app.get("/", (req, res) => {
  res.send("AMHUK Shopify backend is running");
});

app.get("/api/shopify/install", (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const installUrl =
    `https://${shop}/admin/oauth/authorize?` +
    `client_id=${SHOPIFY_CLIENT_ID}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&redirect_uri=${encodeURIComponent(SHOPIFY_REDIRECT_URI)}` +
    `&state=amhuk_secure_state`;

  res.redirect(installUrl);
});

app.get("/api/shopify/callback", async (req, res) => {
  try {
    const { shop, code, hmac } = req.query;

    if (!shop || !code || !hmac) {
      return res.status(400).send("Missing Shopify OAuth parameters");
    }

    const isValid = verifyShopifyHmac(req.query);

    if (!isValid) {
      return res.status(403).send("Invalid Shopify HMAC");
    }

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({
        error: "Access token not generated",
        details: tokenData
      });
    }

    const { error } = await supabase
      .from("shopify_connections")
      .upsert(
        {
          shop_domain: shop,
          access_token: tokenData.access_token,
          scope: tokenData.scope || SHOPIFY_SCOPES
        },
        { onConflict: "shop_domain" }
      );

    if (error) {
      return res.status(500).json({
        error: "Token generated but Supabase save failed",
        details: error.message
      });
    }

    res.send("Shopify connected successfully. Token saved securely.");
  } catch (error) {
    res.status(500).json({
      error: "OAuth callback failed",
      details: error.message
    });
  }
});

app.post("/api/shopify/order-lookup", async (req, res) => {
  try {
    const { orderId, contact } = req.body;

    if (!orderId || !contact) {
      return res.status(400).json({
        error: "orderId and contact are required"
      });
    }

    const normalizedOrderId = normalizeOrderId(orderId);

    const { data: connection, error: connectionError } = await supabase
      .from("shopify_connections")
      .select("shop_domain, access_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (connectionError || !connection) {
      return res.status(404).json({
        error: "Shopify connection not found"
      });
    }

    const query = `
      query {
        orders(first: 1, query: "name:${normalizedOrderId}") {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              customer {
                firstName
                lastName
                email
                phone
              }
              shippingAddress {
                address1
                address2
                city
                province
                zip
                phone
              }
              billingAddress {
                phone
              }
              lineItems(first: 20) {
                edges {
                  node {
                    title
                    sku
                    quantity
                    variantTitle
                  }
                }
              }
            }
          }
        }
      }
    `;

    const shopifyResponse = await fetch(
      `https://${connection.shop_domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": connection.access_token
        },
        body: JSON.stringify({ query })
      }
    );

    const result = await shopifyResponse.json();
    const order = result?.data?.orders?.edges?.[0]?.node;

    if (!order) {
      return res.status(404).json({
        error: "Order not found. Please check your Order ID."
      });
    }

    const input = String(contact || "").trim().toLowerCase();
    const inputPhoneLast10 = last10(input);

    const shopifyEmail = order.customer?.email?.toLowerCase().trim() || "";

    const customerPhoneLast10 = last10(order.customer?.phone);
    const shippingPhoneLast10 = last10(order.shippingAddress?.phone);
    const billingPhoneLast10 = last10(order.billingAddress?.phone);

    const matched =
      shopifyEmail === input ||
      customerPhoneLast10 === inputPhoneLast10 ||
      shippingPhoneLast10 === inputPhoneLast10 ||
      billingPhoneLast10 === inputPhoneLast10;

    if (!matched) {
      return res.status(403).json({
        error: "Order found, but mobile/email does not match Shopify order details.",
        debug: {
          normalizedOrderId,
          inputPhoneLast10,
          customerPhoneLast10,
          shippingPhoneLast10,
          billingPhoneLast10,
          inputEmail: input,
          shopifyEmail,
          matched
        }
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      error: "Order lookup failed",
      details: error.message
    });
  }
});

export default app;
