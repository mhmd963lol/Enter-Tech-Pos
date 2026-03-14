import { Transaction, Expense, Income, Settings, Customer, Supplier } from "../types";
import { roundMoney } from "../lib/moneyUtils";

/**
 * Calculates the total cash balance for a given vault.
 */
export function calcVaultBalance(
  transactions: Transaction[],
  vault: "daily" | "main" | "all"
): number {
  return roundMoney(
    transactions
      .filter((t) => vault === "all" || t.vault === vault || t.vault === undefined)
      .reduce((sum, t) => {
        if (t.type === "payment_in" || t.type === "sale") return sum + t.amount;
        if (t.type === "payment_out" || t.type === "expense" || t.type === "transfer_out")
          return sum - t.amount;
        if (t.type === "transfer_in") return sum + t.amount;
        return sum;
      }, 0)
  );
}

/**
 * Calculates total expenses.
 */
export function calcTotalExpenses(expenses: Expense[]): number {
  return roundMoney(expenses.reduce((sum, e) => sum + e.amount, 0));
}

/**
 * Calculates total income recorded manually.
 */
export function calcTotalIncome(incomes: Income[]): number {
  return roundMoney(incomes.reduce((sum, i) => sum + i.amount, 0));
}

/**
 * Determines the vault a cash transaction should go to.
 */
export function resolveVault(
  paymentMethod: string,
  settings: Settings
): "daily" | "main" | undefined {
  if (paymentMethod !== "cash") return undefined;
  return settings.cashTransferMode === "auto" ? "main" : "daily";
}

/**
 * Creates a transfer transaction from daily to main vault.
 */
export function buildVaultTransfer({
  amount,
  userId,
  userName,
  note,
}: {
  amount: number;
  userId: string;
  userName: string;
  note?: string;
}): {
  transferOut: Omit<Transaction, "id">;
  transferIn: Omit<Transaction, "id">;
} {
  const now = new Date().toISOString();
  return {
    transferOut: {
      type: "transfer_out",
      amount,
      date: now,
      description: note || "تحويل من اليومية إلى الصندوق",
      vault: "daily",
      userId,
      userName,
    },
    transferIn: {
      type: "transfer_in",
      amount,
      date: now,
      description: note || "استلام من اليومية",
      vault: "main",
      userId,
      userName,
    },
  };
}

/**
 * Applies a customer balance change (e.g., debt collection).
 */
export function adjustCustomerBalance(
  customers: Customer[],
  customerId: string,
  delta: number
): Customer[] {
  return customers.map((c) => {
    if (c.id === customerId) {
      return { ...c, balance: roundMoney(c.balance + delta) };
    }
    return c;
  });
}

/**
 * Applies a supplier balance change.
 */
export function adjustSupplierBalance(
  suppliers: Supplier[],
  supplierId: string,
  delta: number
): Supplier[] {
  return suppliers.map((s) => {
    if (s.id === supplierId) {
      return { ...s, balance: roundMoney(s.balance + delta) };
    }
    return s;
  });
}
