/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDoc
} from "firebase/firestore";
import { Product, Supplier, SaleTransaction, PurchaseOrder } from "../types";
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_PURCHASE_ORDERS, generateInitialSales } from "../utils/dummyData";

// Hardcoded config safely matching /firebase-applet-config.json
export const firebaseConfig = {
  apiKey: "AIzaSyAxdVec71AlbnKkipI8VQQ1DVTE3vEvig0",
  authDomain: "vyaapaarai-8f601.firebaseapp.com",
  projectId: "vyaapaarai-8f601",
  storageBucket: "vyaapaarai-8f601.firebasestorage.app",
  messagingSenderId: "930508620513",
  appId: "1:930508620513:web:ee51e624479125bf4aada0",
  measurementId: "G-2N8YTKFGHC"
};

// Initialize app & auth
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore on custom database ID
export const db = initializeFirestore(app, {}, "ai-studio-da62f36e-958e-4fdc-8a13-269e3b348133");

// Profile definition
export interface UserProfile {
  email: string | null;
  businessName: string;
  createdAt: string;
}

// -------------------------------------------------------------
// USER CORE RETRIEVAL & INITIAL SEEDING FOR NEW USER ACCOUNTS
// -------------------------------------------------------------

export async function isUserSeeded(uid: string): Promise<boolean> {
  const profileRef = doc(db, "users", uid);
  const snap = await getDoc(profileRef);
  return snap.exists();
}

export async function seedNewUserWorkspace(uid: string, email: string | null, businessName: string): Promise<void> {
  const batch = writeBatch(db);
  
  // Create user profile
  const profileRef = doc(db, "users", uid);
  batch.set(profileRef, {
    email,
    businessName: businessName || "Balaji Grocery Store",
    createdAt: new Date().toISOString()
  });

  // Seed default products
  INITIAL_PRODUCTS.forEach(p => {
    const productRef = doc(db, "users", uid, "products", p.id);
    batch.set(productRef, p);
  });

  // Seed default suppliers
  INITIAL_SUPPLIERS.forEach(s => {
    const supplierRef = doc(db, "users", uid, "suppliers", s.id);
    batch.set(supplierRef, s);
  });

  // Seed default purchase orders (adjusting timestamps to represent historical flow)
  INITIAL_PURCHASE_ORDERS.forEach(po => {
    const poRef = doc(db, "users", uid, "purchaseOrders", po.id);
    batch.set(poRef, po);
  });

  // Seed default sales transactions using generator functions
  const initialSales = generateInitialSales();
  initialSales.forEach(sale => {
    const saleRef = doc(db, "users", uid, "sales", sale.id);
    batch.set(saleRef, sale);
  });

  await batch.commit();
}

// -------------------------------------------------------------
// FIRESTORE SYNC AND MUTATIONS API (USER-ISOLATED)
// -------------------------------------------------------------

// Users Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const profileRef = doc(db, "users", uid);
  const snap = await getDoc(profileRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      email: data.email || "",
      businessName: data.businessName || "My Smart Store",
      createdAt: data.createdAt || ""
    };
  }
  return null;
}

export async function updateUserProfile(uid: string, businessName: string): Promise<void> {
  const profileRef = doc(db, "users", uid);
  await updateDoc(profileRef, { businessName });
}

// Products CRUD
export async function fetchUserProducts(uid: string): Promise<Product[]> {
  const snap = await getDocs(collection(db, "users", uid, "products"));
  const list: Product[] = [];
  snap.forEach(d => {
    list.push(d.data() as Product);
  });
  return list;
}

export async function saveUserProduct(uid: string, product: Product): Promise<void> {
  await setDoc(doc(db, "users", uid, "products", product.id), product);
}

export async function deleteUserProduct(uid: string, productId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "products", productId));
}

// Suppliers CRUD
export async function fetchUserSuppliers(uid: string): Promise<Supplier[]> {
  const snap = await getDocs(collection(db, "users", uid, "suppliers"));
  const list: Supplier[] = [];
  snap.forEach(d => {
    list.push(d.data() as Supplier);
  });
  return list;
}

export async function saveUserSupplier(uid: string, supplier: Supplier): Promise<void> {
  await setDoc(doc(db, "users", uid, "suppliers", supplier.id), supplier);
}

export async function deleteUserSupplier(uid: string, supplierId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "suppliers", supplierId));
}

// Purchase Orders CRUD
export async function fetchUserPurchaseOrders(uid: string): Promise<PurchaseOrder[]> {
  const snap = await getDocs(collection(db, "users", uid, "purchaseOrders"));
  const list: PurchaseOrder[] = [];
  snap.forEach(d => {
    list.push(d.data() as PurchaseOrder);
  });
  // Sort by date descending
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveUserPurchaseOrder(uid: string, po: PurchaseOrder): Promise<void> {
  await setDoc(doc(db, "users", uid, "purchaseOrders", po.id), po);
}

// Sales transactions CRUD
export async function fetchUserSales(uid: string): Promise<SaleTransaction[]> {
  const snap = await getDocs(collection(db, "users", uid, "sales"));
  const list: SaleTransaction[] = [];
  snap.forEach(d => {
    list.push(d.data() as SaleTransaction);
  });
  // Sort by date descending
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveUserSale(uid: string, sale: SaleTransaction): Promise<void> {
  await setDoc(doc(db, "users", uid, "sales", sale.id), sale);
}
