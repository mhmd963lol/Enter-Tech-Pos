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
  SystemLog,
} from "../types";
import { mockProducts, mockOrders } from "../data/mockData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, enableIndexedDbPersistence, collection } from "firebase/firestore";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { Wifi, WifiOff, RefreshCcw } from "lucide-react";


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
  addCustomer: (customer: Omit<Customer, "id" | "balance">) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  adjustCustomerBalance: (id: string, amount: number) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  upgradeToPro: () => void;
  playSound: (type: "success" | "error" | "click" | "login_success" | "logout") => void;
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
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<Income, "id">) => void;
  deleteIncome: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  logs: SystemLog[];
  addLog: (log: Omit<SystemLog, "id" | "date" | "userId" | "userName">) => void;
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  collectDebt: (customerId: string, amount: number, paymentMethod: "cash" | "card") => void;
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

  // Enable Offline Persistence
  useEffect(() => {
    if (db) {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
        } else if (err.code === 'unimplemented') {
          console.warn("The current browser does not support all of the features required to enable persistence.");
        }
      });
    }
  }, []);

  // Handle Authentication and Real-time Snapshot listeners
  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Real-time listener for user data
        const unsubscribeSnapshot = onSnapshot(doc(db, "users", firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            // Only update if not coming from local changes (to avoid loops) or use meta properly
            // Firestore handles local latency compensation automatically
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
        }, (error) => {
          console.error("Firestore snapshot error:", error);
          setSyncStatus('error');
        });

        return () => unsubscribeSnapshot();
      } else {
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Debounced Sync to Firestore
  useEffect(() => {
    if (!user?.id) return;

    setSyncStatus('syncing');
    const timeoutId = setTimeout(async () => {
      try {
        await setDoc(doc(db, "users", user.id), {
          products,
          categories,
          orders,
          cart,
          settings,
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
          logs
        }, { merge: true });
        setSyncStatus('synced');
      } catch (error) {
        console.error("Error syncing data to Firestore", error);
        setSyncStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [
    products, categories, orders, cart, settings, returns,
    maintenanceJobs, expenses, incomes, customers,
    notifications, suppliers, purchases, employees, transactions, user?.id
  ]);

  // (Duplicate useEffects removed — single onAuthStateChanged and single Firestore sync above)

  // Handle Theme
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark =
      settings.theme === "dark" ||
      (settings.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply color theme
    body.classList.remove(
      "theme-emerald",
      "theme-rose",
      "theme-amber",
      "theme-cyan",
      "theme-violet",
      "theme-gaming",
      "theme-custom"
    );
    if (settings.activeTheme && settings.activeTheme !== "indigo") {
      body.classList.add(`theme-${settings.activeTheme}`);
    }

    // Apply Custom Primary Color
    if (settings.primaryColor) {
      document.documentElement.style.setProperty("--custom-primary", settings.primaryColor);
    }

    // Apply shape theme
    body.classList.remove("shape-flat", "shape-rounded");
    if (settings.borderRadius === "none") {
      body.classList.add("shape-flat");
    } else if (settings.borderRadius === "full") {
      body.classList.add("shape-rounded");
    }

    // Apply Master Theme class
    body.classList.remove(
      "theme-master-default",
      "theme-master-gaming",
      "theme-master-carbon",
      "theme-master-luxury",
      "theme-master-cashier-tech"
    );
    if (settings.masterTheme && settings.masterTheme !== "default") {
      body.classList.add(`theme-master-${settings.masterTheme}`);
      // Master themes will now adapt to light/dark mode via CSS adjustments
    }

    // Apply Font Family
    if (settings.fontFamily) {
      body.style.fontFamily = settings.fontFamily;
      // Also override Tailwind's CSS var
      document.documentElement.style.setProperty("--font-sans", settings.fontFamily);
    } else {
      body.style.fontFamily = "";
      document.documentElement.style.removeProperty("--font-sans");
    }
  }, [settings.theme, settings.activeTheme, settings.borderRadius, settings.masterTheme, settings.fontFamily]);

  const playSound = (type: "success" | "error" | "click" | "login_success" | "logout") => {
    if (!settings.enableSounds) return;
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const t = audioCtx.currentTime;
      const master = settings.masterTheme || "default";

      // ----------------------------------------------------
      // SYSTEM SOUNDS (Login/Logout across all themes)
      // ----------------------------------------------------
      if (type === "login_success") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, t);
        oscillator.frequency.exponentialRampToValueAtTime(880, t + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        oscillator.start(t);
        oscillator.stop(t + 0.6);
        return;
      }
      if (type === "logout") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, t);
        oscillator.frequency.exponentialRampToValueAtTime(400, t + 0.2);
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.1, t + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        oscillator.start(t);
        oscillator.stop(t + 0.3);
        return;
      }

      // ----------------------------------------------------
      // GAMING THEME SOUNDS (Sci-Fi, 8-bit, Sharp)
      // ----------------------------------------------------
      if (master === "gaming") {
        if (type === "success") {
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(440, t);
          oscillator.frequency.setValueAtTime(880, t + 0.1);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          oscillator.start(t);
          oscillator.stop(t + 0.2);
        } else if (type === "click") {
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(600, t);
          oscillator.frequency.exponentialRampToValueAtTime(800, t + 0.05);
          gainNode.gain.setValueAtTime(0.05, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          oscillator.start(t);
          oscillator.stop(t + 0.1);
        } else {
          // Error
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(150, t);
          oscillator.frequency.linearRampToValueAtTime(100, t + 0.3);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.linearRampToValueAtTime(0.01, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        }
      }
      // ----------------------------------------------------
      // iOS GLASS THEME SOUNDS (Crystalline, Airy, Premium)
      // ----------------------------------------------------
      else if (master === "ios-glass") {
        if (type === "success") {
          // Double crystalline beep
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(1200, t);
          oscillator.frequency.exponentialRampToValueAtTime(1600, t + 0.1);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.08, t + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);

          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(1800, t + 0.1);
          gain2.gain.setValueAtTime(0, t + 0.1);
          gain2.gain.linearRampToValueAtTime(0.05, t + 0.15);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc2.start(t + 0.1);
          osc2.stop(t + 0.4);
        } else if (type === "click") {
          // Soft "pop/bubble" sound
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(800, t);
          oscillator.frequency.exponentialRampToValueAtTime(100, t + 0.05);
          gainNode.gain.setValueAtTime(0.02, t);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          oscillator.start(t);
          oscillator.stop(t + 0.05);
        } else {
          // Error: Soft dual-tone
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(440, t);
          oscillator.frequency.linearRampToValueAtTime(330, t + 0.2);
          gainNode.gain.setValueAtTime(0.05, t);
          gainNode.gain.linearRampToValueAtTime(0.01, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        }
      }
      // ----------------------------------------------------
      // CASHIER TECH THEME SOUNDS (Fintech, Clean, Digital)
      // ----------------------------------------------------
      else if (master === "cashier-tech") {
        if (type === "success") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523, t);
          oscillator.frequency.exponentialRampToValueAtTime(784, t + 0.08);
          oscillator.frequency.exponentialRampToValueAtTime(1047, t + 0.2);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.12, t + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
          oscillator.start(t);
          oscillator.stop(t + 0.35);
        } else if (type === "click") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(700, t);
          oscillator.frequency.exponentialRampToValueAtTime(900, t + 0.04);
          gainNode.gain.setValueAtTime(0.04, t);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          oscillator.start(t);
          oscillator.stop(t + 0.08);
        } else {
          // Error: two-tone descending beep
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(400, t);
          oscillator.frequency.exponentialRampToValueAtTime(200, t + 0.25);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        }
      }
      // ----------------------------------------------------
      // LUXURY THEME SOUNDS (Soft, Bells, Smooth)
      // ----------------------------------------------------
      else if (master === "luxury") {
        if (type === "success") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(600, t);
          oscillator.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.1, t + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
          oscillator.start(t);
          oscillator.stop(t + 0.8);
        } else if (type === "click") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(800, t);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.03, t + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          oscillator.start(t);
          oscillator.stop(t + 0.3);
        } else {
          // Error
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(300, t);
          oscillator.frequency.exponentialRampToValueAtTime(250, t + 0.3);
          gainNode.gain.setValueAtTime(0, t);
          gainNode.gain.linearRampToValueAtTime(0.05, t + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          oscillator.start(t);
          oscillator.stop(t + 0.5);
        }
      }
      // ----------------------------------------------------
      // CARBON THEME SOUNDS (Mechanical, Punchy, Deep)
      // ----------------------------------------------------
      else if (master === "carbon") {
        if (type === "success") {
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(300, t);
          oscillator.frequency.exponentialRampToValueAtTime(600, t + 0.1);
          gainNode.gain.setValueAtTime(0.2, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          oscillator.start(t);
          oscillator.stop(t + 0.15);
        } else if (type === "click") {
          // A short mechanical "click"
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(200, t);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          oscillator.start(t);
          oscillator.stop(t + 0.05);
        } else {
          // Error: deep buzzer
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(120, t);
          gainNode.gain.setValueAtTime(0.15, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          oscillator.start(t);
          oscillator.stop(t + 0.2);
        }
      }
      // ----------------------------------------------------
      // DEFAULT THEME SOUNDS (Original clean sounds)
      // ----------------------------------------------------
      else {
        if (type === "success") {
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(800, t);
          oscillator.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          oscillator.start(t);
          oscillator.stop(t + 0.1);
        } else if (type === "click") {
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(400, t);
          gainNode.gain.setValueAtTime(0.05, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
          oscillator.start(t);
          oscillator.stop(t + 0.05);
        } else if (type === "error") {
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(200, t);
          oscillator.frequency.exponentialRampToValueAtTime(150, t + 0.2);
          gainNode.gain.setValueAtTime(0.1, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          oscillator.start(t);
          oscillator.stop(t + 0.2);
        }
      }
    } catch (e) {
      console.error("Audio context error", e);
    }
  };

  const login = (userData: User) => setUser(userData);
  const logout = async () => {
    playSound("logout");
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

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.customPrice ?? item.price) * item.quantity,
      0,
    );
    const tax = settings.enableTax ? subtotal * (settings.taxRate / 100) : 0;
    const total = subtotal + tax;
    const actualAmountPaid =
      amountPaid ?? (paymentMethod === "debt" ? 0 : total);

    const profit = cart.reduce((sum, item) => sum + ((item.customPrice ?? item.price) - item.costPrice) * item.quantity, 0);
    const today = new Date().toISOString().split('T')[0];
    const dailyNumber = orders.filter(o => o.date.startsWith(today)).length + 1;

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000) + 1000}`,
      dailyNumber,
      date: new Date().toISOString(),
      subtotal,
      tax,
      total,
      profit,
      status: "completed",
      items: [...cart],
      paymentMethod,
      splitDetails,
      customerName,
      customerId,
      amountPaid: actualAmountPaid,
      cashierId: user?.id,
      cashierName: user?.name,
    };

    setOrders((prev) => [newOrder, ...prev]);
    addLog({
      action: "بيع طلب",
      details: `إتمام عملية بيع برقم ${newOrder.id} - الإجمالي: ${total} - الربح: ${profit}`,
      type: "sale"
    });
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
      id: Math.random().toString(36).substring(7),
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

  const addLog = (logData: Omit<SystemLog, "id" | "date" | "userId" | "userName">) => {
    const newLog: SystemLog = {
      ...logData,
      id: `LOG-${Math.random().toString(36).substring(7)}`,
      date: new Date().toISOString(),
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
      // Do NOT call addPurchaseInvoice(invoice); as it creates a duplicate invoice.
      // We process the logic inline here properly instead.

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

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: `EXP-${Math.floor(Math.random() * 10000) + 1000}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addIncome = (income: Omit<Income, "id">) => {
    const newIncome: Income = {
      ...income,
      id: `INC-${Math.floor(Math.random() * 10000) + 1000}`,
    };
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
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

  return (
    <AppContext.Provider
      value={{
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
        addExpense,
        deleteExpense,
        addIncome,
        deleteIncome,
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
        logs,
        addLog,
        isOnline,
        syncStatus,
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
