import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
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
  SystemLog,
} from "../types";
import { mockProducts, mockOrders } from "../data/mockData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { Wifi, WifiOff, RefreshCcw } from "lucide-react";
import { roundMoney, calcSubtotal, calcTax, calcProfit } from "../lib/moneyUtils";
import { buildOrder, validateStock } from "../services/cartService";
import { validateOrderIntegrity, validateCartPrices } from "../services/validationService";
import { enqueueOperation, getQueuedOperations, clearQueue } from "../services/offlineQueue";
import { deleteImage } from "../lib/storageUtils";
import { useTheme } from "../hooks/useTheme";
import { useSoundSystem } from "../hooks/useSoundSystem";
import { useFirebaseSync } from "../hooks/useFirebaseSync";
import { buildSaleOrder, applyStockDeduction } from "../services/salesService";


interface AppContextType {
  user: User | null;
  isAuthLoading: boolean;
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
  /** Returns the newly created Customer entity (including the generated id) */
  addCustomer: (customer: Omit<Customer, "id" | "balance">) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  adjustCustomerBalance: (id: string, amount: number) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  upgradeToPro: () => void;
  playSound: (type: "success" | "error" | "click" | "login_success" | "logout") => void;
  resetApp: () => Promise<void>;
  exportData: () => any;
  importData: (data: any) => Promise<void>;
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
  deleteNotification: (id: string) => void;
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
  /** Void a completed purchase invoice — fully reverses stock, supplier balance, and logs to audit */
  voidPurchaseInvoice: (id: string, reason?: string) => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<Income, "id">) => void;
  deleteIncome: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  logs: SystemLog[];
  addLog: (log: Omit<SystemLog, "id" | "date" | "userId" | "userName">) => void;
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  collectDebt: (customerId: string, amount: number, paymentMethod: "cash" | "card") => void;
  voidOrder: (orderId: string, reason?: string) => void;
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'error';
}

const defaultSettings: Settings = {
  storeName: "كاشير تك",
  currency: "ر.س",
  exchangeRate: 1,
  setupCompleted: false,
  language: "ar",
  taxRate: 15,
  enableTax: true,
  receiptHeader: "أهلاً بكم في متجرنا",
  receiptFooter: "شكراً لتسوقكم معنا",
  theme: "system",
  masterTheme: "default",
  activeTheme: "indigo",
  cardStyle: "default",
  borderRadius: "default",
  primaryColor: "#4f46e5",
  sidebarColor: "#4f46e5",
  navbarColor: "#4f46e5",
  backgroundColor: "#f9fafb",
  glassOpacity: 0.8,
  animationSpeed: "normal",
  enableSounds: true,
  preventBelowCost: true,
  adminPin: "",  // No default PIN — admin must set from Settings on first use
  disableAnimations: false,
  dashboardLayout: {
    showSales: true,
    showOrders: true,
    showProducts: true,
    showInventoryValue: true,
    showChart: true,
    showRecentOrders: true,
    showLowStock: true,
    showFastActions: true,
  },
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useLocalStorage<boolean>("app_cart_open", false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>("app_sidebar_collapsed", false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // Exchange Rate (live)
  const {
    rate: exchangeRate,
    isRateLive,
    rateSource,
    rateTimestamp,
    refresh: refreshExchangeRate,
  } = useExchangeRate();

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
  const [logs, setLogs] = useLocalStorage<SystemLog[]>("app_logs", []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);



  // Handle Authentication and Real-time Snapshot listeners
  // Ref to hold the active Firestore snapshot unsubscriber so we can clean it up
  // whenever the authenticated user changes or logs out.
  const snapshotUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Always clean up the previous snapshot listener before creating a new one
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
        snapshotUnsubRef.current = null;
      }

      if (firebaseUser) {
        // Real-time listener for this user's data in Firestore
        const unsub = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.products) setProducts(data.products);
              if (data.categories) setCategories(data.categories);
              if (data.orders) setOrders(data.orders);
              if (data.cart) setCart(data.cart);
              if (data.settings) setSettings(data.settings);
              if (data.returns) setReturns(data.returns);
              if (data.maintenanceJobs) setMaintenanceJobs(data.maintenanceJobs);
              if (data.expenses) setExpenses(data.expenses);
              if (data.incomes) setIncomes(data.incomes);
              if (data.customers) setCustomers(data.customers);
              if (data.notifications) setNotifications(data.notifications);
              if (data.suppliers) setSuppliers(data.suppliers);
              if (data.purchases) setPurchases(data.purchases);
              if (data.employees) setEmployees(data.employees);
              if (data.transactions) setTransactions(data.transactions);
              if (data.logs) setLogs(data.logs);
              setSyncStatus('synced');
            }
            setIsAuthLoading(false);
          },
          (error) => {
            console.error("Firestore snapshot error:", error);
            setSyncStatus('error');
            setIsAuthLoading(false);
          }
        );

        // Store the unsubscriber in the ref so we can clean up on next auth change
        snapshotUnsubRef.current = unsub;
      } else {
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      // Also clean up any active snapshot when the component unmounts
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
        snapshotUnsubRef.current = null;
      }
    };
  }, []);

  // ─── Firebase Sync (extracted to hook) ────────────────────────────────────────
  const syncData = useMemo(() => ({
    products, categories, orders, cart, settings, returns,
    maintenanceJobs, expenses, incomes, customers,
    notifications, suppliers, purchases, employees, transactions,
    logs: logs || []
  }), [
    products, categories, orders, cart, settings, returns,
    maintenanceJobs, expenses, incomes, customers,
    notifications, suppliers, purchases, employees, transactions, logs
  ]);

  useFirebaseSync({
    userId: user?.id,
    isOnline,
    data: syncData,
    setSyncStatus,
  });

  // ─── Theme Management ─────────────────────────────────────────────────────
  useTheme(settings);

  // ─── Sound System ──────────────────────────────────────────────────────────
  const { playSound } = useSoundSystem(settings);

  const login = (userData: User) => setUser(userData);
  const logout = async () => {
    playSound("logout");
    if (user) {
      addLog({
        action: "تسجيل خروج",
        details: `تسجيل خروج المستخدم: ${user.name}`,
        type: "security",
      });
    }
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };
  const togglePrivacyMode = () => setIsPrivacyMode(!isPrivacyMode);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing && product.trackInventory !== false && existing.quantity >= product.stock) {
      addNotification({
        title: "عذراً",
        message: `لا يوجد مخزون كافي. المتبقي: ${product.stock}`,
        type: "warning",
      });
      playSound("error");
      return;
    }
    if (!existing && product.trackInventory !== false && product.stock <= 0) {
      addNotification({
        title: "عذراً",
        message: `المنتج نافذ من المخزون`,
        type: "error",
      });
      playSound("error");
      return;
    }

    playSound("click");
    setCart((prev) => {
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
    const product = products.find(p => p.id === productId);
    if (product && product.trackInventory !== false && quantity > product.stock) {
      addNotification({
        title: "عذراً",
        message: `أقصى كمية متوفرة هي ${product.stock}`,
        type: "warning",
      });
      playSound("error");
      quantity = product.stock;
    }
    if (quantity === 0) {
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

    // Validate cart integrity before checkout
    const validation = validateCartPrices(cart, products, user);
    if (!validation.valid) {
      addNotification({
        title: "خطأ في البيانات",
        message: validation.issues[0],
        type: "error",
      });
      return;
    }

    // Build order using precision-safe calculations
    const newOrder = buildOrder({
      cart, settings, user, orders,
      paymentMethod, customerName, customerId, amountPaid, splitDetails,
    });

    // Validate order integrity
    const orderValidation = validateOrderIntegrity(newOrder);
    if (!orderValidation.valid) {
      addNotification({
        title: "خطأ في الحساب",
        message: orderValidation.issues[0],
        type: "error",
      });
      return;
    }

    setOrders((prev) => [newOrder, ...prev]);
    addLog({
      action: "بيع طلب",
      details: `إتمام عملية بيع برقم ${newOrder.id} - الإجمالي: ${newOrder.total} - الربح: ${newOrder.profit}`,
      type: "sale"
    });
    playSound("success");

    // Update customer balance if order is completed
    if (customerId && newOrder.status === "completed") {
      const debt = roundMoney(newOrder.total - newOrder.amountPaid);
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

          if (
            product.trackInventory &&
            newStock <= (product.minStockAlert || 0)
          ) {
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

  const collectDebt = (customerId: string, amount: number, paymentMethod: "cash" | "card") => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || amount <= 0) return;

    adjustCustomerBalance(customerId, -amount);

    // Create a virtual order or transaction for this payment to reflect in Ghalla
    const transactionId = `PAY-${Date.now()}`;
    const newTransaction: Transaction = {
      id: transactionId,
      type: "payment_in",
      amount: amount,
      date: new Date().toISOString(),
      description: `تحصيل دين من العميل: ${customer.name}`,
      entityId: customerId,
      entityName: customer.name
    };

    addTransaction(newTransaction);

    addLog({
      action: "تحصيل دين",
      details: `تم تحصيل مبلغ ${amount} من ${customer.name} عبر ${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}`,
      type: "sale"
    });

    addNotification({
      title: "تم التحصيل",
      message: `تم استلام ${amount} من العميل ${customer.name}`,
      type: "success"
    });

    playSound("success");
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
    };
    setProducts((prev) => [...prev, newProduct]);
    addLog({
      action: "إضافة صنف",
      details: `تم إضافة صنف جديد: ${newProduct.name} - السعر: ${newProduct.price}`,
      type: "inventory"
    });
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
    );
    const product = products.find(p => p.id === id);
    if (product) {
      addLog({
        action: "تعديل صنف",
        details: `تعديل بيانات الصنف: ${product.name}`,
        type: "inventory"
      });
    }
  };

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product?.image && product.image.includes('firebasestorage')) {
      deleteImage(product.image).catch(() => {});
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (product) {
      addLog({
        action: "حذف صنف",
        details: `تم حذف الصنف: ${product.name}`,
        type: "inventory"
      });
    }
  };

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    if (updatedFields.name) {
      const oldCategory = categories.find((c) => c.id === id);
      if (oldCategory && oldCategory.name !== updatedFields.name) {
        // Update the category string and categoryId in all corresponding products
        setProducts((prev) =>
          prev.map((p) => {
            if (p.categoryId === id || p.category === oldCategory.name) {
              return {
                ...p,
                categoryId: id,
                category: updatedFields.name!,
              };
            }
            return p;
          })
        );
      }
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
    );
  };

  const deleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category?.image && category.image.includes('firebasestorage')) {
      deleteImage(category.image).catch(() => {});
    }
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

    // If order is being cancelled, restore stock
    if (
      status === "cancelled" &&
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
    // If order was cancelled and is now being restored, deduct stock
    else if (
      order.status === "cancelled" &&
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

  /**
   * Soft-delete: marks an order as 'void' preserving the audit trail.
   * Restores stock and reverses customer balance automatically.
   */
  const voidOrder = (orderId: string, reason = "إلغاء محاسبي") => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === "void") return;

    // Restore stock if previously completed
    if (order.status === "completed" || order.status === "processing") {
      setProducts((prev) =>
        prev.map((p) => {
          const item = (order.lineItems ?? order.items).find(
            (i) => ('productId' in i ? i.productId : i.id) === p.id
          );
          if (item && p.trackInventory !== false) {
            return { ...p, stock: p.stock + item.quantity };
          }
          return p;
        })
      );
    }

    // Reverse customer debt if needed
    if (order.customerId && order.status === "completed") {
      const debt = roundMoney(order.total - order.amountPaid);
      if (debt !== 0) adjustCustomerBalance(order.customerId, -debt);
    }

    // Mark as void (soft-delete — data is preserved for audit)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "void" as Order["status"], returnReason: reason } : o
      )
    );

    addLog({
      action: "إلغاء محاسبي",
      details: `تم إلغاء الطلب ${orderId} محاسبياً. السبب: ${reason}`,
      type: "security",
    });

    addNotification({
      title: "تم الإلغاء المحاسبي",
      message: `الطلب ${orderId} تم إلغاؤه والمخزون استُعيد.`,
      type: "warning",
    });
  };

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

  const resetApp = async () => {
    try {
      if (user?.id) {
        const emptyData = {
          products: [],
          categories: [],
          orders: [],
          cart: [],
          returns: [],
          maintenanceJobs: [],
          expenses: [],
          incomes: [],
          customers: [],
          suppliers: [],
          purchases: [],
          employees: [],
          transactions: [],
          logs: [],
          settings: defaultSettings,
        };
        await setDoc(doc(db, "users", user.id), emptyData);
      }
    } catch (error) {
      console.error("Failed to wipe data from server", error);
    }
    
    // Clear local storage wiping any offline queue or cached data
    localStorage.clear();

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
    setEmployees([]);
    setLogs([]);
    setSettings(defaultSettings);
  };

  const exportData = () => {
    return {
      products,
      categories,
      orders,
      cart,
      returns,
      maintenanceJobs,
      expenses,
      incomes,
      customers,
      suppliers,
      purchases,
      transactions,
      employees,
      logs,
      settings,
      version: "2.0",
      exportDate: new Date().toISOString()
    };
  };

  const importData = async (data: any) => {
    if (!data) throw new Error("بيانات فارغة");
    
    // First clear everything securely
    await resetApp();

    // Now inject data
    if (data.products) setProducts(data.products);
    if (data.categories) setCategories(data.categories);
    if (data.orders) setOrders(data.orders);
    if (data.cart) setCart(data.cart);
    if (data.returns) setReturns(data.returns);
    if (data.maintenanceJobs) setMaintenanceJobs(data.maintenanceJobs);
    if (data.expenses) setExpenses(data.expenses);
    if (data.incomes) setIncomes(data.incomes);
    if (data.customers) setCustomers(data.customers);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.purchases) setPurchases(data.purchases);
    if (data.transactions) setTransactions(data.transactions);
    if (data.employees) setEmployees(data.employees);
    if (data.logs) setLogs(data.logs);
    if (data.settings) setSettings(data.settings);
    
    // Force immediate sync to firestore by setting syncStatus. Effect will pick up the populated arrays.
  };

  const addReturn = (returnItem: Omit<ReturnItem, "id">) => {
    const newItem: ReturnItem = {
      ...returnItem,
      id: `RET-${crypto.randomUUID().slice(0, 8)}`,
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
      id: `MNT-${crypto.randomUUID().slice(0, 8)}`,
    };
    setMaintenanceJobs((prev) => [newJob, ...prev]);

    // Deduct parts cost from cash box (create expense)
    if (newJob.partsCost > 0 && !usedPartId) {
      const newExpense: Expense = {
        id: `EXP-${crypto.randomUUID().slice(0, 8)}`,
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
        id: `ORD-MNT-${crypto.randomUUID().slice(0, 8)}`,
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
      id: `NOT-${crypto.randomUUID().slice(0, 8)}`,
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

  const addLog = (logData: Omit<SystemLog, "id" | "date" | "userId" | "userName">) => {
    const d = new Date();
    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    
    const newLog: SystemLog = {
      ...logData,
      id: `LOG-${crypto.randomUUID().slice(0, 8)}`,
      date: formattedDate,
      userId: user?.id || "system",
      userName: user?.name || "النظام",
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

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
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const vault = transaction.vault || (settings.cashTransferMode === "auto" ? "main" : "daily");
    const newTransaction: Transaction = {
      ...transaction,
      vault,
      id: `TRX-${crypto.randomUUID().slice(0, 8)}`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (transaction.entityId) {
      if (transaction.type === "payment_in") {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === transaction.entityId
              ? { ...c, balance: c.balance + transaction.amount }
              : c,
          ),
        );
      } else if (transaction.type === "payment_out") {
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === transaction.entityId
              ? { ...s, balance: s.balance + transaction.amount }
              : s,
          ),
        );
      }
    }

    addLog({
      action: "إلغاء سند مالي",
      details: `تم إلغاء حركة بمبلغ ${transaction.amount} - ${transaction.description}`,
      type: "system",
    });
  };

  const addPurchaseInvoice = (invoice: Omit<PurchaseInvoice, "id">) => {
    const newInvoice: PurchaseInvoice = {
      ...invoice,
      id: `PUR-${crypto.randomUUID().slice(0, 8)}`,
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

    // Handle switching from pending to completed
    if (invoice.status === "pending" && status === "completed") {
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

      addLog({
        action: "اعتماد مشتريات",
        details: `تم اعتماد فاتورة مشتريات رقم ${invoice.id} وإضافة الأصناف للمخزون`,
        type: "inventory",
      });
    } else if (invoice.status === "completed" && status === "cancelled") {
      // Handle Reverse Transactions for Cancelled Invoices
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );

      // Reverse payment out
      if (invoice.amountPaid > 0) {
        addTransaction({
          type: "payment_in", // Refund from supplier
          amount: invoice.amountPaid,
          date: new Date().toISOString(),
          description: `استرداد دفعة (إلغاء فاتورة مشتريات رقم ${invoice.id})`,
          referenceId: invoice.id,
          entityId: invoice.supplierId,
          entityName: invoice.supplierName,
        });
      }

      // Reverse supplier debt
      const debt = invoice.total - invoice.amountPaid;
      if (debt !== 0) {
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === invoice.supplierId
              ? { ...s, balance: s.balance - debt }
              : s,
          ),
        );
      }

      // Reverse products stock
      setProducts((prev) => {
        return prev.map((p) => {
          const purchasedItem = invoice.items.find((i) => i.productId === p.id);
          if (purchasedItem) {
            return {
              ...p,
              stock: Math.max(0, p.stock - purchasedItem.quantity),
            };
          }
          return p;
        });
      });

      addLog({
        action: "إلغاء مشتريات",
        details: `تم إلغاء فاتورة مشتريات رقم ${invoice.id} وتم التراجع عن المخزون والمالية`,
        type: "system",
      });
    } else {
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    }
  };

  /**
   * Void a completed purchase invoice.
   * Fully reverses: stock removed, supplier balance corrected, payment-in reversal created.
   * Writes an audit log entry with the provided reason.
   */
  const voidPurchaseInvoice = (id: string, reason = "إلغاء محاسبي") => {
    const invoice = purchases.find((p) => p.id === id);
    if (!invoice) return;
    if (invoice.status === "cancelled") return; // already voided

    const wasCompleted = invoice.status === "completed";

    // Step 1: Mark as cancelled
    setPurchases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "cancelled" as PurchaseInvoice["status"] } : p))
    );

    if (wasCompleted) {
      // Step 2: Reverse stock
      setProducts((prev) =>
        prev.map((p) => {
          const item = invoice.items.find((i) => i.productId === p.id);
          if (item) return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          return p;
        })
      );

      // Step 3: Reverse supplier debt
      const debt = invoice.total - invoice.amountPaid;
      if (debt !== 0) {
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === invoice.supplierId ? { ...s, balance: s.balance - debt } : s
          )
        );
      }

      // Step 4: Create reversal transaction for amount already paid
      if (invoice.amountPaid > 0) {
        addTransaction({
          type: "payment_in",
          amount: invoice.amountPaid,
          date: new Date().toISOString(),
          description: `استرداد دفعة — إلغاء فاتورة ${invoice.id} — السبب: ${reason}`,
          referenceId: invoice.id,
          entityId: invoice.supplierId,
          entityName: invoice.supplierName,
        });
      }
    }

    // Step 5: Audit log
    addLog({
      action: "إلغاء محاسبي - مشتريات",
      details: `إلغاء فاتورة ${invoice.id}. السبب: ${reason}. الإجمالي: ${invoice.total}`,
      type: "security",
    });

    addNotification({
      title: "تم الإلغاء المحاسبي",
      message: `فاتورة المشتريات ${invoice.id} تم إلغاؤها والمخزون استُعيد.`,
      type: "warning",
    });
  };

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${crypto.randomUUID().slice(0, 8)}`,
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

  const addExpense = (expense: Omit<Expense, "id">) => {
    const vault = expense.vault || (settings.cashTransferMode === "auto" ? "main" : "daily");
    const newExpense: Expense = {
      ...expense,
      vault,
      id: `EXP-${crypto.randomUUID().slice(0, 8)}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    addTransaction({
      type: "payment_out",
      amount: newExpense.amount,
      date: new Date().toISOString(),
      description: `مصروف: ${newExpense.description || newExpense.category}`,
      referenceId: newExpense.id,
      entityName: newExpense.category,
      vault,
    });

    addLog({
      action: "إضافة مصروف",
      details: `تم إضافة مصروف بقيمة ${newExpense.amount} - ${newExpense.category}`,
      type: "system"
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
      vault: expense.vault || (settings.cashTransferMode === "auto" ? "main" : "daily"),
    });

    addLog({
      action: "إلغاء مصروف",
      details: `تم إلغاء مصروف بقيمة ${expense.amount} - ${expense.category}`,
      type: "system"
    });
  };

  const addIncome = (income: Omit<Income, "id">) => {
    const vault = income.vault || (settings.cashTransferMode === "auto" ? "main" : "daily");
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

    addLog({
      action: "إضافة إيراد",
      details: `تم إضافة إيراد بقيمة ${newIncome.amount} - ${newIncome.source}`,
      type: "system"
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
      vault: income.vault || (settings.cashTransferMode === "auto" ? "main" : "daily"),
    });

    addLog({
      action: "إلغاء إيراد",
      details: `تم إلغاء إيراد بقيمة ${income.amount} - ${income.source}`,
      type: "system"
    });
  };

  // Debt Reminder System
  useEffect(() => {
    const checkDebtReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Remind at 1:00 PM (13) and 8:00 PM (20)
      const isReminderTime = currentHour === 13 || currentHour === 20;

      if (isReminderTime) {
        customers.forEach(customer => {
          if (customer.balance > 0) {
            const todayStr = now.toISOString().split('T')[0];
            const nextReminderStr = customer.nextReminderDate ? customer.nextReminderDate.split('T')[0] : null;

            // If nextReminderDate is set and it's in the future, skip
            if (nextReminderStr && nextReminderStr > todayStr) return;

            const nowSlotStr = todayStr + "-" + currentHour;
            // Check if we already reminded for this specific hour slot
            if (customer.lastReminderSlot !== nowSlotStr) {
              addNotification({
                title: "تذكير بمستحقات",
                message: `العميل ${customer.name} لديه ديون مستحقة بقيمة ${customer.balance} ${settings.currency}`,
                type: "warning",
              });

              updateCustomer(customer.id, { lastReminderSlot: nowSlotStr });
            }
          }
        });
      }
    };

    // Run every hour to check the time
    const interval = setInterval(checkDebtReminders, 3600000);
    checkDebtReminders(); // Initial check

    return () => clearInterval(interval);
  }, [customers, settings.currency]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAuthLoading,
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
    exportData,
    importData,
    addReturn,
    addMaintenanceJob,
    updateMaintenanceJob,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    clearNotifications,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addPurchaseInvoice,
    updatePurchaseInvoiceStatus,
    voidPurchaseInvoice,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    deleteTransaction,
    addTransaction,
    deferredPrompt,
    setDeferredPrompt,
    exchangeRate,
    isRateLive,
    rateSource,
    rateTimestamp,
    refreshExchangeRate,
    isCartOpen,
    setIsCartOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    collectDebt,
    voidOrder,
    logs,
    addLog,
    isOnline,
    syncStatus,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    user, isAuthLoading, products, categories, orders, cart, settings,
    isPro, isPrivacyMode, returns, maintenanceJobs, expenses, incomes,
    customers, notifications, suppliers, purchases, employees, transactions,
    deferredPrompt, isCartOpen, isSidebarCollapsed, logs, isOnline, syncStatus,
    exchangeRate, isRateLive, rateSource, rateTimestamp,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
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
