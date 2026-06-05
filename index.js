import express from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

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

  return crypto.timingSafeEqual(
    Buffer.from(generatedHmac, "utf8"),
    Buffer.from(hmac, "utf8")
  );
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

export default app;