/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  X, 
  Barcode, 
  Layers,
  Sparkles,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { Product, Supplier } from "../types";

interface InventoryListProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (p: Partial<Product>) => Promise<any>;
  onUpdateProduct: (id: string, p: Partial<Product>) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
  userRole: string;
}

export default function InventoryList({ products, suppliers, onAddProduct, onUpdateProduct, onDeleteProduct, userRole }: InventoryListProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All"); // All, Low, Healthy, Critical

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Groceries",
    brand: "",
    supplierName: "",
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    reorderLevel: 10,
    expiryDate: "",
    barcode: ""
  });

  const [formError, setFormError] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Apply filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    
    let matchesStatus = true;
    if (stockStatus === "Low") {
      matchesStatus = p.quantity <= p.reorderLevel && p.quantity > 0;
    } else if (stockStatus === "Healthy") {
      matchesStatus = p.quantity > p.reorderLevel;
    } else if (stockStatus === "Critical") {
      matchesStatus = p.quantity <= 3;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      category: "Groceries",
      brand: "",
      supplierName: suppliers[0]?.name || "Direct Procurement",
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 10,
      reorderLevel: 5,
      expiryDate: "",
      barcode: ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      brand: p.brand || "",
      supplierName: p.supplierName || suppliers[0]?.name || "Direct Procurement",
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      reorderLevel: p.reorderLevel,
      expiryDate: p.expiryDate || "",
      barcode: p.barcode || ""
    } as any);
    setFormError("");
    setIsModalOpen(true);
  };

  const generateBarcodeAndSKU = () => {
    if (!form.name) {
      setFormError("Enter product name first to suggest codes.");
      return;
    }
    const cleanName = form.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
    const cleanBrand = form.brand ? form.brand.slice(0, 3).toUpperCase() : "GEN";
    const generatedSKU = `${cleanBrand}-${cleanName}-${Math.floor(10 + Math.random() * 90)}`;
    
    // Generate standard EAN barcode starts (890 - India region)
    const generatedBarcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setForm({
      ...form,
      sku: generatedSKU,
      barcode: generatedBarcode
    });
    setFormError("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) {
      setFormError("Product name and unique SKU are mandatory.");
      return;
    }
    if (form.purchasePrice > form.sellingPrice) {
      if (!confirm(`Warning: Purchase Cost (₹${form.purchasePrice}) is higher than retail pricing (₹${form.sellingPrice}). Continue?`)) {
        return;
      }
    }

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, form);
      } else {
        await onAddProduct(form);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit product.");
    }
  };

  const handleDeleteClick = async (productId: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete ${name} from shop listing?`)) {
      try {
        await onDeleteProduct(productId);
      } catch (err: any) {
        alert(err.message || "Failed to delete product.");
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setStockStatus("All");
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Inventory Catalogue Management</h1>
          <p className="text-xs text-slate-500">Track purchase records, stock thresholds, SKU tags, and barcodes</p>
        </div>
        
        {userRole === "Admin" && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition active:scale-95 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-sm shadow-blue-600/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register New Product
          </button>
        )}
      </div>

      {/* Advanced Filter Bar Panel */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition"
              placeholder="Search product name, SKU, or barcode..."
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition cursor-pointer"
            >
              <option disabled>Filter Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Level Selector */}
          <div className="md:col-span-3">
            <select
              value={stockStatus}
              onChange={e => setStockStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition cursor-pointer"
            >
              <option value="All">All Stock Levels</option>
              <option value="Low">Low Stock Alerts</option>
              <option value="Critical">Critical Stock (≤ 3 packs)</option>
              <option value="Healthy">Healthy Stock</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="md:col-span-1">
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="w-full p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-md transition flex justify-center items-center cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Product Details</th>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4 text-center">In-Stock Qty</th>
                <th className="py-3 px-4">Level status</th>
                {userRole === "Admin" && <th className="py-3 px-5 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => {
                  const isLow = p.quantity <= p.reorderLevel;
                  const isCritical = p.quantity <= 3;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      {/* Name / Brand */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-sm leading-normal block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium inline-block">Brand: {p.brand || "Generic"}</span>
                          {p.expiryDate && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium ml-2 inline-block">Exp: {p.expiryDate}</span>
                          )}
                        </div>
                      </td>

                      {/* SKU / Barcode */}
                      <td className="py-4 px-4 font-mono">
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-bold block">{p.sku}</span>
                          {p.barcode && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Barcode className="w-3.5 h-3.5" />
                              {p.barcode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-605 rounded uppercase tracking-wider">
                          {p.category}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                        ₹{p.purchasePrice.toFixed(2)}
                      </td>

                      {/* Selling */}
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-2.5 px-4 text-center font-mono">
                        <span className={`text-xs font-bold ${isCritical ? "text-rose-600" : isLow ? "text-amber-605" : "text-slate-900"}`}>
                          {p.quantity} packets
                        </span>
                        <div className="text-[9px] text-slate-400">Min: {p.reorderLevel}</div>
                      </td>

                      {/* Level tags */}
                      <td className="py-4 px-4">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Critical Out
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ✓ Healthy
                          </span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      {userRole === "Admin" && (
                        <td className="py-4 px-5 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              title="Edit item Properties"
                              className="p-1 px-2 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(p.id, p.name)}
                              title="Delete Item"
                              className="p-1 px-2 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={userRole === "Admin" ? 8 : 7} className="py-20 text-center text-slate-400 font-medium bg-slate-50">
                    <Layers className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                    No matching products fit your current filter parameters.
                    <p className="text-[10px] text-slate-400 mt-1">Try resetting the searching strings or selecting 'All Stock Levels' to review full listings.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Registration/Editor Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-lg border border-slate-250 shadow-2xl overflow-hidden relative animate-fade-in text-xs">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-150">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingProduct ? `Edit ${editingProduct.name}` : "Register New Stock Product"}
                </h3>
                <p className="text-[10px] text-slate-550">Provide pricing tags, SKU metadata and supplier source links</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5">
              
              {formError && (
                <div className="p-2 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[11px] font-bold">
                  ✖ {formError}
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Product Name *</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Aashirvaad Atta 10kg, Betadine ointment"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition"
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Brand Name</label>
                  <input 
                    type="text" 
                    value={form.brand}
                    onChange={e => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. ITC, Amul, MicroLabs"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Store Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition cursor-pointer"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Prescriptions & Medicines">Medicines</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Dairy & Fresh">Dairy</option>
                    <option value="Confectionery & Snacks">Confectionery</option>
                  </select>
                </div>
              </div>

              {/* Autogenerated SKU & Barcode Box */}
              <div className="bg-blue-50/40 p-3 rounded border border-blue-100 space-y-2.5">
                <div className="flex justify-between items-center bg-transparent">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    Autofill Retail Codes
                  </span>
                  <button 
                    type="button"
                    onClick={generateBarcodeAndSKU}
                    className="text-[10px] text-blue-600 font-extrabold hover:underline cursor-pointer"
                  >
                    Generate codes
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-0.5">Unique SKU Code *</label>
                    <input 
                      type="text" 
                      value={form.sku}
                      onChange={e => setForm({ ...form, sku: e.target.value })}
                      required
                      placeholder="e.g. ITC-AASH-10K"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 fill-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-0.5">EAN Barcode Code</label>
                    <input 
                      type="text" 
                      value={form.barcode}
                      onChange={e => setForm({ ...form, barcode: e.target.value })}
                      placeholder="e.g. 8901235123458"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 fill-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Purchase Cost (₹) *</label>
                  <input 
                    type="number" 
                    value={form.purchasePrice}
                    onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                    required
                    min={0.1}
                    step={0.01}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Retail Price (₹) *</label>
                  <input 
                    type="number" 
                    value={form.sellingPrice}
                    onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                    required
                    min={0.1}
                    step={0.01}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Stock Quantities & Safeguards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Supplier Link</label>
                  <select
                    value={form.supplierName}
                    onChange={e => setForm({ ...form, supplierName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition"
                  >
                    <option value="Direct Procurement">Direct Procurement</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Initial Qty *</label>
                  <input 
                    type="number" 
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                    required
                    min={0}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Reorder Alert Level *</label>
                  <input 
                    type="number" 
                    value={form.reorderLevel}
                    onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })}
                    required
                    min={1}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Expiry Date (Opt)</label>
                  <input 
                    type="date" 
                    value={form.expiryDate}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 ml-auto"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 transition text-white text-xs font-bold rounded shadow cursor-pointer"
                >
                  Confirm product data
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
