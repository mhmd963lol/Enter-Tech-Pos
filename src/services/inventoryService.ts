import { Product, PurchaseInvoice, PurchaseItem } from "../types";

/**
 * Applies stock increases from a purchase invoice.
 * Accepts either a full PurchaseInvoice or a raw PurchaseItem array for flexibility.
 * Also recalculates the moving-average cost price.
 */
export function applyPurchaseStock(
  products: Product[],
  invoiceOrItems: PurchaseInvoice | PurchaseItem[]
): Product[] {
  const items = Array.isArray(invoiceOrItems) ? invoiceOrItems : invoiceOrItems.items;
  return products.map((product) => {
    const lineItem = items?.find(
      (item) => item.productId === product.id || item.id === product.id
    );
    if (lineItem && product.trackInventory !== false) {
      // Moving average cost price
      const currentTotalValue = product.stock * product.costPrice;
      const newTotalValue = lineItem.quantity * lineItem.costPrice;
      const newTotalCount = product.stock + lineItem.quantity;
      const newAvgCost = newTotalCount > 0
        ? (currentTotalValue + newTotalValue) / newTotalCount
        : lineItem.costPrice;
      return {
        ...product,
        stock: product.stock + lineItem.quantity,
        costPrice: Number(newAvgCost.toFixed(2)),
      };
    }
    return product;
  });
}

/**
 * Reverses stock changes when a purchase invoice is cancelled/voided.
 */
export function reversePurchaseStock(
  products: Product[],
  invoice: PurchaseInvoice
): Product[] {
  return products.map((product) => {
    const lineItem = invoice.items?.find(
      (item) => item.productId === product.id || item.id === product.id
    );
    if (lineItem && product.trackInventory !== false) {
      return {
        ...product,
        stock: Math.max(0, product.stock - lineItem.quantity),
      };
    }
    return product;
  });
}

/**
 * Checks if a given stock adjustment would result in negative inventory.
 */
export function wouldCauseNegativeStock(
  products: Product[],
  productId: string,
  quantityToRemove: number
): boolean {
  const product = products.find((p) => p.id === productId);
  if (!product || product.trackInventory === false) return false;
  return product.stock - quantityToRemove < 0;
}

/**
 * Adjusts inventory for a single product.
 * Returns null if the product is not found.
 */
export function adjustProductStock(
  products: Product[],
  productId: string,
  delta: number
): Product[] {
  return products.map((p) => {
    if (p.id === productId && p.trackInventory !== false) {
      return { ...p, stock: Math.max(0, p.stock + delta) };
    }
    return p;
  });
}

/**
 * Returns products that are below their minimum stock alert threshold.
 */
export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter(
    (p) =>
      p.trackInventory !== false &&
      p.minStockAlert != null &&
      p.stock <= p.minStockAlert
  );
}

/**
 * Returns products that are completely out of stock.
 */
export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter(
    (p) => p.trackInventory !== false && p.stock === 0
  );
}
