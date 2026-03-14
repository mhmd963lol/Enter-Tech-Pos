import { Product, CartItem, Order, ReturnItem, Settings, SystemLog } from "../types";
import { roundMoney, calcSubtotal, calcTax, calcProfit } from "../lib/moneyUtils";

export type SaleResult =
  | { success: true; order: Order }
  | { success: false; error: string };

/**
 * Builds a line-item snapshot — persists product name/price at time of sale.
 * This prevents data corruption if a product is later edited/deleted.
 */
export function buildLineItemSnapshot(cartItem: CartItem) {
  return {
    productId: cartItem.id,
    name: cartItem.name,
    barcode: cartItem.barcode,
    category: cartItem.category,
    categoryId: cartItem.categoryId,
    quantity: cartItem.quantity,
    unitPrice: cartItem.price,          // Price AT time of sale
    costPrice: cartItem.costPrice,      // Cost AT time of sale
    customPrice: cartItem.customPrice,
    totalPrice: cartItem.quantity * (cartItem.customPrice ?? cartItem.price),
  };
}

/**
 * Validates cart constraints against current inventory.
 */
export function validateSaleStock(
  cart: CartItem[],
  products: Product[]
): { valid: true } | { valid: false; error: string } {
  for (const item of cart) {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      return { valid: false, error: `المنتج "${item.name}" لم يعد متوفراً` };
    }
    if (
      product.trackInventory !== false &&
      product.stock < item.quantity
    ) {
      return {
        valid: false,
        error: `المنتج "${item.name}" لا يوجد منه كمية كافية (متوفر: ${product.stock})`,
      };
    }
  }
  return { valid: true };
}

/**
 * Constructs a fully-formed Order object from cart + payment details.
 * Includes a historical snapshot of line items.
 */
export function buildSaleOrder({
  cart,
  paymentMethod,
  customerName,
  customerId,
  amountPaid,
  splitDetails,
  settings,
  userId,
  orderId,
}: {
  cart: CartItem[];
  paymentMethod: Order["paymentMethod"];
  customerName?: string;
  customerId?: string;
  amountPaid?: number;
  splitDetails?: { cash: number; card: number };
  settings: Settings;
  userId?: string;
  orderId: string;
}): Order {
  const subtotal = calcSubtotal(cart);
  const tax = calcTax(subtotal, settings.taxRate, settings.enableTax);
  const total = roundMoney(subtotal + tax);
  const profit = calcProfit(cart);

  const resolvedAmountPaid =
    paymentMethod === "debt"
      ? 0
      : paymentMethod === "split" && splitDetails
      ? splitDetails.cash + splitDetails.card
      : (amountPaid ?? total);

  const vault =
    paymentMethod === "cash"
      ? settings.cashTransferMode === "auto"
        ? "main"
        : "daily"
      : undefined;

  return {
    id: orderId,
    items: cart,
    // Historical snapshot — crucial for report accuracy
    lineItems: cart.map(buildLineItemSnapshot),
    subtotal,
    tax,
    total,
    profit,
    paymentMethod,
    status: "completed",
    date: new Date().toISOString(),
    customerName: customerName || "عميل عام",
    customerId,
    amountPaid: resolvedAmountPaid,
    change: paymentMethod === "cash" ? roundMoney(resolvedAmountPaid - total) : 0,
    splitDetails,
    taxRate: settings.taxRate,
    vault,
    createdBy: userId,
  };
}

/**
 * Applies stock deduction after a sale is confirmed.
 */
export function applyStockDeduction(
  products: Product[],
  cart: CartItem[]
): Product[] {
  return products.map((product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem && product.trackInventory !== false) {
      return {
        ...product,
        stock: Math.max(0, product.stock - cartItem.quantity),
      };
    }
    return product;
  });
}

/**
 * Reverses stock deduction when a sale is cancelled.
 */
export function reverseStockDeduction(
  products: Product[],
  order: Order
): Product[] {
  return products.map((product) => {
    const lineItem = (order.lineItems ?? order.items)?.find(
      (item) => (item as any).productId === product.id || (item as any).id === product.id
    );
    if (lineItem && product.trackInventory !== false) {
      return {
        ...product,
        stock: product.stock + lineItem.quantity,
      };
    }
    return product;
  });
}

/**
 * Applies stock increase when a return is processed.
 */
export function applyReturnStock(
  products: Product[],
  returnItem: ReturnItem
): Product[] {
  return products.map((product) => {
    const returnedItem = returnItem.items?.find(
      (i) => (i as any).productId === product.id || (i as any).id === product.id
    );
    if (returnedItem && product.trackInventory !== false) {
      return {
        ...product,
        stock: product.stock + returnedItem.quantity,
      };
    }
    return product;
  });
}
