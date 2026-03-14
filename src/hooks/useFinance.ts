import { useState, Dispatch, SetStateAction } from "react";
import { Transaction, Expense, Income, Settings } from "../types";

/**
 * useFinance — Domain hook for financial transaction management.
 * Handles transactions, expenses, and incomes.
 * Extracted from AppContext to reduce god-object coupling.
 */
export function useFinance(settings: Settings) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  const resolveVault = (vault?: string): "main" | "daily" =>
    (vault === "main" || vault === "daily" ? vault : settings.cashTransferMode === "auto" ? "main" : "daily");

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const vault = resolveVault(transaction.vault);
    const newTransaction: Transaction = {
      ...transaction,
      vault,
      id: `TRX-${crypto.randomUUID().slice(0, 8)}`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    // Note: balance reversal is handled by the caller (AppContext) since it
    // requires access to customers/suppliers state.
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const vault = resolveVault(expense.vault);
    const newExpense: Expense = {
      ...expense,
      vault,
      id: `EXP-${crypto.randomUUID().slice(0, 8)}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    // Create a matching payment_out transaction
    addTransaction({
      type: "payment_out",
      amount: newExpense.amount,
      date: new Date().toISOString(),
      description: `مصروف: ${newExpense.description || newExpense.category}`,
      referenceId: newExpense.id,
      entityName: newExpense.category,
      vault,
    });
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addTransaction({
      type: "payment_in",
      amount: expense.amount,
      date: new Date().toISOString(),
      description: `إلغاء مصروف (استرداد): ${expense.description || expense.category}`,
      referenceId: expense.id,
      entityName: expense.category,
      vault: resolveVault(expense.vault),
    });
  };

  const addIncome = (income: Omit<Income, "id">) => {
    const vault = resolveVault(income.vault);
    const newIncome: Income = {
      ...income,
      vault,
      id: `INC-${crypto.randomUUID().slice(0, 8)}`,
    };
    setIncomes((prev) => [newIncome, ...prev]);
    addTransaction({
      type: "payment_in",
      amount: newIncome.amount,
      date: new Date().toISOString(),
      description: `إيراد: ${newIncome.description || newIncome.source}`,
      referenceId: newIncome.id,
      entityName: newIncome.source,
      vault,
    });
  };

  const deleteIncome = (id: string) => {
    const income = incomes.find((i) => i.id === id);
    if (!income) return;
    setIncomes((prev) => prev.filter((i) => i.id !== id));
    addTransaction({
      type: "payment_out",
      amount: income.amount,
      date: new Date().toISOString(),
      description: `إلغاء إيراد (خصم): ${income.description || income.source}`,
      referenceId: income.id,
      entityName: income.source,
      vault: resolveVault(income.vault),
    });
  };

  return {
    transactions,
    setTransactions,
    expenses,
    setExpenses,
    incomes,
    setIncomes,
    addTransaction,
    deleteTransaction,
    addExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
  };
}
