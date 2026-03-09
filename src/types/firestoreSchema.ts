// Firestore schema types for Cashier Tech POS

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  businessId: string;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  address?: string;
  phone?: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  category: string;
  price: number;
  barcode?: string;
  stock: number;
  supplierId?: string;
}

export interface InventoryMovement {
  id: string;
  businessId: string;
  productId: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  date: Date;
  userId: string;
}

export interface Sale {
  id: string;
  businessId: string;
  customerId?: string;
  employeeId?: string;
  date: Date;
  total: number;
  paymentType: 'cash' | 'card' | 'other';
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Repair {
  id: string;
  businessId: string;
  customerId: string;
  device: string;
  problem: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  dateIn: Date;
  dateOut?: Date;
  employeeId?: string;
}

export interface Expense {
  id: string;
  businessId: string;
  type: string;
  amount: number;
  date: Date;
  notes?: string;
  userId: string;
}

export interface Employee {
  id: string;
  businessId: string;
  name: string;
  role: string;
  phone?: string;
  salary?: number;
}

export interface AuditLog {
  id: string;
  businessId: string;
  userId: string;
  action: string;
  date: Date;
  details?: string;
}

// Settings can be a subcollection or embedded object
export interface Settings {
  language: 'ar' | 'en';
  rtl: boolean;
  currency: string;
  theme?: string;
  [key: string]: any;
}
