import assert from "node:assert/strict";
import test from "node:test";
import { chartFetch, fetchStockQuote } from "../dist/index.js";

const response = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});
const chart = (meta) => ({ chart: { result: [{ meta }] } });

test("quotes use the injected transport and preserve normalized metadata", async () => {
  const requests = [];
  const fetch = async (...args) => {
    requests.push(args);
    return response(chart({
      symbol: "RELIANCE.NS", shortName: "Reliance", longName: "Reliance Industries",
      regularMarketPrice: 1250, currency: "INR", instrumentType: "EQUITY",
    }));
  };
  assert.deepEqual(await fetchStockQuote(" reliance ", "NSE", {
    fetch, headers: { "User-Agent": "Mozilla/5.0" },
  }), {
    symbol: "RELIANCE.NS", name: "Reliance", price: 1250, currency: "INR", instrumentType: "EQUITY",
  });
  assert.equal(requests[0][0], "https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS?interval=1d&range=1d");
  assert.deepEqual(requests[0][1].headers, { "User-Agent": "Mozilla/5.0" });
});

test("default fetch uses no custom header, encodes symbols and supports metadata fallbacks", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (...args) => {
    requests.push(args);
    return response(chart({ regularMarketPrice: 85 }));
  });
  assert.equal((await chartFetch("USDINR=X")).regularMarketPrice, 85);
  assert.match(requests[0][0], /USDINR%3DX\?/);
  assert.equal(requests[0][1].headers, undefined);
  assert.deepEqual(await fetchStockQuote("abc", "NASDAQ"), {
    symbol: "ABC", name: "ABC", price: 85, currency: "USD", instrumentType: "",
  });
  assert.equal((await fetchStockQuote("abc", "NASDAQ", {
    fetch: async () => response(chart({ regularMarketPrice: 10, longName: "Full Name" })),
  })).name, "Full Name");
});

test("chart errors, missing prices and transport failures reject without a fabricated quote", async () => {
  await assert.rejects(chartFetch("BAD", {
    fetch: async () => response({ chart: { error: { description: "Unknown symbol" } } }, 404),
  }), /Unknown symbol/);
  for (const body of [null, {}, { chart: { result: [] } }]) {
    await assert.rejects(chartFetch("BAD", {
      fetch: async () => response(body),
    }), /No data found for "BAD"/);
  }
  await assert.rejects(chartFetch("BAD", {
    fetch: async () => response(chart({ regularMarketPrice: 10 }), 500),
  }), /No data found/);
  for (const meta of [undefined, {}, { regularMarketPrice: 0 }, { regularMarketPrice: "10" }]) {
    await assert.rejects(chartFetch("BAD", {
      fetch: async () => response(chart(meta)),
    }), /No price available/);
  }
  await assert.rejects(fetchStockQuote("abc", "NASDAQ", {
    fetch: async () => { throw new Error("Offline"); },
  }), /Offline/);
  await assert.rejects(chartFetch("BAD", {
    fetch: async () => new Response("invalid json"),
  }), SyntaxError);
});

test("USD/INR lookup caches successful and concurrent calls with the caller's transport", async () => {
  const { getUsdToInrRate } = await import("../dist/stock-quotes.js?rate-success");
  const requests = [];
  let complete;
  const pending = new Promise((resolve) => { complete = resolve; });
  const options = {
    headers: { "User-Agent": "Mozilla/5.0" },
    fetch: async (...args) => {
      requests.push(args);
      await pending;
      return response(chart({ regularMarketPrice: 86.5 }));
    },
  };
  const first = getUsdToInrRate(options);
  const second = getUsdToInrRate(options);
  assert.equal(requests.length, 1);
  assert.match(requests[0][0], /USDINR%3DX\?/);
  assert.deepEqual(requests[0][1].headers, options.headers);
  complete();
  assert.deepEqual(await Promise.all([first, second]), [86.5, 86.5]);
  assert.equal(await getUsdToInrRate({
    fetch: async () => { throw new Error("Cached lookup must not fetch again"); },
  }), 86.5);
  assert.equal(requests.length, 1);
});

test("USD/INR lookup caches the existing offline fallback", async () => {
  const { getUsdToInrRate } = await import("../dist/stock-quotes.js?rate-offline");
  let requests = 0;
  const options = { fetch: async () => {
    requests += 1;
    throw new Error("Offline");
  } };
  assert.equal(await getUsdToInrRate(options), 84);
  assert.equal(await getUsdToInrRate(options), 84);
  assert.equal(requests, 1);
});

test("USD/INR lookup falls back when the chart has no price", async () => {
  const { getUsdToInrRate } = await import("../dist/stock-quotes.js?rate-missing");
  assert.equal(await getUsdToInrRate({
    fetch: async () => response(chart({})),
  }), 84);
});
