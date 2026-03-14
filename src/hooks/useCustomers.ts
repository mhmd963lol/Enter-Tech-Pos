import { useState } from "react";
import { Customer } from "../types";

/**
 * useCustomers — Domain hook for customer management.
 * Extracted from AppContext to reduce god-object coupling.
 */
export function useCustomers(initialCustomers: Customer[] = []) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customer: Omit<Customer, "id" | "balance">): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${crypto.randomUUID().slice(0, 8)}`,
      balance: 0,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updatedFields: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const adjustCustomerBalance = (id: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, balance: c.balance + amount } : c
      )
    );
  };

  return {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    adjustCustomerBalance,
  };
}
