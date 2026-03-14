import { useState } from "react";
import { Supplier } from "../types";

/**
 * useSuppliers — Domain hook for supplier management.
 * Extracted from AppContext to reduce god-object coupling.
 */
export function useSuppliers(initialSuppliers: Supplier[] = []) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  const addSupplier = (supplier: Omit<Supplier, "id" | "balance">) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${crypto.randomUUID().slice(0, 8)}`,
      balance: 0,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updatedFields: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    suppliers,
    setSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
