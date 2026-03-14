/**
 * Validation Service — Protects data integrity
 * Validates orders and cart data before saving
 */

import type { CartItem, Order, Product, User } from "../types";
import { roundMoney, multiplyMoney } from "../lib/moneyUtils";

/**
 * Validate that cart prices match actual product prices.
 * Detects client-side price tampering.
 */
export function validateCartPrices(
  cart: CartItem[],
  products: Product[],
  user: User | null
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const item of cart) {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      issues.push(`المنتج "${item.name}" غير موجود في قاعدة البيانات`);
      continue;
    }

    // Check if quantity exceeds stock (when tracking inventory)
    if (product.trackInventory !== false && item.quantity > product.stock) {
      issues.push(`الكمية المطلوبة (${item.quantity}) تتجاوز المخزون (${product.stock}) للمنتج "${item.name}"`);
    }

    // Check for negative quantities
    if (item.quantity <= 0) {
      issues.push(`كمية غير صالحة للمنتج "${item.name}"`);
    }

    // Protect against base price tampering
    if (item.price !== product.price) {
      issues.push(`تلاعب في السعر الأساسي للمنتج "${item.name}"`);
    }

    // Role-Based Access Control: only admins can apply custom prices
    if (item.customPrice !== undefined && item.customPrice !== product.price) {
      if (user?.role !== "admin") {
        issues.push(`ليس لديك صلاحية لتعديل سعر المنتج "${item.name}"`);
      }
    }

    // Check for negative prices
    if ((item.customPrice ?? item.price) < 0) {
      issues.push(`سعر سالب للمنتج "${item.name}"`);
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validate order integrity before saving.
 * Recalculates totals server-side to prevent manipulation.
 */
export function validateOrderIntegrity(order: Order): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Recalculate subtotal from items
  const calculatedSubtotal = roundMoney(
    order.items.reduce(
      (sum, item) => sum + multiplyMoney(item.customPrice ?? item.price, item.quantity),
      0
    )
  );

  if (Math.abs(calculatedSubtotal - order.subtotal) > 0.01) {
    issues.push(`المجموع الفرعي غير متطابق: المحسوب=${calculatedSubtotal} المرسل=${order.subtotal}`);
  }

  // Validate total = subtotal + tax
  const expectedTotal = roundMoney(order.subtotal + order.tax);
  if (Math.abs(expectedTotal - order.total) > 0.01) {
    issues.push(`الإجمالي غير متطابق: المتوقع=${expectedTotal} المرسل=${order.total}`);
  }

  // Amount paid should not be negative
  if (order.amountPaid < 0) {
    issues.push("المبلغ المدفوع سالب");
  }

  return { valid: issues.length === 0, issues };
}
