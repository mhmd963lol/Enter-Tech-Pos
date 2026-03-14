/**
 * Unit Tests — Core Business Services
 * =====================================
 * Tests for salesService, inventoryService, and financeService.
 * These use pure functions, so no mocking is needed.
 *
 * Run with: npx vitest src/services/__tests__/services.test.ts
 * (requires vitest to be installed: npm i -D vitest)
 */

import { describe, it, expect } from "vitest";
import {
  buildLineItemSnapshot,
  validateSaleStock,
  applyStockDeduction,
  reverseStockDeduction,
} from "../salesService";
import {
  applyPurchaseStock,
  reversePurchaseStock,
  getLowStockProducts,
  getOutOfStockProducts,
} from "../inventoryService";
import {
  calcVaultBalance,
  calcExpenseTotal,
  calcIncomeTotal,
} from "../financeService";
import { roundMoney } from "../../lib/moneyUtils";
import type { Product, CartItem, Order, PurchaseInvoice, Transaction, Expense, Income } from "../../types";

// ─── Test Fixtures ─────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "prod-1",
  name: "Test Product",
  barcode: "123456",
  category: "Electronics",
  price: 100,
  costPrice: 60,
  stock: 10,
  trackInventory: true,
  isActive: true,
  ...overrides,
});

const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  ...makeProduct(),
  quantity: 2,
  ...overrides,
});

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "order-1",
  date: new Date().toISOString(),
  total: 200,
  subtotal: 200,
  tax: 0,
  items: [makeCartItem()],
  status: "completed",
  amountPaid: 200,
  paymentMethod: "cash",
  ...overrides,
});

const makeTransaction = (
  overrides: Partial<Transaction> = {}
): Transaction => ({
  id: "tx-1",
  type: "sale",
  amount: 100,
  date: new Date().toISOString(),
  description: "Test sale",
  vault: "daily",
  ...overrides,
});

// ─── salesService Tests ────────────────────────────────────────────────────────

describe("salesService", () => {
  describe("buildLineItemSnapshot", () => {
    it("captures product state at time of sale", () => {
      const cartItem = makeCartItem({ quantity: 3, customPrice: 90 });
      const snapshot = buildLineItemSnapshot(cartItem);

      expect(snapshot.productId).toBe("prod-1");
      expect(snapshot.name).toBe("Test Product");
      expect(snapshot.unitPrice).toBe(100);
      expect(snapshot.costPrice).toBe(60);
      expect(snapshot.customPrice).toBe(90);
      expect(snapshot.quantity).toBe(3);
      expect(snapshot.totalPrice).toBeCloseTo(270, 2); // 3 × 90
    });

    it("uses regular price when no custom price is set", () => {
      const cartItem = makeCartItem({ quantity: 2 });
      const snapshot = buildLineItemSnapshot(cartItem);
      expect(snapshot.totalPrice).toBeCloseTo(200, 2); // 2 × 100
    });
  });

  describe("validateSaleStock", () => {
    it("passes when stock is sufficient", () => {
      const cart = [makeCartItem({ quantity: 3 })];
      const products = [makeProduct({ stock: 10 })];
      expect(validateSaleStock(cart, products)).toEqual({ valid: true });
    });

    it("fails when stock is too low", () => {
      const cart = [makeCartItem({ quantity: 15 })];
      const products = [makeProduct({ stock: 10 })];
      const result = validateSaleStock(cart, products);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("Test Product");
      }
    });

    it("allows overselling for products with trackInventory=false", () => {
      const cart = [makeCartItem({ quantity: 99 })];
      const products = [makeProduct({ stock: 0, trackInventory: false })];
      expect(validateSaleStock(cart, products)).toEqual({ valid: true });
    });

    it("fails when product not found in catalog", () => {
      const cart = [makeCartItem({ id: "unknown-product" })];
      const products = [makeProduct()];
      const result = validateSaleStock(cart, products);
      expect(result.valid).toBe(false);
    });
  });

  describe("applyStockDeduction", () => {
    it("deducts correct quantity from stock", () => {
      const products = [makeProduct({ stock: 10 })];
      const cart = [makeCartItem({ quantity: 3 })];
      const result = applyStockDeduction(products, cart);
      expect(result[0].stock).toBe(7);
    });

    it("does not go below 0", () => {
      const products = [makeProduct({ stock: 2 })];
      const cart = [makeCartItem({ quantity: 10 })];
      const result = applyStockDeduction(products, cart);
      expect(result[0].stock).toBe(0);
    });

    it("skips non-inventory-tracked products", () => {
      const products = [makeProduct({ stock: 5, trackInventory: false })];
      const cart = [makeCartItem({ quantity: 3 })];
      const result = applyStockDeduction(products, cart);
      expect(result[0].stock).toBe(5); // unchanged
    });
  });

  describe("reverseStockDeduction", () => {
    it("restores stock when order is reversed", () => {
      const products = [makeProduct({ stock: 7 })];
      const order = makeOrder({ items: [makeCartItem({ quantity: 3 })] });
      const result = reverseStockDeduction(products, order);
      expect(result[0].stock).toBe(10);
    });

    it("uses lineItems snapshot if available", () => {
      const products = [makeProduct({ stock: 7 })];
      const order = makeOrder({
        lineItems: [
          {
            productId: "prod-1",
            name: "Test Product",
            barcode: "123456",
            category: "Electronics",
            quantity: 3,
            unitPrice: 100,
            costPrice: 60,
            totalPrice: 300,
          },
        ],
      });
      const result = reverseStockDeduction(products, order);
      expect(result[0].stock).toBe(10);
    });
  });
});

// ─── inventoryService Tests ───────────────────────────────────────────────────

describe("inventoryService", () => {
  describe("applyPurchaseStock", () => {
    it("increases stock correctly", () => {
      const products = [makeProduct({ id: "prod-1", stock: 5 })];
      const purchaseItems = [
        { id: "item-1", productId: "prod-1", name: "Test Product", quantity: 10, costPrice: 50, total: 500 },
      ];
      const result = applyPurchaseStock(products, purchaseItems);
      expect(result[0].stock).toBe(15);
    });

    it("updates cost price when purchase is cheaper", () => {
      const products = [makeProduct({ id: "prod-1", costPrice: 80 })];
      const purchaseItems = [
        { id: "item-1", productId: "prod-1", name: "Test Product", quantity: 5, costPrice: 60, total: 300 },
      ];
      const result = applyPurchaseStock(products, purchaseItems);
      expect(result[0].costPrice).toBe(60);
    });
  });

  describe("getLowStockProducts and getOutOfStockProducts", () => {
    const products = [
      makeProduct({ id: "p1", stock: 0, trackInventory: true }),
      makeProduct({ id: "p2", stock: 2, trackInventory: true, minStockAlert: 5 }),
      makeProduct({ id: "p3", stock: 20, trackInventory: true }),
      makeProduct({ id: "p4", stock: 0, trackInventory: false }), // should be excluded
    ];

    it("correctly identifies out-of-stock products", () => {
      const outOfStock = getOutOfStockProducts(products);
      expect(outOfStock).toHaveLength(1);
      expect(outOfStock[0].id).toBe("p1");
    });

    it("correctly identifies low-stock products", () => {
      const lowStock = getLowStockProducts(products);
      expect(lowStock.some((p) => p.id === "p2")).toBe(true);
    });
  });
});

// ─── financeService Tests ─────────────────────────────────────────────────────

describe("financeService", () => {
  const transactions: Transaction[] = [
    makeTransaction({ type: "sale", amount: 500, vault: "daily" }),
    makeTransaction({ type: "expense", amount: 100, vault: "daily" }),
    makeTransaction({ type: "sale", amount: 300, vault: "main" }),
    makeTransaction({ type: "transfer_in", amount: 200, vault: "main" }),
    makeTransaction({ type: "transfer_out", amount: 200, vault: "daily" }),
  ];

  describe("calcVaultBalance", () => {
    it("calculates daily vault balance correctly", () => {
      const balance = calcVaultBalance(transactions, "daily");
      // daily: +500 (sale) -100 (expense) -200 (transfer_out) = 200
      expect(balance).toBeCloseTo(200, 2);
    });

    it("calculates main vault balance correctly", () => {
      const balance = calcVaultBalance(transactions, "main");
      // main: +300 (sale) +200 (transfer_in) = 500
      expect(balance).toBeCloseTo(500, 2);
    });

    it("calculates total (all) balance", () => {
      const balance = calcVaultBalance(transactions, "all");
      // all: 500 + 300 - 100 + 200 - 200 = 700
      expect(balance).toBeCloseTo(700, 2);
    });
  });

  describe("calcExpenseTotal and calcIncomeTotal", () => {
    const expenses: Expense[] = [
      { id: "e1", amount: 150, category: "Operations", description: "Utilities", date: new Date().toISOString(), type: "general" },
      { id: "e2", amount: 200, category: "Maintenance", description: "Parts", date: new Date().toISOString(), type: "maintenance_parts" },
    ];
    const incomes: Income[] = [
      { id: "i1", amount: 1000, source: "Sales", description: "Walk-in", date: new Date().toISOString() },
    ];

    it("sums expense totals correctly", () => {
      expect(calcExpenseTotal(expenses)).toBeCloseTo(350, 2);
    });

    it("sums income totals correctly", () => {
      expect(calcIncomeTotal(incomes)).toBeCloseTo(1000, 2);
    });
  });
});
