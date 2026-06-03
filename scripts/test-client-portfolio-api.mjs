/**
 * Smoke test: API envelope parsing for client portfolio (no auth required for asserts).
 * Run: node scripts/test-client-portfolio-api.mjs
 */

const createResponse = {
  status: "true",
  message: "Client portfolio item created successfully",
  data: {
    id: 1,
    sort_order: 0,
    is_active: true,
    category: "food_retail",
    client_tag: { ar: "عسل أبو نايف", en: "AbouNayef Honey" },
    headline: { ar: "+47% تحويل", en: "+47% Conversion Rate in 90 Days" },
    period: { ar: "فبراير–مايو 2025", en: "Feb–May 2025" },
    client: { ar: "عميل", en: "Client" },
    challenge: { ar: "نص", en: "Challenge" },
    what_we_did: { ar: "ما قمنا به", en: "What we did" },
    results: { ar: "النتائج", en: "Results" },
    metrics: [{ ar: "+47%", en: "+47%" }],
    image: { ar: null, en: null },
    image_alt: { ar: "alt ar", en: "alt en" },
    full_case_study_link: { ar: "/case-studies/1", en: "/case-studies/1" },
    read_case_study_button_text: { ar: "اقرأ", en: "Read" },
    service_ids: [39],
    services: [{ id: 39, title: { ar: "خدمة", en: "Service" } }],
  },
  errors: null,
};

const listResponseArray = {
  status: "true",
  message: "OK",
  data: [createResponse.data],
  errors: null,
};

const listResponseNested = {
  status: "true",
  message: "OK",
  data: { items: [createResponse.data], meta: { total: 1 } },
  errors: null,
};

function assertApiEnvelopeSuccess(data) {
  if (data == null || typeof data !== "object") return;
  const s = data.status;
  if (s === false || s === "false" || s === 0 || s === "0") {
    throw new Error(data.message || "Request failed");
  }
}

function unwrapShowResource(body) {
  assertApiEnvelopeSuccess(body);
  const root = body;
  let data = root.data;
  if (Array.isArray(data)) {
    if (data.length === 1 && data[0] && typeof data[0] === "object") data = data[0];
    else throw new Error("Missing resource");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Missing resource");
  }
  return data;
}

function unwrapDataArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const p = payload;
    const inner =
      p.data ?? p.items ?? p.client_portfolio_items ?? p.client_portfolio;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function extractPortfolioRows(data) {
  const payload = data?.data ?? data;
  const rows = unwrapDataArray(payload ?? {});
  if (rows.length > 0) return rows;
  return unwrapDataArray(data);
}

function normalizeItem(row) {
  return { id: Number(row.id ?? 0), headline: row.headline?.en ?? "" };
}

let failed = 0;
function ok(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`);
    failed += 1;
  } else {
    console.log(`OK: ${name}`);
  }
}

const item = unwrapShowResource(createResponse);
ok("create id", item.id === 1);
ok("create category", item.category === "food_retail");
ok("no slug in payload", item.slug === undefined);

const rowsArray = extractPortfolioRows(listResponseArray);
ok("list array length", rowsArray.length === 1);
ok("list array id", normalizeItem(rowsArray[0]).id === 1);

const rowsNested = extractPortfolioRows(listResponseNested);
ok("list nested items length", rowsNested.length === 1);
ok("list nested id", normalizeItem(rowsNested[0]).id === 1);

try {
  assertApiEnvelopeSuccess({ status: "false", message: "err" });
  ok("false status throws", false);
} catch {
  ok("false status throws", true);
}

console.log(failed ? `\n${failed} failed` : "\nAll parser checks passed.");
process.exit(failed ? 1 : 0);
