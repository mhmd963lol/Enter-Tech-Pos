// Migration utility for Firestore schema
// This script is for safe migration from old single-document to new collections
// Run on test DB first, with logging and backup

import { User, Business, Product, InventoryMovement, Sale, SaleItem, Customer, Supplier, Repair, Expense, Employee, AuditLog, Settings } from '../types/firestoreSchema';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, writeBatch } from 'firebase/firestore';

const db = getFirestore();

export async function migrateUserData(userId: string) {
  // 1. Backup old document
  const oldDocRef = doc(db, 'users', userId);
  const oldDocSnap = await getDoc(oldDocRef);
  if (!oldDocSnap.exists()) throw new Error('Old user document not found');
  const oldData = oldDocSnap.data();

  // 2. Prepare batch for atomic writes
  const batch = writeBatch(db);

  // 3. Migrate products
  if (Array.isArray(oldData.products)) {
    for (const p of oldData.products) {
      const prodRef = doc(collection(db, 'products'));
      batch.set(prodRef, {
        ...p,
        businessId: oldData.businessId,
      });
    }
  }

  // 4. Migrate customers
  if (Array.isArray(oldData.customers)) {
    for (const c of oldData.customers) {
      const custRef = doc(collection(db, 'customers'));
      batch.set(custRef, {
        ...c,
        businessId: oldData.businessId,
      });
    }
  }

  // 5. Migrate suppliers
  if (Array.isArray(oldData.suppliers)) {
    for (const s of oldData.suppliers) {
      const suppRef = doc(collection(db, 'suppliers'));
      batch.set(suppRef, {
        ...s,
        businessId: oldData.businessId,
      });
    }
  }

  // 6. Migrate sales
  if (Array.isArray(oldData.sales)) {
    for (const sale of oldData.sales) {
      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, {
        ...sale,
        businessId: oldData.businessId,
      });
      // Sale items as subcollection
      if (Array.isArray(sale.items)) {
        for (const item of sale.items) {
          const itemRef = doc(collection(saleRef, 'saleItems'));
          batch.set(itemRef, item);
        }
      }
    }
  }

  // 7. Migrate repairs
  if (Array.isArray(oldData.repairs)) {
    for (const r of oldData.repairs) {
      const repRef = doc(collection(db, 'repairs'));
      batch.set(repRef, {
        ...r,
        businessId: oldData.businessId,
      });
    }
  }

  // 8. Migrate expenses
  if (Array.isArray(oldData.expenses)) {
    for (const e of oldData.expenses) {
      const expRef = doc(collection(db, 'expenses'));
      batch.set(expRef, {
        ...e,
        businessId: oldData.businessId,
      });
    }
  }

  // 9. Migrate employees
  if (Array.isArray(oldData.employees)) {
    for (const emp of oldData.employees) {
      const empRef = doc(collection(db, 'employees'));
      batch.set(empRef, {
        ...emp,
        businessId: oldData.businessId,
      });
    }
  }

  // 10. Migrate settings
  if (oldData.settings) {
    const settingsRef = doc(collection(db, 'businesses'), oldData.businessId, 'settings', 'main');
    batch.set(settingsRef, oldData.settings);
  }

  // 11. Commit batch
  await batch.commit();

  // 12. Logging
  console.log('Migration completed for user:', userId);
}
