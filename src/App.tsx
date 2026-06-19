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
  Layers2
} from "lucide-react";

import LandingPage from "./components/LandingPage";
import DashboardHome from "./components/DashboardHome";
import InventoryList from "./components/InventoryList";
import BillingPOS from "./components/BillingPOS";
import PurchaseManager from "./components/PurchaseManager";
import ProfitLossDash from "./components/ProfitLossDash";
import AnalyticsView from "./components/AnalyticsView";
import ForecastingView from "./components/ForecastingView";
import SetupGuide from "./components/SetupGuide";

import { Product, Supplier, PurchaseOrder, SaleTransaction } from "./types";

export default function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [userRole, setUserRole] = useState<"Admin" | "Staff">("Admin"); // Default Admin

  // Shared Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

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

  // Fetch all core datasets from server
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [prodsRes, supsRes, salesRes, posRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/suppliers"),
        fetch("/api/sales"),
        fetch("/api/purchase-orders")
      ]);

      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (supsRes.ok) setSuppliers(await supsRes.json());
      if (salesRes.ok) setSales(await salesRes.json());
      if (posRes.ok) setPurchaseOrders(await posRes.json());
    } catch (err) {
      console.error("Critical: Failed to sync datasets with Node server", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- API OPERATIONS ---

  // Products CRUD
  const handleAddProduct = async (prodPayload: Partial<Product>) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prodPayload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to add product");
    }
    const newlyCreated = await res.json();
    setProducts(prev => [newlyCreated, ...prev]);
    return newlyCreated;
  };

  const handleUpdateProduct = async (id: string, prodPayload: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prodPayload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to edit product properties");
    }
    const updatedRecord = await res.json();
    setProducts(prev => prev.map(p => p.id === id ? updatedRecord : p));
    return updatedRecord;
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Deletion forbidden");
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Suppliers CRUD
  const handleAddSupplier = async (supPayload: Partial<Supplier>) => {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supPayload)
    });
    if (!res.ok) throw new Error("Duplicate or invalid GSTIN Supplier parameter");
    const newlyCreated = await res.json();
    setSuppliers(prev => [newlyCreated, ...prev]);
    return newlyCreated;
  };

  const handleUpdateSupplier = async (id: string, supPayload: Partial<Supplier>) => {
    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supPayload)
    });
    if (!res.ok) throw new Error("Failed to edit wholesaler properties");
    const updatedRecord = await res.json();
    setSuppliers(prev => prev.map(s => s.id === id ? updatedRecord : s));
    return updatedRecord;
  };

  const handleDeleteSupplier = async (id: string) => {
    const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Wholesaler linked to operational Purchase Orders!");
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Billing check-out POS
  const handleCheckOut = async (checkoutPayload: any) => {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutPayload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "POS Checkout rejected");
    }
    const invoiceReceipt = await res.json();
    
    // Prepend invoice
    setSales(prev => [invoiceReceipt, ...prev]);
    
    // Instantly refetch products catalog to ensure quantities match decrements!
    const updatedProds = await fetch("/api/products");
    if (updatedProds.ok) setProducts(await updatedProds.json());
    
    return invoiceReceipt;
  };

  // PO Procurement
  const handleAddPurchaseOrder = async (poPayload: any) => {
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(poPayload)
    });
    if (!res.ok) throw new Error("Failed to issue procurement PO");
    const draftedPO = await res.json();
    setPurchaseOrders(prev => [draftedPO, ...prev]);
    return draftedPO;
  };

  const handleReceivePurchaseOrder = async (poId: string) => {
    const res = await fetch(`/api/purchase-orders/${poId}/receive`, {
      method: "PUT"
    });
    if (!res.ok) throw new Error("Failed to process delivery reception");
    const completedPO = await res.json();
    
    // Update PO history state
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? completedPO : po));
    
    // Fetch products catalog since quantities replenished!
    const updatedProds = await fetch("/api/products");
    if (updatedProds.ok) setProducts(await updatedProds.json());

    return completedPO;
  };

  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
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
            className="p-1 px-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-md text-xs transition flex items-center gap-1 cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-3.2 h-3.2 text-slate-500" />
            Pricing Storefront
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              Shree Balaji Store <span className="text-blue-600">Sardarpura</span>
            </h1>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
              Shop Admin
            </span>
          </div>
        </div>

        {/* Live Branch Info, Date, Ticking Time */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-[10px] font-mono text-slate-600">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentTime || "loading clock..."}</span>
        </div>

        {/* Dynamic RBAC Role-Selection Toggle */}
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
              Owner (Admin)
            </button>
            <button
              onClick={() => {
                setUserRole("Staff");
                setActiveTab("pos"); // Send clerk directly to billing desk!
              }}
              className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                userRole === "Staff" ? "bg-blue-600 text-white shadow animate-fade-in" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Clerk (Staff)
            </button>
          </div>
        </div>

      </header>

      {/* Main Structural App grid */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-56 bg-slate-900 text-slate-400 flex flex-col border-r border-slate-800 md:sticky md:top-14 md:h-[calc(100vh-56px)] overflow-y-auto">
          
          {/* Shop branding metadata */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40">
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              SB
            </div>
            <div className="space-y-0.1">
              <span className="font-bold text-white text-[11px] block leading-relaxed">Shree Balaji Store</span>
              <p className="text-[9px] text-slate-500 font-mono">Sardarpura Bazar Jodhpur</p>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 text-xs">
            
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1.5 tracking-wider">Main Menu</div>

            {/* Dashboard Home */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                activeTab === "dashboard" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Main Dashboard Home
            </button>

            {/* Quick POS Desk */}
            <button
              onClick={() => setActiveTab("pos")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                activeTab === "pos" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Active Billing POS Desk
            </button>

            {/* Inventory catalog line item */}
            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                activeTab === "inventory" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Inventory Catalogue
            </button>

            {/* Wholesaler procurement */}
            <button
              onClick={() => setActiveTab("purchases")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                activeTab === "purchases" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Suppliers & Procurements
            </button>

            <div className="border-t border-slate-800 py-2.5 my-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block px-3 tracking-wider">Financial Operations</span>
              
              {/* Profit Loss statement sheet */}
              <button
                onClick={() => setActiveTab("profitloss")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                  activeTab === "profitloss" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Profit & Loss Ledger
              </button>

              {/* Advanced logs and audits */}
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                  activeTab === "analytics" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Sales & Tax Auditing Log
              </button>
            </div>

            <div className="border-t border-slate-800 py-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block px-3 tracking-wider">AI Intelligence</span>

              {/* AI Demand forecasting and Smart insights */}
              <button
                onClick={() => setActiveTab("forecasting")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                  activeTab === "forecasting" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                AI Forecasts & Insights
              </button>

              {/* Tech Specs */}
              <button
                onClick={() => setActiveTab("specs")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition cursor-pointer text-left ${
                  activeTab === "specs" ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Technical Reference Spec
              </button>
            </div>

          </nav>

          {/* Quick status footer in sidebar */}
          <div className="p-3 bg-slate-950/60 text-[9px] text-slate-500 font-mono border-t border-slate-800 space-y-1 text-center">
            <span className="text-green-500 font-bold block">● SECURE IN-MEMORY ENG</span>
            <span>REST API Active • Cloud ready</span>
          </div>

        </aside>

        {/* Content canvas pane */}
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-5">
          {isLoading ? (
            <div className="py-24 text-center text-xs text-slate-400 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin mx-auto"></div>
              <p className="font-semibold text-slate-600">Re-stabilizing database ledger connections...</p>
              <p className="text-[10px]">Synchronizing real-time Jodhpur stock indexes</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardHome 
                  products={products} 
                  sales={sales} 
                  onNavigateToTab={(tab) => {
                    if (tab === "pos" && userRole !== "Admin") {
                      alert("Restricted: Standard staff role is restricted from spawning new checkout receipts directly. Switch role to Admin above!");
                      return;
                    }
                    setActiveTab(tab);
                  }}
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
                  products={products} 
                  sales={sales} 
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
                />
              )}

              {activeTab === "specs" && (
                <SetupGuide />
              )}
            </>
          )}
        </main>

      </div>

      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0 z-20">
        <div className="flex gap-6">
          <span>Server Status: <span className="text-green-600 font-bold">OPERATIONAL</span></span>
          <span>Last Stock Sync: 2 mins ago</span>
          <span>Database: SQLite (Local Cache Enabled)</span>
        </div>
        <div className="flex gap-4 font-bold text-slate-400 uppercase">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setActiveTab("specs")}>Help</span>
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setActiveTab("specs")}>Settings</span>
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setShowLandingPage(true)}>Logout</span>
        </div>
      </footer>

    </div>
  );
}
