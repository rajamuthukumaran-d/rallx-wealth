import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCurrency, formatFullCurrency, getCurrencySymbol,
  formatIndian, parseIndian, formatUnits,
  formatRelativeDate, formatDueDate, capitalise, getInitials, getUniqueTypes,
  groupByType, groupBySymbol, buildYahooSymbol, mapInstrumentType, convertToInr,
} from "../dist/index.js";

test("display formatting preserves mobile defaults and signed boundaries", () => {
  assert.equal(getCurrencySymbol("usd"), "$");
  assert.equal(getCurrencySymbol("XYZ"), "XYZ");
  assert.equal(formatCurrency(-1250000, "$"), "-$1.3M");
  assert.equal(formatCurrency(1000), "₹1.0k");
  assert.equal(formatCurrency(999), "₹999");
  assert.equal(formatCurrency(0), "₹0");
  assert.equal(formatFullCurrency(-1234567), "-₹12,34,567");
  assert.equal(formatUnits(2), "2");
  assert.equal(formatUnits(2.125), "2.1250");
});

test("editable number formatting retains decimals, empty input and parse fallbacks", () => {
  for (const [input, expected] of [
    ["1234567.50", "12,34,567.50"], ["12,34,567.50", "12,34,567.50"],
    ["1234.", "1,234."], [".50", ".50"], ["", ""], ["bad", "bad"],
  ]) assert.equal(formatIndian(input), expected);
  assert.equal(parseIndian("12,34,567.50"), 1234567.5);
  assert.equal(parseIndian(""), 0);
  assert.equal(parseIndian("bad"), 0);
});

test("dates and text retain existing display labels", (t) => {
  const now = new Date(2026, 0, 15, 12).getTime();
  t.mock.method(Date, "now", () => now);
  assert.equal(formatRelativeDate(now), "Today");
  assert.equal(formatRelativeDate(now - 86400000), "Yesterday");
  assert.equal(formatRelativeDate(now - 3 * 86400000), "3 days ago");
  assert.equal(formatRelativeDate(now - 8 * 86400000), "Jan 7");
  assert.equal(formatDueDate(), "—");
  assert.equal(formatDueDate(now), "Jan 15");
  assert.equal(capitalise("stock"), "Stock");
  assert.equal(getInitials(""), "");
  assert.equal(getInitials("Acme Global Fund"), "AG");
  assert.equal(getUniqueTypes([]), "No items yet");
  assert.equal(getUniqueTypes([
    { type: "stock" }, { type: "stock" }, { type: "gold" },
    { type: "crypto" }, { type: "bonds" },
  ]), "Stock • Gold • Crypto");
});

test("grouping accepts immutable plain records and handles inherited object key names", () => {
  const records = Object.freeze([
    Object.freeze({ id: "a", type: "stock", symbol: "acme" }),
    Object.freeze({ id: "b", type: "stock", symbol: "ACME" }),
    Object.freeze({ id: "c", type: "gold" }),
    Object.freeze({ id: "d", type: "gold", symbol: null }),
  ]);
  const grouped = groupByType(records);
  assert.deepEqual(grouped, [["stock", [records[0], records[1]]], ["gold", [records[2], records[3]]]]);
  assert.equal(grouped[0][1][0], records[0]);
  grouped[0][1].pop();
  assert.equal(records.length, 4);
  assert.deepEqual(groupBySymbol(records), [
    ["ACME", [records[0], records[1]]], ["__solo__c", [records[2]]], ["__solo__d", [records[3]]],
  ]);
  assert.deepEqual(groupByType([]), []);
  assert.deepEqual(groupBySymbol([]), []);
  assert.deepEqual(groupByType([{ type: "__proto__" }, { type: "constructor" }]), [
    ["__proto__", [{ type: "__proto__" }]], ["constructor", [{ type: "constructor" }]],
  ]);
  assert.deepEqual(groupBySymbol([{ id: "e", symbol: "__proto__" }]), [
    ["__PROTO__", [{ id: "e", symbol: "__proto__" }]],
  ]);
});

test("stock helpers work without a fetch transport", () => {
  assert.equal(buildYahooSymbol(" reliance ", "NSE"), "RELIANCE.NS");
  assert.equal(buildYahooSymbol("reliance", "BSE"), "RELIANCE.BO");
  assert.equal(buildYahooSymbol("aapl", "NASDAQ"), "AAPL");
  assert.equal(buildYahooSymbol("abc", "unknown"), "ABC");
  assert.equal(mapInstrumentType("equity"), "stock");
  assert.equal(mapInstrumentType("MUTUALFUND"), "mutual_fund");
  assert.equal(mapInstrumentType("unknown"), "");
  assert.equal(convertToInr(10, "USD", 85), 850);
  assert.equal(convertToInr(10, "INR", 85), 10);
  assert.equal(convertToInr(10, "EUR", 85), 10);
});
