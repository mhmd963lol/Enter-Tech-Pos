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
}

export interface CartItem extends Product {
  quantity: number;
  customPrice?: number; // Allow overriding price in POS
}

export type Role = "admin" | "cashier";

export interface User {
  id: string;
  name: string;
  role: Role;
  pin?: string; // For admin overrides
}

export interface Order {
  id: string;
  dailyNumber?: number; // Daily sequence number (e.g. 1, 2, 3...)
  date: string;
  total: number;
  subtotal: number;
  tax: number;
  profit?: number;
  status:
  | "pending"
  | "processing"
  | "ready"
  | "shipped"
  | "completed"
  | "cancelled"
  | "returned";
  items: CartItem[];
  customerName?: string;
  customerId?: string;
  amountPaid: number;
  paymentMethod: "cash" | "card" | "online" | "debt" | "split";
  splitDetails?: { cash: number; card: number };
  cashierId?: string;
  cashierName?: string; // New field for transparency
  isReturn?: boolean;
  returnReason?: string;
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
  productId: string;
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
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // Positive means they owe us (debtor), negative means we owe them (creditor)
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
  enableSounds: boolean;
  preventBelowCost: boolean;
  adminPin: string; // 4-digit PIN for overrides
  fontFamily?: string; // CSS font-family string
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
  name: string;
  role: Role;
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
  | "payment_out";
  amount: number;
  date: string;
  description: string;
  referenceId?: string; // Order ID, Purchase ID, etc.
  entityId?: string; // Customer ID, Supplier ID, Employee ID
  entityName?: string;
}
