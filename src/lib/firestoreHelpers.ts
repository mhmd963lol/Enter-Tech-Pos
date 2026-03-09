// Helper functions for reading new Firestore schema
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Product, Sale, Customer, Repair, Expense, Employee } from '../types/firestoreSchema';

const db = getFirestore();

export async function getProducts(businessId: string): Promise<Product[]> {
  const q = query(collection(db, 'products'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

export async function getSales(businessId: string): Promise<Sale[]> {
  const q = query(collection(db, 'sales'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale));
}

export async function getCustomers(businessId: string): Promise<Customer[]> {
  const q = query(collection(db, 'customers'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
}

export async function getRepairs(businessId: string): Promise<Repair[]> {
  const q = query(collection(db, 'repairs'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Repair));
}

export async function getExpenses(businessId: string): Promise<Expense[]> {
  const q = query(collection(db, 'expenses'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
}

export async function getEmployees(businessId: string): Promise<Employee[]> {
  const q = query(collection(db, 'employees'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Employee));
}
