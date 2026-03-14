export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string; // Keep as string for backward compatibility, but it will store category id or name
  categoryId?: string;
  barcode: string;
  image?: string;
  costPrice: number; // For profit calculation, make it required
  isActive?: boolean;
  trackInventory?: boolean;
  minStockAlert?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "error" | "info" | "success";
  read: boolean;
  date: string;
  link?: string;
}

export interface CartItem extends Product {
  quantity: number;
  customPrice?: number; // Allow overriding price in POS
}

export type Role = "admin" | "cashier";

export interface User {
  id: string; // The active storeId mapping they are connected to
  authUid?: string; // Their real Firebase Google/Phone UID
  name: string;
  role: Role;
  pin?: string; // For admin overrides
  permissions?: EmployeePermissions;
}

export interface EmployeePermissions {
  canViewProducts: boolean;
  canEditProducts: boolean;
  canManageEmployees: boolean;
  canViewReports: boolean;
  canCancelOrders: boolean;
  canManageInventory: boolean;
  canManageSettings: boolean;
}

/** Historical snapshot of a product at time of sale — prevents data corruption if product is later edited. */
export interface LineItemSnapshot {
  productId: string;
  name: string;
  barcode: string;
  category: string;
  categoryId?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  customPrice?: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  dailyNumber?: number;
  date: string;
  total: number;
  subtotal: number;
  tax: number;
  profit?: number;
  taxRate?: number;
  status:
  | "pending"
  | "processing"
  | "ready"
  | "shipped"
  | "completed"
  | "cancelled"
  | "returned"
  | "void";
  items: CartItem[];
  /** Historical price snapshots — use this for reports/reprints instead of items */
  lineItems?: LineItemSnapshot[];
  customerName?: string;
  customerId?: string;
  amountPaid: number;
  change?: number;
  paymentMethod: "cash" | "card" | "online" | "debt" | "split";
  splitDetails?: { cash: number; card: number };
  cashierId?: string;
  cashierName?: string;
  createdBy?: string;
  isReturn?: boolean;
  returnReason?: string;
  vault?: "daily" | "main";
}

export interface SystemLog {
  id: string;
  date: string;
  action: string; // e.g., "بيع طلب", "إلغاء طلب", "تعديل مخزون"
  details: string;
  userId: string;
  userName: string;
  type: "sale" | "inventory" | "security" | "system";
}

export interface ReturnItem {
  id: string;
  orderId: string;
  productId?: string;
  items?: (CartItem | LineItemSnapshot)[];
  quantity: number;
  date: string;
  type: "inventory" | "defective";
  status: "returned" | "pending_replacement" | "replaced";
  refundAmount: number;
}

export interface MaintenanceJob {
  id: string;
  customerName: string;
  device: string;
  issue: string;
  status: "in_progress" | "ready" | "paid";
  cost: number;
  partsCost: number; // Cost of parts from inventory or cash
  date: string;
  deliveryDate?: string;
  notes?: string;
  receivedBy?: string; // Employee who received the device
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: "general" | "maintenance_parts";
  vault?: "daily" | "main";
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
  vault?: "daily" | "main";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // Positive means they owe us (debtor), negative means we owe them (creditor)
  nextReminderDate?: string; // Next date to remind about debt
  lastReminderSlot?: string;
  reminderInterval?: "daily" | "weekly" | "monthly" | "fixed";
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  revenue: number;
}

export interface Settings {
  storeName: string;
  storeLogo?: string;
  currency: string;
  exchangeRate?: number; // Added for Status Bar
  setupCompleted?: boolean; // Added for Setup Wizard
  language: "ar" | "en";
  taxRate: number;
  enableTax: boolean;
  receiptHeader: string;
  receiptFooter: string;
  theme: "light" | "dark" | "system";

  // The new Master Theme overriding setting
  masterTheme: "default" | "gaming" | "carbon" | "luxury" | "cashier-tech" | "ios-glass";

  activeTheme?: "indigo" | "emerald" | "rose" | "amber" | "cyan" | "violet" | "gaming";
  cardStyle?: "flat" | "shadow" | "glass" | "default";
  borderRadius?: "none" | "default" | "full";
  primaryColor: string;
  sidebarColor?: string; // New: Custom sidebar color
  navbarColor?: string;  // New: Custom navbar color
  backgroundColor?: string; // New: Custom background color
  glassOpacity?: number;   // New: 0 to 1 for glass effects
  animationSpeed?: "slow" | "normal" | "fast"; // New: UI animation speed
  enableSounds: boolean;
  preventBelowCost: boolean;
  adminPin: string; // 4-digit PIN for overrides
  fontFamily?: string; // CSS font-family string
  disableAnimations?: boolean; // New: Option to turn off animations
  dashboardLayout?: {
    showSales?: boolean;
    showOrders?: boolean;
    showProducts?: boolean;
    showInventoryValue?: boolean;
    showChart?: boolean;
    showRecentOrders?: boolean;
    showLowStock?: boolean;
    showFastActions?: boolean;
  };
  cashTransferMode?: "auto" | "manual"; // Auto: to main safe directly, Manual: to daily register, manual transfer required
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // Positive means we owe them, negative means they owe us
}

export interface PurchaseItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
}

export interface Employee {
  id: string;
  authUid?: string; // Links this employee to a Firebase Auth user
  storeId?: string; // The store they belong to
  name: string;
  role: Role;
  permissions?: EmployeePermissions; // Granular permissions
  phone: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  type:
  | "sale"
  | "purchase"
  | "expense"
  | "income"
  | "payment_in"
  | "payment_out"
  | "transfer"
  | "transfer_in"
  | "transfer_out";
  amount: number;
  date: string;
  description: string;
  referenceId?: string;
  vault?: "daily" | "main";
  entityId?: string;
  entityName?: string;
  /** User who created this transaction — critical for audit trail */
  userId?: string;
  userName?: string;
}
