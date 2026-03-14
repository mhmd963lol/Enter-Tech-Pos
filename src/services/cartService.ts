/**
 * Cart Service — Business logic for cart and checkout operations
 * Extracted from AppContext for separation of concerns
 */

import type { CartItem, Product, Order, Settings, User } from "../types";
import { calcSubtotal, calcTax, calcProfit, roundMoney } from "../lib/moneyUtils";

/** Calculate full cart summary */
export function calculateCartSummary(
  cart: CartItem[],
  settings: Settings
): { subtotal: number; tax: number; total: number; profit: number } {
  const subtotal = calcSubtotal(cart);
  const tax = calcTax(subtotal, settings.taxRate, settings.enableTax);
  const total = roundMoney(subtotal + tax);
  const profit = calcProfit(cart);
  return { subtotal, tax, total, profit };
}

/** Validate stock availability before adding to cart */
export function validateStock(
  product: Product,
  cart: CartItem[]
): { ok: boolean; message?: string } {
  const existing = cart.find((item) => item.id === product.id);

  if (product.trackInventory === false) {
    return { ok: true };
  }

  if (!existing && product.stock <= 0) {
    return { ok: false, message: "المنتج نافذ من المخزون" };
  }

  if (existing && existing.quantity >= product.stock) {
    return { ok: false, message: `لا يوجد مخزون كافي. المتبقي: ${product.stock}` };
  }

  return { ok: true };
}

/** Build a new Order object from cart data */
export function buildOrder(params: {
  cart: CartItem[];
  settings: Settings;
  user: User | null;
  orders: Order[];
  paymentMethod: Order["paymentMethod"];
  customerName?: string;
  customerId?: string;
  amountPaid?: number;
  splitDetails?: { cash: number; card: number };
}): Order {
  const { cart, settings, user, orders, paymentMethod, customerName, customerId, amountPaid, splitDetails } = params;
  const { subtotal, tax, total, profit } = calculateCartSummary(cart, settings);
  const actualAmountPaid = amountPaid ?? (paymentMethod === "debt" ? 0 : total);

  const today = new Date().toISOString().split("T")[0];
  const dailyNumber = orders.filter((o) => o.date.startsWith(today)).length + 1;

  const isCash = paymentMethod === "cash" || paymentMethod === "split";
  const vault = isCash ? (settings.cashTransferMode === "auto" ? "main" : "daily") : undefined;

  return {
    id: `ORD-${crypto.randomUUID().slice(0, 8)}`,
    dailyNumber,
    date: new Date().toISOString(),
    subtotal,
    tax,
    total,
    profit,
    status: "completed",
    items: [...cart],
    paymentMethod,
    splitDetails,
    customerName,
    customerId,
    amountPaid: actualAmountPaid,
    cashierId: user?.id,
    cashierName: user?.name,
    vault,
  };
}
