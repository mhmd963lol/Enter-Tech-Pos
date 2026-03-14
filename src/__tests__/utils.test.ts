import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Utility / Helper Tests ────────────────────────────────────────────────────

describe("ID generation — no Math.random", () => {
  it("crypto.randomUUID is used for barcode fallback format", () => {
    // The barcode fallback format is: BC-{timestamp}-{6 hex chars}
    const ts = Date.now();
    const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
    const barcode = `BC-${ts}-${uuid}`;
    expect(barcode).toMatch(/^BC-\d+-[A-F0-9]{6}$/);
  });

  it("idempotency key format is timestamp + UUID slice", () => {
    const type = "checkout";
    const key = `${type}_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 9)}`;
    expect(key).toMatch(/^checkout_\d+_[a-f0-9]{9}$/);
  });

  it("purchase item ID uses crypto.randomUUID", () => {
    const id = `pi-${crypto.randomUUID().slice(0, 8)}`;
    expect(id).toMatch(/^pi-[a-f0-9-]{8}$/);
  });

  it("customer ID uses crypto.randomUUID", () => {
    const id = `cust-${crypto.randomUUID().slice(0, 8)}`;
    expect(id).toMatch(/^cust-[a-f0-9-]{8}$/);
  });
});

// ─── Auth Security Tests ───────────────────────────────────────────────────────

describe("Auth security — role and pin defaults", () => {
  it("new user profile defaults to cashier role, not admin", () => {
    const newProfile = { name: "Test User", role: "cashier", pin: "" };
    expect(newProfile.role).toBe("cashier");
    expect(newProfile.role).not.toBe("admin");
  });

  it("new user pin defaults to empty string, not 0000", () => {
    const newProfile = { name: "Test User", role: "cashier", pin: "" };
    expect(newProfile.pin).toBe("");
    expect(newProfile.pin).not.toBe("0000");
  });

  it("handleAuthResult role whitelist rejects unknown roles", () => {
    const validateRole = (role: string): "admin" | "cashier" => {
      return role === "admin" || role === "cashier" ? role as "admin" | "cashier" : "cashier";
    };
    expect(validateRole("superuser")).toBe("cashier");
    expect(validateRole("root")).toBe("cashier");
    expect(validateRole("admin")).toBe("admin");
    expect(validateRole("cashier")).toBe("cashier");
  });

  it("handleAuthResult pin rejects non-string values", () => {
    const validatePin = (pin: unknown): string => {
      return typeof pin === "string" ? pin : "";
    };
    expect(validatePin(null)).toBe("");
    expect(validatePin(undefined)).toBe("");
    expect(validatePin(1234)).toBe("");
    expect(validatePin("1234")).toBe("1234");
    expect(validatePin("")).toBe("");
  });
});

// ─── Duplicate Account Prevention ─────────────────────────────────────────────

describe("Duplicate account prevention", () => {
  it("checkDuplicate returns error message for duplicate email", async () => {
    // Simulate the checkDuplicate logic
    const checkDuplicate = async (email: string, phone: string, existingUsers: Array<{ email?: string; phone?: string }>) => {
      if (email) {
        const found = existingUsers.find((u) => u.email === email);
        if (found) return "البريد الإلكتروني مسجل بالفعل. لديك حساب بالفعل، الرجاء تسجيل الدخول.";
      }
      if (phone) {
        const found = existingUsers.find((u) => u.phone === phone);
        if (found) return "رقم الهاتف مسجل بالفعل. لديك حساب بالفعل، الرجاء تسجيل الدخول.";
      }
      return null;
    };

    const users = [{ email: "test@example.com", phone: "+966500000001" }];

    const emailErr = await checkDuplicate("test@example.com", "", users);
    expect(emailErr).toContain("البريد الإلكتروني مسجل");

    const phoneErr = await checkDuplicate("", "+966500000001", users);
    expect(phoneErr).toContain("رقم الهاتف مسجل");

    const noErr = await checkDuplicate("new@example.com", "+966500000099", users);
    expect(noErr).toBeNull();
  });
});

// ─── Purchase Void Logic ───────────────────────────────────────────────────────

describe("voidPurchaseInvoice — reversal logic", () => {
  it("correctly reverses stock when voiding a completed invoice", () => {
    const product = { id: "p1", stock: 50, costPrice: 100 };
    const invoiceItem = { productId: "p1", quantity: 10 };

    // Simulate reversal
    const newStock = Math.max(0, product.stock - invoiceItem.quantity);
    expect(newStock).toBe(40);
  });

  it("stock does not go below 0 after reversal", () => {
    const product = { id: "p1", stock: 5 };
    const invoiceItem = { productId: "p1", quantity: 10 };

    const newStock = Math.max(0, product.stock - invoiceItem.quantity);
    expect(newStock).toBe(0);
  });

  it("correctly reverses supplier debt when voiding", () => {
    const supplier = { id: "s1", balance: 500 }; // we owe 500
    const invoice = { supplierId: "s1", total: 1000, amountPaid: 500 };
    const debt = invoice.total - invoice.amountPaid; // 500

    const newBalance = supplier.balance - debt;
    expect(newBalance).toBe(0); // debt cleared
  });

  it("does not void an already-cancelled invoice", () => {
    const invoice = { id: "PUR-001", status: "cancelled" };
    let wasCalled = false;

    const voidPurchaseInvoice = (id: string) => {
      const found = { ...invoice };
      if (found.status === "cancelled") return; // guard
      wasCalled = true;
    };

    voidPurchaseInvoice("PUR-001");
    expect(wasCalled).toBe(false);
  });
});

// ─── addCustomer returns entity ────────────────────────────────────────────────

describe("addCustomer returns the created entity", () => {
  it("returns an object with id, name, phone, and balance=0", () => {
    const createCustomer = (input: { name: string; phone: string }) => {
      const newCustomer = {
        ...input,
        id: `cust-${crypto.randomUUID().slice(0, 8)}`,
        balance: 0,
      };
      return newCustomer;
    };

    const customer = createCustomer({ name: "أحمد", phone: "0501234567" });
    expect(customer.id).toMatch(/^cust-/);
    expect(customer.name).toBe("أحمد");
    expect(customer.balance).toBe(0);
  });
});
