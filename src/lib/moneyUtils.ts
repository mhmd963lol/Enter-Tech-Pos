/**
 * Money Utility Functions
 * Prevents floating-point precision errors in financial calculations.
 * e.g. 0.1 + 0.2 = 0.30000000000000004 → fixed to 0.3
 */

/** Round a monetary amount to 2 decimal places */
export const roundMoney = (amount: number): number =>
  Math.round(amount * 100) / 100;

/** Safe sum of monetary amounts */
export const sumMoney = (...amounts: number[]): number =>
  roundMoney(amounts.reduce((a, b) => a + b, 0));

/** Safe multiplication (price × quantity) */
export const multiplyMoney = (price: number, qty: number): number =>
  roundMoney(price * qty);

/** Calculate line total for a cart item */
export const lineTotal = (price: number, qty: number): number =>
  multiplyMoney(price, qty);

/** Calculate subtotal from array of {price, quantity} */
export const calcSubtotal = (
  items: { price: number; customPrice?: number; quantity: number }[]
): number =>
  roundMoney(
    items.reduce(
      (sum, item) => sum + multiplyMoney(item.customPrice ?? item.price, item.quantity),
      0
    )
  );

/** Calculate tax amount */
export const calcTax = (subtotal: number, taxRate: number, enabled: boolean): number =>
  enabled ? roundMoney(subtotal * (taxRate / 100)) : 0;

/** Calculate profit from cart items with cost prices */
export const calcProfit = (
  items: { price: number; customPrice?: number; costPrice: number; quantity: number }[]
): number =>
  roundMoney(
    items.reduce(
      (sum, item) =>
        sum + multiplyMoney((item.customPrice ?? item.price) - item.costPrice, item.quantity),
      0
    )
  );
