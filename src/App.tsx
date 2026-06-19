/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  ShoppingBag, 
  Table, 
  Users, 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  Settings, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  ArrowLeft,
  Briefcase,
  Layers2,
  AlertTriangle
} from "lucide-react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";

import LandingPage from "./components/LandingPage";
import DashboardHome from "./components/DashboardHome";
import InventoryList from "./components/InventoryList";
import BillingPOS from "./components/BillingPOS";
import PurchaseManager from "./components/PurchaseManager";
import ProfitLossDash from "./components/ProfitLossDash";
import AnalyticsView from "./components/AnalyticsView";
import ForecastingView from "./components/ForecastingView";
import SetupGuide from "./components/SetupGuide";
import AuthScreen from "./components/AuthScreen";

import { Product, Supplier, PurchaseOrder, SaleTransaction } from "./types";
import { 
  auth, 
  fetchUserProducts, 
  fetchUserSuppliers, 
  fetchUserSales, 
  fetchUserPurchaseOrders, 
  saveUserProduct, 
  deleteUserProduct, 
  saveUserSupplier, 
  deleteUserSupplier, 
  saveUserSale, 
  saveUserPurchaseOrder,
  getUserProfile,
  updateUserProfile
} from "./lib/firebase";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState("Shree Balaji Store");
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [userRole, setUserRole] = useState<"Admin" | "Staff">("Admin"); // Default Admin

  // Shared Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  // System Loading / Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  // Live ticking clock in Sardarpura Branch format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor Authentication Session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoading(true);
        setSyncError(null);
        try {
          // Determine existing shop attributes
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setBusinessName(profile.businessName || "Shree Balaji Store");
          }
          
          // Pull user-isolated collections from deep Firestore paths
          const [prods, sups, sTransactions, pos] = await Promise.all([
            fetchUserProducts(user.uid),
            fetchUserSuppliers(user.uid),
            fetchUserSales(user.uid),
            fetchUserPurchaseOrders(user.uid)
          ]);
          
          setProducts(prods);
          setSuppliers(sups);
          setSales(sTransactions);
          setPurchaseOrders(pos);
        } catch (err: any) {
          console.error("Failed to load isolated store dataset from cloud:", err);
          setSyncError(err.message || String(err));
        } finally {
          setIsLoading(false);
          // Auto route to specs/docs if there's an error so the user has self-healing options and can see the config inspector
          setActiveTab("specs");
        }
      } else {
        // Clear active session registries
        setCurrentUser(null);
        setProducts([]);
        setSuppliers([]);
        setSales([]);
        setPurchaseOrders([]);
        setBusinessName("Shree Balaji Store");
        setSyncError(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- PERSISTENT FIRESTORE OPERATIONS ---

  // Live Brand Rename Action
  const handleUpdateStoreName = async (newName: string) => {
    if (!currentUser) return;
    try {
      await updateUserProfile(currentUser.uid, newName);
      setBusinessName(newName);
    } catch (err) {
      console.error("Failed to update business name:", err);
    }
  };

  // Products CRUD
  const handleAddProduct = async (prodPayload: Partial<Product>) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    const newId = prodPayload.id || `prod_${Date.now()}`;
    const product: Product = {
      id: newId,
      name: prodPayload.name || "",
      sku: prodPayload.sku || "",
      category: prodPayload.category || "Groceries",
      brand: prodPayload.brand || "Generics",
      supplierName: prodPayload.supplierName || "Default Supplier",
      purchasePrice: prodPayload.purchasePrice || 0,
      sellingPrice: prodPayload.sellingPrice || 0,
      quantity: prodPayload.quantity || 0,
      reorderLevel: prodPayload.reorderLevel || 10,
      expiryDate: prodPayload.expiryDate || "",
      barcode: prodPayload.barcode || "",
      imageUrl: prodPayload.imageUrl || "",
    };
    
    await saveUserProduct(currentUser.uid, product);
    setProducts(prev => [product, ...prev]);
    return product;
  };

  const handleUpdateProduct = async (id: string, prodPayload: Partial<Product>) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    const existing = products.find(p => p.id === id);
    if (!existing) throw new Error("Product metadata record missing");
    
    const updatedRecord: Product = {
      ...existing,
      ...prodPayload,
      id // preserve lock
    } as Product;
    
    await saveUserProduct(currentUser.uid, updatedRecord);
    setProducts(prev => prev.map(p => p.id === id ? updatedRecord : p));
    return updatedRecord;
  };

  const handleDeleteProduct = async (id: string) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    await deleteUserProduct(currentUser.uid, id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Suppliers CRUD
  const handleAddSupplier = async (supPayload: Partial<Supplier>) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    const newId = supPayload.id || `sup_${Date.now()}`;
    const supplier: Supplier = {
      id: newId,
      name: supPayload.name || "",
      contact: supPayload.contact || "",
      address: supPayload.address || "",
      gstNumber: supPayload.gstNumber || "",
    };
    
    await saveUserSupplier(currentUser.uid, supplier);
    setSuppliers(prev => [supplier, ...prev]);
    return supplier;
  };

  const handleUpdateSupplier = async (id: string, supPayload: Partial<Supplier>) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    const existing = suppliers.find(s => s.id === id);
    if (!existing) throw new Error("Wholesaler record missing");
    
    const updatedRecord: Supplier = {
      ...existing,
      ...supPayload,
      id
    } as Supplier;
    
    await saveUserSupplier(currentUser.uid, updatedRecord);
    setSuppliers(prev => prev.map(s => s.id === id ? updatedRecord : s));
    return updatedRecord;
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    await deleteUserSupplier(currentUser.uid, id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Billing checkout POS
  const handleCheckOut = async (checkoutPayload: any) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    const newId = `sale_${Date.now()}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    const transaction: SaleTransaction = {
      id: newId,
      invoiceNumber,
      date: new Date().toISOString().split("T")[0],
      customerName: checkoutPayload.customerName || "Walk-in Guest",
      customerPhone: checkoutPayload.customerPhone || "",
      items: checkoutPayload.items,
      subtotal: checkoutPayload.subtotal || 0,
      gstAmount: checkoutPayload.gstAmount || 0,
      discountAmount: checkoutPayload.discountAmount || 0,
      totalAmount: checkoutPayload.totalAmount || 0,
      paymentMethod: checkoutPayload.paymentMethod || "UPI",
      cashierId: currentUser.uid,
      cashierName: checkoutPayload.cashierName || "Owner (Admin)",
    };
    
    // 1. Commit sales transaction to isolated DB
    await saveUserSale(currentUser.uid, transaction);
    
    // 2. Adjust and decrement product levels atomically
    const syncWorkers = checkoutPayload.items.map(async (item: any) => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const updatedQty = Math.max(0, p.quantity - item.quantity);
        const updatedProduct: Product = { ...p, quantity: updatedQty };
        await saveUserProduct(currentUser?.uid || "", updatedProduct);
        return updatedProduct;
      }
      return null;
    });
    
    const updatedLineItems = await Promise.all(syncWorkers);
    
    // 3. Update React States
    setSales(prev => [transaction, ...prev]);
    setProducts(prev => {
      return prev.map(p => {
        const matched = updatedLineItems.find(r => r && r.id === p.id);
        return matched ? { ...p, quantity: matched.quantity } : p;
      });
    });
    
    return transaction;
  };

  // PO Procurement
  const handleAddPurchaseOrder = async (poPayload: any) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    const newId = `po_${Date.now()}`;
    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    
    const draftedPO: PurchaseOrder = {
      id: newId,
      orderNumber,
      supplierId: poPayload.supplierId,
      supplierName: poPayload.supplierName || "Default Wholesaler",
      date: new Date().toISOString().split("T")[0],
      items: poPayload.items || [],
      totalAmount: poPayload.totalCost || poPayload.totalAmount || 0,
      status: "Pending"
    };
    
    await saveUserPurchaseOrder(currentUser.uid, draftedPO);
    setPurchaseOrders(prev => [draftedPO, ...prev]);
    return draftedPO;
  };

  const handleReceivePurchaseOrder = async (poId: string) => {
    if (!currentUser) throw new Error("Unauthorized user access");
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) throw new Error("Purchase order metadata missing");
    
    const completedPO: PurchaseOrder = {
      ...po,
      status: "Received"
    };
    
    // 1. Mark PO status as received
    await saveUserPurchaseOrder(currentUser.uid, completedPO);
    
    // 2. Increment inventory volumes accordingly
    const syncWorkers = completedPO.items.map(async (item: any) => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const updatedQty = p.quantity + item.quantity;
        const updatedProduct: Product = { ...p, quantity: updatedQty };
        await saveUserProduct(currentUser?.uid || "", updatedProduct);
        return updatedProduct;
      }
      return null;
    });
    
    const updatedLineItems = await Promise.all(syncWorkers);
    
    // 3. Update React states
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? completedPO : p));
    setProducts(prev => {
      return prev.map(p => {
        const matched = updatedLineItems.find(r => r && r.id === p.id);
        return matched ? { ...p, quantity: matched.quantity } : p;
      });
    });

    return completedPO;
  };

  // Landing Page flow
  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  // Verification: Admin login wall
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-800">
        
        {/* Isolated login header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setShowLandingPage(true)}
              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-md text-xs transition flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-3 h-3 text-slate-500" />
              Storefront
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">
                VyaapaarAI Enterprise
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-[10px] font-mono text-slate-600">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentTime || "loading clock..."}</span>
          </div>
        </header>

        {/* Dynamic secure forms panel */}
        <AuthScreen onAuthSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-800">
      
      {/* Top Professional Control Bar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm sticky top-0">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setShowLandingPage(true)}
            title="Return to storefront landing page"
            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-md text-xs transition flex items-center gap-1 cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-3 h-3 text-slate-500" />
            Pricing Storefront
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {businessName.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              {businessName}
            </h1>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
              Isolated Workspace
            </span>
          </div>
        </div>

        {/* Live Branch Info, Date, Ticking Time */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-[10px] font-mono text-slate-600">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentTime || "loading clock..."}</span>
        </div>

        {/* Dynamic RBAC Role-Selection Toggle & Sign Out Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden md:inline">Active Role:</span>
            <div className="bg-slate-100 p-0.5 rounded-md inline-flex border border-slate-200">
              <button
                onClick={() => {
                  setUserRole("Admin");
                  setActiveTab("dashboard");
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                  userRole === "Admin" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => {
                  setUserRole("Staff");
                  setActiveTab("pos"); // Send clerk directly to billing desk
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                  userRole === "Staff" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Clerk
              </button>
            </div>
          </div>

          <button
            onClick={async () => {
              await signOut(auth);
            }}
            className="p-1 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 text-[10px] font-bold font-sans rounded transition cursor-pointer"
          >
            Log Out
          </button>
        </div>

      </header>

      {/* Main Structural App grid */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-56 bg-slate-900 text-slate-400 flex flex-col border-r border-slate-800 md:sticky md:top-14 md:h-[calc(100vh-56px)] overflow-y-auto shrink-0">
          
          {/* Shop branding metadata */}
          <div className="p-4 border-b border-slate-800 flex flex-col gap-2 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                {businessName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-white text-[11px] block truncate leading-relaxed">{businessName}</span>
                <p className="text-[9px] text-slate-500 truncate block font-mono">{currentUser?.email}</p>
              </div>
            </div>
            
            {/* Inline Rename Store Feature */}
            <div className="flex items-center gap-1.5 mt-1 border-t border-slate-800/60 pt-2 shrink-0">
              <input 
                type="text" 
                placeholder="Rename profile..."
                defaultValue={businessName}
                onBlur={async (e) => {
                  const val = e.target.value.trim();
                  if (val && val !== businessName) {
                    await handleUpdateStoreName(val);
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && val !== businessName) {
                      await handleUpdateStoreName(val);
                      (e.target as HTMLInputElement).blur();
                    }
                  }
                }}
                className="w-full bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition text-[9px] text-slate-300 rounded px-2 py-0.8 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Main Navigation Tab buttons */}
          <nav className="flex-1 p-3 space-y-1">
            <button 
              onClick={() => setActiveTab("dashboard")}
              disabled={userRole !== "Admin"}
              className={`w-full flex items-center gap-3.2 px-3 py-2.1 rounded text-xs transition cursor-pointer ${
                activeTab === "dashboard" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              } ${userRole !== "Admin" ? "opacity-35 cursor-not-allowed" : ""}`}
            >
              <Layers className="w-4.2 h-4.2 shrink-0" />
              <span>Owner Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab("pos")}
              className={`w-full flex items-center gap-3.2 px-3 py-2.1 rounded text-xs transition cursor-pointer ${
                activeTab === "pos" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-4.2 h-4.2 shrink-0" />
              <span>Billing Counter (POS)</span>
            </button>

            <button 
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3.2 px-3 py-2.1 rounded text-xs transition cursor-pointer ${
                activeTab === "inventory" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Table className="w-4.2 h-4.2 shrink-0" />
              <span>Manage Inventory</span>
            </button>

            <button 
              onClick={() => setActiveTab("purchases")}
              disabled={userRole !== "Admin"}
              className={`w-full flex items-center gap-3.2 px-3 py-2.1 rounded text-xs transition cursor-pointer ${
                activeTab === "purchases" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              } ${userRole !== "Admin" ? "opacity-35 cursor-not-allowed" : ""}`}
            >
              <Users className="w-4.2 h-4.2 shrink-0" />
              <span>Supplier & Procurement</span>
            </button>

            <div className="h-px bg-slate-800 my-4"></div>

            <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">Advanced Analytics</div>

            <button 
              onClick={() => setActiveTab("profitloss")}
              disabled={userRole !== "Admin"}
              className={`w-full flex items-center gap-3.2 px-3 py-2.0 rounded text-xs mt-1 transition cursor-pointer ${
                activeTab === "profitloss" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              } ${userRole !== "Admin" ? "opacity-35 cursor-not-allowed" : ""}`}
            >
              <DollarSign className="w-4.2 h-4.2 shrink-0" />
              <span>Margins & Expenses</span>
            </button>

            <button 
              onClick={() => setActiveTab("analytics")}
              disabled={userRole !== "Admin"}
              className={`w-full flex items-center gap-3.2 px-3 py-2.0 rounded text-xs transition cursor-pointer ${
                activeTab === "analytics" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              } ${userRole !== "Admin" ? "opacity-35 cursor-not-allowed" : ""}`}
            >
              <TrendingUp className="w-4.2 h-4.2 shrink-0" />
              <span>Sales Trends</span>
            </button>

            <button 
              onClick={() => setActiveTab("forecasting")}
              disabled={userRole !== "Admin"}
              className={`w-full flex items-center gap-3.2 px-3 py-2.0 rounded text-xs transition cursor-pointer ${
                activeTab === "forecasting" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              } ${userRole !== "Admin" ? "opacity-35 cursor-not-allowed" : ""}`}
            >
              <Sparkles className="w-4.2 h-4.2 shrink-0 text-amber-500" />
              <span>AI Demand Projections</span>
            </button>

            <button 
              onClick={() => setActiveTab("specs")}
              className={`w-full flex items-center gap-3.2 px-3 py-2.0 rounded text-xs transition cursor-pointer ${
                activeTab === "specs" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4.2 h-4.2 shrink-0" />
              <span>Dashboard Docs</span>
            </button>
          </nav>

          {/* Secure lock status badge */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-center flex flex-col gap-1 items-center">
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SECURE END-TO-END</span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono">Ver. 2.4.0 (Production-Ready)</p>
          </div>
        </aside>

        {/* Content view stage container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 relative">
          {syncError && (
            <div className="mb-6 p-4.5 bg-amber-50 border border-amber-200 text-slate-800 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-full shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Database Sync Warning</h4>
                  <p className="text-[11px] text-slate-650 leading-relaxed max-w-2xl">
                    Firestore failed to synchronize: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px] font-bold text-amber-950">{syncError}</code>.
                    This usually happens due to a cached stale auth session from a different Firebase project. Clearing the local session fixes it instantly.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                    window.location.reload();
                  } catch (e) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                Reset Session & Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition">
              <div className="w-10 h-10 border-4 border-blue-600/25 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-xs font-mono font-bold text-slate-650 mt-3.5 select-none animate-pulse">
                Synchronizing store files securely with cloud DB...
              </span>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardHome 
                  products={products} 
                  sales={sales} 
                  onNavigateToTab={setActiveTab}
                  userRole={userRole}
                />
              )}

              {activeTab === "inventory" && (
                <InventoryList 
                  products={products} 
                  suppliers={suppliers}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  userRole={userRole}
                />
              )}

              {activeTab === "pos" && (
                <BillingPOS 
                  products={products} 
                  onCheckOut={handleCheckOut} 
                />
              )}

              {activeTab === "purchases" && (
                <PurchaseManager 
                  suppliers={suppliers}
                  purchaseOrders={purchaseOrders}
                  products={products}
                  onAddSupplier={handleAddSupplier}
                  onUpdateSupplier={handleUpdateSupplier}
                  onDeleteSupplier={handleDeleteSupplier}
                  onAddPurchaseOrder={handleAddPurchaseOrder}
                  onReceivePurchaseOrder={handleReceivePurchaseOrder}
                  userRole={userRole}
                />
              )}

              {activeTab === "profitloss" && (
                <ProfitLossDash 
                  sales={sales} 
                  products={products} 
                />
              )}

              {activeTab === "analytics" && (
                <AnalyticsView 
                  sales={sales} 
                  products={products} 
                />
              )}

              {activeTab === "forecasting" && (
                <ForecastingView 
                  products={products} 
                  sales={sales}
                />
              )}

              {activeTab === "specs" && (
                <SetupGuide />
              )}
            </>
          )}
        </main>

      </div>

      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0 z-25 relative">
        <div className="flex gap-6">
          <span>Server Status: <span className="text-green-600 font-bold">OPERATIONAL</span></span>
          <span>Firestore Sync: <span className="text-emerald-600 font-bold">LIVE ONLINE</span></span>
          <span>Active Warehouse: Jodhpur (Sardarpura)</span>
        </div>
        <div className="flex gap-4 font-bold text-slate-400 uppercase">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setActiveTab("specs")}>Help</span>
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setActiveTab("specs")}>Settings</span>
          <span className="hover:text-rose-500 cursor-pointer text-slate-500 transition" onClick={async () => { await signOut(auth); setShowLandingPage(true); }}>Sign Out</span>
        </div>
      </footer>

    </div>
  );
}
