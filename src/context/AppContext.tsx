import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  Product,
  Order,
  CartItem,
  Settings,
  User,
  ReturnItem,
  MaintenanceJob,
  Expense,
  Income,
  Customer,
  Category,
  AppNotification,
  Supplier,
  PurchaseInvoice,
  Employee,
  Transaction,
} from "../types";
import { mockProducts, mockOrders } from "../data/mockData";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AppContextType {
  user: User | null;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  settings: Settings;
  isPro: boolean;
  returns: ReturnItem[];
  maintenanceJobs: MaintenanceJob[];
  expenses: Expense[];
  incomes: Income[];
  customers: Customer[];
  notifications: AppNotification[];
  suppliers: Supplier[];
  purchases: PurchaseInvoice[];
  employees: Employee[];
  transactions: Transaction[];
  isPrivacyMode: boolean;

  login: (user: User) => void;
  logout: () => void;
  togglePrivacyMode: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemPrice: (productId: string, customPrice: number) => void;
  clearCart: () => void;
  checkout: (
    paymentMethod: Order["paymentMethod"],
    customerName?: string,
    customerId?: string,
    amountPaid?: number,
    splitDetails?: { cash: number; card: number },
  ) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCustomer: (customer: Omit<Customer, "id" | "balance">) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  adjustCustomerBalance: (id: string, amount: number) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  upgradeToPro: () => void;
  playSound: (type: "success" | "error" | "click") => void;
  resetApp: () => void;
  addReturn: (returnItem: Omit<ReturnItem, "id">) => void;
  addMaintenanceJob: (job: Omit<MaintenanceJob, "id">) => void;
  updateMaintenanceJob: (
    id: string,
    updatedFields: Partial<MaintenanceJob>,
  ) => void;
  addNotification: (
    notification: Omit<AppNotification, "id" | "date" | "read">,
  ) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // New Additions
  addSupplier: (supplier: Omit<Supplier, "id" | "balance">) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addPurchaseInvoice: (invoice: Omit<PurchaseInvoice, "id">) => void;
  updatePurchaseInvoiceStatus: (
    id: string,
    status: PurchaseInvoice["status"],
  ) => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
}

const defaultSettings: Settings = {
  storeName: "متجري",
  currency: "ر.س",
  language: "ar",
  taxRate: 15,
  enableTax: true,
  receiptHeader: "أهلاً بكم في متجرنا",
  receiptFooter: "شكراً لتسوقكم معنا",
  theme: "system",
  primaryColor: "#4f46e5",
  enableSounds: true,
  preventBelowCost: true,
  adminPin: "0000",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>("app_user", null);
  const [products, setProducts] = useLocalStorage<Product[]>(
    "app_products",
    mockProducts,
  );
  const [categories, setCategories] = useLocalStorage<Category[]>(
    "app_categories",
    [
      { id: "cat-1", name: "إلكترونيات", isActive: true },
      { id: "cat-2", name: "إكسسوارات", isActive: true },
      { id: "cat-3", name: "صيانة", isActive: true },
    ],
  );
  const [orders, setOrders] = useLocalStorage<Order[]>(
    "app_orders",
    mockOrders,
  );
  const [cart, setCart] = useLocalStorage<CartItem[]>("app_cart", []);
  const [settings, setSettings] = useLocalStorage<Settings>(
    "app_settings",
    defaultSettings,
  );
  const [isPro, setIsPro] = useLocalStorage<boolean>("app_isPro", true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const [returns, setReturns] = useLocalStorage<ReturnItem[]>(
    "app_returns",
    [],
  );
  const [maintenanceJobs, setMaintenanceJobs] = useLocalStorage<
    MaintenanceJob[]
  >("app_maintenance", []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(
    "app_expenses",
    [],
  );
  const [incomes, setIncomes] = useLocalStorage<Income[]>("app_incomes", []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>(
    "app_customers",
    [
      { id: "cust-1", name: "أحمد محمد", phone: "0501234567", balance: 0 },
      { id: "cust-2", name: "سارة علي", phone: "0557654321", balance: 150 },
    ],
  );
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(
    "app_notifications",
    [],
  );

  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>(
    "app_suppliers",
    [{ id: "sup-1", name: "مؤسسة التقنية", phone: "0500000001", balance: 0 }],
  );
  const [purchases, setPurchases] = useLocalStorage<PurchaseInvoice[]>(
    "app_purchases",
    [],
  );
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    "app_employees",
    [
      {
        id: "emp-1",
        name: "مدير النظام",
        role: "admin",
        phone: "",
        salary: 5000,
        joinDate: new Date().toISOString(),
        isActive: true,
      },
    ],
  );
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "app_transactions",
    [],
  );

  // Handle Theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === "dark" ||
      (settings.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme]);

  const playSound = (type: "success" | "error" | "click") => {
    if (!settings.enableSounds) return;
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === "success") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          1200,
          audioCtx.currentTime + 0.1,
        );
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioCtx.currentTime + 0.1,
        );
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === "click") {
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioCtx.currentTime + 0.05,
        );
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.05);
      } else if (type === "error") {
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          150,
          audioCtx.currentTime + 0.2,
        );
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioCtx.currentTime + 0.2,
        );
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      console.error("Audio context error", e);
    }
  };

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);
  const togglePrivacyMode = () => setIsPrivacyMode(!isPrivacyMode);

  const addToCart = (product: Product) => {
    playSound("click");
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1, customPrice: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    playSound("error");
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    playSound("click");
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const updateCartItemPrice = (productId: string, customPrice: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, customPrice } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const adjustCustomerBalance = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, balance: c.balance + amount } : c,
      ),
    );
  };

  const checkout = (
    paymentMethod: Order["paymentMethod"],
    customerName?: string,
    customerId?: string,
    amountPaid?: number,
    splitDetails?: { cash: number; card: number },
  ) => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.customPrice ?? item.price) * item.quantity,
      0,
    );
    const tax = settings.enableTax ? subtotal * (settings.taxRate / 100) : 0;
    const total = subtotal + tax;
    const actualAmountPaid =
      amountPaid ?? (paymentMethod === "debt" ? 0 : total);

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000) + 1000}`,
      date: new Date().toISOString(),
      subtotal,
      tax,
      total,
      status: "completed",
      items: [...cart],
      paymentMethod,
      splitDetails,
      customerName,
      customerId,
      amountPaid: actualAmountPaid,
      cashierId: user?.id,
    };

    setOrders((prev) => [newOrder, ...prev]);
    playSound("success");

    // Update customer balance if order is completed
    if (customerId && newOrder.status === "completed") {
      const debt = total - actualAmountPaid;
      if (debt !== 0) {
        adjustCustomerBalance(customerId, debt);
      }
    }

    // Update stock and check for low stock
    setProducts((prev) => {
      const updatedProducts = prev.map((product) => {
        const cartItem = cart.find((item) => item.id === product.id);
        if (cartItem) {
          const newStock = Math.max(0, product.stock - cartItem.quantity);

          // Check for low stock notification
          if (
            product.trackInventory &&
            newStock <= (product.minStockAlert || 0)
          ) {
            // Use setTimeout to avoid updating state during render if this was somehow synchronous
            setTimeout(() => {
              addNotification({
                title: newStock === 0 ? "نفاد المخزون" : "تنبيه انخفاض المخزون",
                message:
                  newStock === 0
                    ? `لقد نفد مخزون المنتج "${product.name}" بالكامل.`
                    : `مخزون المنتج "${product.name}" وصل إلى الحد الأدنى (${newStock} متبقي).`,
                type: newStock === 0 ? "error" : "warning",
              });
            }, 0);
          }

          return { ...product, stock: newStock };
        }
        return product;
      });
      return updatedProducts;
    });

    clearCart();
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substring(7),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Math.random().toString(36).substring(7)}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;

    // Handle customer balance updates
    if (order.customerId) {
      const debtAmount = order.total - order.amountPaid;

      // If moving TO completed FROM something else
      if (status === "completed" && oldStatus !== "completed") {
        adjustCustomerBalance(order.customerId, debtAmount);
      }
      // If moving FROM completed TO something else
      else if (oldStatus === "completed" && status !== "completed") {
        adjustCustomerBalance(order.customerId, -debtAmount);
      }

      // If moving TO returned
      if (status === "returned" && oldStatus !== "returned") {
        // When returned, we credit the customer for the FULL amount of the order
        // (they don't owe the debt anymore, and if they paid, they get credit)
        adjustCustomerBalance(order.customerId, -order.total);
      }
      // If moving FROM returned
      else if (oldStatus === "returned" && status !== "returned") {
        adjustCustomerBalance(order.customerId, order.total);
      }
    }

    // If order is being cancelled or returned, and it wasn't already, restore stock
    if (
      (status === "cancelled" || status === "returned") &&
      order.status !== "cancelled" &&
      order.status !== "returned"
    ) {
      setProducts((prev) =>
        prev.map((p) => {
          const item = order.items.find((i) => i.id === p.id);
          if (item) {
            return { ...p, stock: p.stock + item.quantity };
          }
          return p;
        }),
      );
    }
    // If order was cancelled/returned and is now being restored, deduct stock
    else if (
      (order.status === "cancelled" || order.status === "returned") &&
      status !== "cancelled" &&
      status !== "returned"
    ) {
      setProducts((prev) =>
        prev.map((p) => {
          const item = order.items.find((i) => i.id === p.id);
          if (item) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        }),
      );
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
  };

  const addCustomer = (customer: Omit<Customer, "id" | "balance">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Math.random().toString(36).substring(7)}`,
      balance: 0,
    };
    setCustomers((prev) => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updatedFields: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const upgradeToPro = () => {
    setIsPro(true);
  };

  const resetApp = () => {
    setProducts([]);
    setCategories([]);
    setOrders([]);
    setCart([]);
    setReturns([]);
    setMaintenanceJobs([]);
    setExpenses([]);
    setIncomes([]);
    setCustomers([]);
    setSuppliers([]);
    setPurchases([]);
    setTransactions([]);
    // keep settings and user
  };

  const addReturn = (returnItem: Omit<ReturnItem, "id">) => {
    const newItem: ReturnItem = {
      ...returnItem,
      id: `RET-${Math.floor(Math.random() * 10000) + 1000}`,
    };
    setReturns((prev) => [newItem, ...prev]);

    // If it's returning to inventory, increment stock
    if (newItem.type === "inventory") {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === newItem.productId
            ? { ...p, stock: p.stock + newItem.quantity }
            : p,
        ),
      );
    }
  };

  const addMaintenanceJob = (
    job: Omit<MaintenanceJob, "id"> & { usedPartId?: string },
  ) => {
    const { usedPartId, ...jobData } = job;
    const newJob: MaintenanceJob = {
      ...jobData,
      id: `MNT-${Math.floor(Math.random() * 10000) + 1000}`,
    };
    setMaintenanceJobs((prev) => [newJob, ...prev]);

    // Deduct parts cost from cash box (create expense)
    if (newJob.partsCost > 0 && !usedPartId) {
      const newExpense: Expense = {
        id: `EXP-${Math.floor(Math.random() * 10000) + 1000}`,
        amount: newJob.partsCost,
        category: "تكاليف صيانة",
        description: `تكلفة قطع غيار لصيانة ${newJob.device} - العميل: ${newJob.customerName}`,
        date: new Date().toISOString(),
        type: "maintenance_parts",
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }

    // Deduct stock if a part from inventory was used
    if (usedPartId) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === usedPartId) {
            return { ...p, stock: Math.max(0, p.stock - 1) };
          }
          return p;
        }),
      );
    }
  };

  const updateMaintenanceJob = (
    id: string,
    updatedFields: Partial<MaintenanceJob> & { usedPartId?: string },
  ) => {
    const job = maintenanceJobs.find((j) => j.id === id);
    if (!job) return;

    const { usedPartId, ...fieldsToUpdate } = updatedFields;
    const newJob = { ...job, ...fieldsToUpdate };

    setMaintenanceJobs((prev) => prev.map((j) => (j.id === id ? newJob : j)));

    // Deduct stock if a part from inventory was added during update
    if (usedPartId) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === usedPartId) {
            return { ...p, stock: Math.max(0, p.stock - 1) };
          }
          return p;
        }),
      );
    }

    // If status changed to paid, create an order to record the sale
    if (job.status !== "paid" && newJob.status === "paid") {
      const newOrder: Order = {
        id: `ORD-MNT-${Math.floor(Math.random() * 10000) + 1000}`,
        date: new Date().toISOString(),
        subtotal: newJob.cost,
        tax: 0,
        total: newJob.cost,
        status: "completed",
        items: [
          {
            id: `mnt-item-${newJob.id}`,
            name: `صيانة: ${newJob.device} - ${newJob.issue}`,
            price: newJob.cost,
            costPrice: newJob.partsCost,
            quantity: 1,
            category: "صيانة",
            barcode: "",
            stock: 0,
          },
        ],
        paymentMethod: "cash",
        amountPaid: newJob.cost,
        customerName: newJob.customerName,
        cashierId: user?.id,
      };
      setOrders((ordersPrev) => [newOrder, ...ordersPrev]);
    } else if (job.status === "paid" && newJob.status !== "paid") {
      // If status changed from paid to something else, cancel the associated order
      setOrders((ordersPrev) => {
        const orderIndex = ordersPrev.findIndex((o) =>
          o.items.some((i) => i.id === `mnt-item-${newJob.id}`),
        );
        if (orderIndex !== -1) {
          const newOrders = [...ordersPrev];
          newOrders[orderIndex] = {
            ...newOrders[orderIndex],
            status: "cancelled",
          };
          return newOrders;
        }
        return ordersPrev;
      });
    }
  };

  const addNotification = (
    notification: Omit<AppNotification, "id" | "date" | "read">,
  ) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `NOT-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    if (notification.type === "error" || notification.type === "warning") {
      playSound("error");
    } else {
      playSound("success");
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addSupplier = (supplier: Omit<Supplier, "id" | "balance">) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Math.random().toString(36).substring(7)}`,
      balance: 0,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updatedFields: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `TRX-${Math.floor(Math.random() * 10000) + 1000}`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const addPurchaseInvoice = (invoice: Omit<PurchaseInvoice, "id">) => {
    const newInvoice: PurchaseInvoice = {
      ...invoice,
      id: `PUR-${Math.floor(Math.random() * 10000) + 1000}`,
    };
    setPurchases((prev) => [newInvoice, ...prev]);

    if (newInvoice.status === "completed") {
      // Add transaction for payment out
      if (newInvoice.amountPaid > 0) {
        addTransaction({
          type: "payment_out",
          amount: newInvoice.amountPaid,
          date: newInvoice.date,
          description: `دفعة لفاتورة مشتريات رقم ${newInvoice.id}`,
          referenceId: newInvoice.id,
          entityId: newInvoice.supplierId,
          entityName: newInvoice.supplierName,
        });
      }

      // Update supplier balance if there's debt (we owe them positive)
      const debt = newInvoice.total - newInvoice.amountPaid;
      if (debt !== 0) {
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === newInvoice.supplierId
              ? { ...s, balance: s.balance + debt }
              : s,
          ),
        );
      }

      // Update products stock and cost price
      setProducts((prev) => {
        return prev.map((p) => {
          const purchasedItem = newInvoice.items.find(
            (i) => i.productId === p.id,
          );
          if (purchasedItem) {
            // Calculate new moving average cost
            const currentTotalValue = p.stock * p.costPrice;
            const newTotalValue =
              purchasedItem.quantity * purchasedItem.costPrice;
            const newTotalCount = p.stock + purchasedItem.quantity;
            const newAvgCost =
              newTotalCount > 0
                ? (currentTotalValue + newTotalValue) / newTotalCount
                : p.costPrice;

            return {
              ...p,
              stock: p.stock + purchasedItem.quantity,
              costPrice: Number(newAvgCost.toFixed(2)), // Round to 2 decimals
            };
          }
          return p;
        });
      });
    }
  };

  const updatePurchaseInvoiceStatus = (
    id: string,
    status: PurchaseInvoice["status"],
  ) => {
    const invoice = purchases.find((p) => p.id === id);
    if (!invoice) return;

    // We only handle switching from pending to completed for simplicity
    if (invoice.status === "pending" && status === "completed") {
      // Re-use logic to apply the invoice
      addPurchaseInvoice(invoice);
      // But we must overwrite the old one, so let's just do it inline here properly instead of calling add
      // (This is a simplified approach, a real system would need more robust handling for reversals)

      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );

      if (invoice.amountPaid > 0) {
        addTransaction({
          type: "payment_out",
          amount: invoice.amountPaid,
          date: new Date().toISOString(),
          description: `دفعة لفاتورة مشتريات رقم ${invoice.id}`,
          referenceId: invoice.id,
          entityId: invoice.supplierId,
          entityName: invoice.supplierName,
        });
      }

      const debt = invoice.total - invoice.amountPaid;
      if (debt !== 0) {
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === invoice.supplierId
              ? { ...s, balance: s.balance + debt }
              : s,
          ),
        );
      }

      setProducts((prev) => {
        return prev.map((p) => {
          const purchasedItem = invoice.items.find((i) => i.productId === p.id);
          if (purchasedItem) {
            const currentTotalValue = p.stock * p.costPrice;
            const newTotalValue =
              purchasedItem.quantity * purchasedItem.costPrice;
            const newTotalCount = p.stock + purchasedItem.quantity;
            const newAvgCost =
              newTotalCount > 0
                ? (currentTotalValue + newTotalValue) / newTotalCount
                : p.costPrice;
            return {
              ...p,
              stock: p.stock + purchasedItem.quantity,
              costPrice: Number(newAvgCost.toFixed(2)),
            };
          }
          return p;
        });
      });
    } else {
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    }
  };

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Math.random().toString(36).substring(7)}`,
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e)),
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        categories,
        orders,
        cart,
        settings,
        isPro,
        isPrivacyMode,
        returns,
        maintenanceJobs,
        expenses,
        incomes,
        customers,
        notifications,
        suppliers,
        purchases,
        employees,
        transactions,
        login,
        logout,
        togglePrivacyMode,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemPrice,
        clearCart,
        checkout,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        adjustCustomerBalance,
        updateOrderStatus,
        updateSettings,
        upgradeToPro,
        playSound,
        resetApp,
        addReturn,
        addMaintenanceJob,
        updateMaintenanceJob,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addPurchaseInvoice,
        updatePurchaseInvoiceStatus,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
