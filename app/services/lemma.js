import { DEMO_FALLBACK } from "./demoData.js";

export async function loadIncidentRecords() {
  const fallbackRecords = DEMO_FALLBACK;
  const sdk = await loadLemmaSdk();

  if (!sdk) {
    return {
      liveRecords: [],
      fallbackRecords,
      source: "fallback",
      reason: "SDK script loaded but LemmaClient missing.",
    };
  }

  const client = new sdk.LemmaClient({});

  try {
    const session = await client.initialize();

    if (session.status !== "authenticated") {
      return {
        liveRecords: [],
        fallbackRecords,
        source: "fallback",
        reason: "not authenticated",
      };
    }

    const rows = await client.records.list("incidents", { limit: 200 });
    const items = Array.isArray(rows) ? rows : rows?.items || [];

    if (!items.length) {
      return {
        liveRecords: [],
        fallbackRecords,
        source: "fallback",
        reason: "no rows in table",
      };
    }

    return {
      liveRecords: items,
      fallbackRecords,
      source: "live",
      reason: "",
    };
  } catch (error) {
    return {
      liveRecords: [],
      fallbackRecords,
      source: "fallback",
      reason: error?.message || String(error),
    };
  }
}

async function loadLemmaSdk() {
  if (window.LemmaClient) {
    return window.LemmaClient;
  }

  const config = window.__LEMMA_CONFIG__ || {};
  const baseUrl = (config.apiUrl || window.location.origin).replace(/\/$/, "");

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-lemma-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.LemmaClient || null), { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `${baseUrl}/public/sdk/lemma-client.js`;
    script.dataset.lemmaSdk = "true";
    script.onload = () => resolve(window.LemmaClient || null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}
