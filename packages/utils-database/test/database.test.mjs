import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeCurrency, prepareTransactionFields, calculateAssetBalance,
  calculateDebtTotals, calculateInvestmentTotals, calculateNetWorth,
  sortByCreatedAt, planInvestmentSale, effectiveCurrentValue,
} from "../dist/index.js";

const lot = (id, createdAt, quantity, investedAmount, currentValue) =>
  Object.freeze({ id, createdAt, quantity, investedAmount, currentValue });

test("normalization preserves currency defaults and transaction preparation", () => {
  assert.equal(normalizeCurrency(" USD "), "USD");
  assert.equal(normalizeCurrency(null), "INR");
  assert.equal(normalizeCurrency(" ", "EUR"), "EUR");
  const data = Object.freeze({ name: " ", type: "expense", date: 1000, categoryId: "category", note: "", isRefund: false,
    payments: [Object.freeze({ assetId: "a", amount: 12 }), Object.freeze({ assetId: "b", amount: 8 })] });
  assert.deepEqual(prepareTransactionFields(data), { name: undefined, type: "expense", date: 1000, categoryId: "category", note: "", isRefund: false, totalAmount: 20 });
  assert.equal(prepareTransactionFields({ ...data, name: " Rent " }).name, "Rent");
  assert.throws(() => prepareTransactionFields({ ...data, categoryId: "" }), /categoryId is required/);
});

test("totals handle empty inputs, losses, and absent EMI amounts", () => {
  assert.equal(calculateAssetBalance([]), 0);
  assert.equal(calculateAssetBalance([{ balance: 12 }, { balance: -2 }]), 10);
  assert.deepEqual(calculateDebtTotals([]), { totalAmount: 0, totalRemaining: 0, totalEmi: 0 });
  assert.deepEqual(calculateDebtTotals([{ totalAmount: 100, remainingAmount: 70 }, { totalAmount: 40, remainingAmount: 20, emiAmount: 5 }]), { totalAmount: 140, totalRemaining: 90, totalEmi: 5 });
  assert.deepEqual(calculateInvestmentTotals([]), { totalInvested: 0, totalCurrentValue: 0, totalGainLoss: 0 });
  assert.deepEqual(calculateInvestmentTotals([{ investedAmount: 100, currentValue: 80 }]), { totalInvested: 100, totalCurrentValue: 80, totalGainLoss: -20 });
});

test("net worth orders mixed Date/numeric updates and limits to five", () => {
  const assets = Object.freeze(Array.from({ length: 6 }, (_, i) => Object.freeze({ id: `${i}`, name: "asset", type: "cash", updatedAt: i, balance: 10 })));
  const investments = [{ id: "investment", name: "shares", type: "stock", updatedAt: new Date(10), currentValue: 50 }];
  const debts = [{ id: "debt", name: "loan", type: "loan", updatedAt: 9, remainingAmount: 20 }];
  const summary = calculateNetWorth(assets, investments, debts);
  assert.equal(summary.netWorth, 90);
  assert.deepEqual(summary.recentUpdates.map(update => [update.id, update.updatedAt]), [["investment", 10], ["debt", 9], ["5", 5], ["4", 4], ["3", 3]]);
  assert.deepEqual(calculateNetWorth([], [], []), { totalAssets: 0, totalInvestments: 0, totalDebts: 0, netWorth: 0, recentUpdates: [] });
});

test("sorting accepts BSON Date values and does not reorder its input", () => {
  const newest = lot("new", new Date(20), 10, 100, 120);
  const oldest = lot("old", 10, 10, 100, 120);
  const input = Object.freeze([newest, oldest]);
  assert.deepEqual(sortByCreatedAt(input), [oldest, newest]);
  assert.deepEqual(input, [newest, oldest]);
});

test("unit FIFO sale consumes the oldest lot and proportionally reduces the next", () => {
  const newest = lot("new", new Date(20), 20, 200, 240);
  const oldest = lot("old", 10, 10, 100, 120);
  const input = Object.freeze([newest, oldest]);
  assert.deepEqual(planInvestmentSale(input, { unitsSold: 15 }), [
    { lot: oldest, changes: { isDeleted: true }, fullyConsumed: true, unitsReduced: 10 },
    { lot: newest, changes: { quantity: 15, investedAmount: 150, currentValue: 180 }, fullyConsumed: false, unitsReduced: 5 },
  ]);
  assert.equal(newest.quantity, 20);
  assert.equal(input[0], newest);
});

test("amount FIFO sale also reduces quantities when present", () => {
  const first = lot("first", 1, undefined, 100, 120);
  const second = lot("second", 2, 20, 200, 240);
  assert.deepEqual(planInvestmentSale([second, first], { soldAmount: 150 }), [
    { lot: first, changes: { isDeleted: true }, fullyConsumed: true, amountReduced: 100 },
    { lot: second, changes: { investedAmount: 150, currentValue: 180, quantity: 15 }, fullyConsumed: false, amountReduced: 50 },
  ]);
  const withoutQuantity = planInvestmentSale([first], { soldAmount: 50 })[0];
  assert.deepEqual(withoutQuantity.changes, { investedAmount: 50, currentValue: 60 });
});

test("positive units take precedence and zero-quantity lots are skipped", () => {
  const noQuantity = lot("missing", 1, undefined, 100, 120);
  const empty = lot("empty", 2, 0, 100, 120);
  const available = lot("available", 3, 10, 100, 120);
  const updates = planInvestmentSale([noQuantity, empty, available], { unitsSold: 5, soldAmount: 500 });
  assert.equal(updates.length, 1);
  assert.equal(updates[0].lot, available);
  assert.deepEqual(updates[0].changes, { quantity: 5, investedAmount: 50, currentValue: 60 });
});

test("over-selling consumes available lots, exact sales delete, and no sale is a no-op", () => {
  const available = lot("available", 1, 10, 100, 120);
  assert.deepEqual(planInvestmentSale([available], { unitsSold: 100 })[0].changes, { isDeleted: true });
  assert.deepEqual(planInvestmentSale([available], { soldAmount: 100 })[0].changes, { isDeleted: true });
  assert.deepEqual(planInvestmentSale([available], {}), []);
  assert.deepEqual(planInvestmentSale([available], { unitsSold: 0, soldAmount: -5 }), []);
  assert.deepEqual(planInvestmentSale([], { unitsSold: 1 }), []);
});

test("value fallback preserves the existing mobile behavior", () => {
  assert.equal(effectiveCurrentValue({ currentValue: 50, investedAmount: 100 }), 50);
  assert.equal(effectiveCurrentValue({ currentValue: 0, investedAmount: 100 }), 100);
});
