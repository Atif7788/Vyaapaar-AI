/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  CheckCircle, 
  Clock, 
  Layers, 
  CreditCard,
  Trash2,
  Edit,
  X
} from "lucide-react";
import { Supplier, PurchaseOrder, Product } from "../types";

interface PurchaseManagerProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onAddSupplier: (supplier: Partial<Supplier>) => Promise<any>;
  onUpdateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<any>;
  onDeleteSupplier: (id: string) => Promise<any>;
  onAddPurchaseOrder: (poPayload: any) => Promise<any>;
  onReceivePurchaseOrder: (poId: string) => Promise<any>;
  userRole: string;
}

export default function PurchaseManager({
  suppliers,
  purchaseOrders,
  products,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddPurchaseOrder,
  onReceivePurchaseOrder,
  userRole
}: PurchaseManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"suppliers" | "orders">("orders");

  // Supplier modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({ name: "", contact: "", address: "", gstNumber: "" });

  // PO modal
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [poItems, setPoItems] = useState<{ productId: string; productName: string; purchasePrice: number; quantity: number }[]>([]);
  
  // Quick select product state inside PO
  const [currentProductId, setCurrentProductId] = useState("");
  const [currentQty, setCurrentQty] = useState(10);
  const [currentPrice, setCurrentPrice] = useState(50);

  const [formError, setFormError] = useState("");

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({ name: "", contact: "", address: "", gstNumber: "" });
    setFormError("");
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSupplier(s);
    setSupplierForm({ name: s.name, contact: s.contact, address: s.address, gstNumber: s.gstNumber });
    setFormError("");
    setIsSupplierModalOpen(true);
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) {
      setFormError("Supplier company name is required.");
      return;
    }
    try {
      if (editingSupplier) {
        await onUpdateSupplier(editingSupplier.id, supplierForm);
      } else {
        await onAddSupplier(supplierForm);
      }
      setIsSupplierModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit supplier.");
    }
  };

  const handleDeleteSupplierClick = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete '${name}' from procurement directory? This cannot be undone.`)) {
      try {
        await onDeleteSupplier(id);
      } catch (err: any) {
        alert(err.message || "Failed to remove supplier.");
      }
    }
  };

  const handleOpenAddPO = () => {
    if (suppliers.length === 0) {
      alert("Please add at least one supplier to directory first.");
      return;
    }
    setSelectedSupplierId(suppliers[0].id);
    setPoItems([]);
    setFormError("");
    setIsPOModalOpen(true);
    
    // reset inner picker
    if (products.length > 0) {
      setCurrentProductId(products[0].id);
      setCurrentPrice(products[0].purchasePrice);
      setCurrentQty(20);
    }
  };

  const handleAddPOItem = () => {
    if (!currentProductId) return;
    const prod = products.find(p => p.id === currentProductId);
    if (!prod) return;

    // Check if duplicate item in order
    const existsIdx = poItems.findIndex(it => it.productId === currentProductId);
    if (existsIdx !== -1) {
      const updated = [...poItems];
      updated[existsIdx].quantity += Number(currentQty);
      updated[existsIdx].purchasePrice = Number(currentPrice);
      setPoItems(updated);
    } else {
      setPoItems([...poItems, {
        productId: prod.id,
        productName: prod.name,
        purchasePrice: Number(currentPrice),
        quantity: Number(currentQty)
      }]);
    }
  };

  const handleRemovePOItem = (productId: string) => {
    setPoItems(poItems.filter(it => it.productId !== productId));
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      setFormError("No products added to procurement draft list.");
      return;
    }
    const targetSupplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!targetSupplier) {
      setFormError("Must link to a valid supplier.");
      return;
    }

    try {
      const payload = {
        supplierId: targetSupplier.id,
        supplierName: targetSupplier.name,
        items: poItems,
        status: "Pending" // drafted as pending first
      };

      await onAddPurchaseOrder(payload);
      setIsPOModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to issue purchase order.");
    }
  };

  const handleProductSelectChange = (pId: string) => {
    setCurrentProductId(pId);
    const prod = products.find(p => p.id === pId);
    if (prod) {
      setCurrentPrice(prod.purchasePrice);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Suppliers & Procurements</h1>
          <p className="text-xs text-slate-500">Coordinate and record purchases from external distributors and update storage</p>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="inline-flex bg-slate-100 p-1 rounded">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
              activeSubTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Procurement Orders
          </button>
          <button
            onClick={() => setActiveSubTab("suppliers")}
            className={`px-3 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
              activeSubTab === "suppliers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Suppliers Directory
          </button>
        </div>
      </div>

      {activeSubTab === "orders" ? (
        // TAB: PURCHASE RECORDS
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center bg-white p-4 rounded-t-lg border-t border-x border-slate-200">
            <h3 className="text-xs font-bold text-slate-900">Purchase History Listings</h3>
            {userRole === "Admin" && (
              <button
                onClick={handleOpenAddPO}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 transition text-white font-bold text-xs rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Draft New PO Order
              </button>
            )}
          </div>

          <div className="bg-white rounded-b-lg border-b border-x border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Order # / Date</th>
                    <th className="py-3 px-4">Supplier Partner</th>
                    <th className="py-3 px-4">Draft Product Items</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Delivery Status</th>
                    {userRole === "Admin" && <th className="py-3 px-5 text-center">Process Delivery</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map(po => {
                      const isReceived = po.status === "Received";

                      return (
                        <tr key={po.id} className="hover:bg-slate-55 transition">
                          {/* Order Number */}
                          <td className="py-4 px-5">
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-slate-900 text-sm">{po.orderNumber}</span>
                              <span className="text-[10px] text-slate-400 block">Created: {po.date}</span>
                            </div>
                          </td>

                          {/* Supplier Link */}
                          <td className="py-4 px-4 font-semibold text-slate-800">
                            {po.supplierName}
                          </td>

                          {/* Items included */}
                          <td className="py-4 px-4">
                            <div className="space-y-1 max-w-xs">
                              {po.items.map((it, idx) => (
                                <p key={idx} className="truncate text-[10px] text-slate-500">
                                  • {it.productName} <span className="font-bold text-slate-700">(x{it.quantity})</span>
                                </p>
                              ))}
                            </div>
                          </td>

                          {/* Total Cost */}
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">
                            ₹{po.totalAmount.toLocaleString("en-IN")}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            {isReceived ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" />
                                Goods Received / Stock Sync'd
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                <Clock className="w-3 h-3" />
                                Transit / Pending Invoice
                              </span>
                            )}
                          </td>

                          {/* Receive Actions */}
                          {userRole === "Admin" && (
                            <td className="py-4 px-5 text-center">
                              {!isReceived ? (
                                <button
                                  onClick={() => onReceivePurchaseOrder(po.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition active:scale-95 cursor-pointer shadow shadow-emerald-600/10"
                                >
                                  Mark Received
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">Auto-Archived</span>
                              )}
                            </td>
                          )}

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-400 bg-slate-50">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                        No purchase records tracked in standard directory.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        // TAB: SUPPLIER DIRECTORY
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center bg-white p-4 rounded-t-lg border-t border-x border-slate-200">
            <h3 className="text-xs font-bold text-slate-900">Procurement Wholesaler Directory</h3>
            {userRole === "Admin" && (
              <button
                onClick={handleOpenAddSupplier}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 transition text-white font-bold text-xs rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Wholesaler
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.length > 0 ? (
              suppliers.map(sup => (
                <div key={sup.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow transition flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-sm leading-normal">{sup.name}</h4>
                      {userRole === "Admin" && (
                        <div className="inline-flex gap-1">
                          <button onClick={(e) => handleOpenEditSupplier(sup, e)} className="p-1 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded transition cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => handleDeleteSupplierClick(sup.id, sup.name, e)} className="p-1 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded transition cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] bg-slate-50 text-slate-600 font-mono tracking-wide px-2 py-0.5 rounded font-extrabold uppercase">GSTIN: {sup.gstNumber}</span>
                  </div>

                  <div className="space-y-1.5 border-t pt-3 border-slate-105 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {sup.contact}
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <span className="leading-relaxed">{sup.address}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                <MapPin className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                No procurement suppliers registered to Jodhpur store database.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Supplier Register/Editor Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-sm rounded border border-slate-200 shadow-xl overflow-hidden relative text-xs">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">
                {editingSupplier ? "Modify Wholesaler Record" : "Add New Procurement Supplier"}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSupplierSubmit} className="p-4 space-y-3 text-xs">
              {formError && <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-150 rounded">{formError}</div>}
              
              <div>
                <label className="block text-slate-550 font-bold mb-1 uppercase text-[10px]">Company Name *</label>
                <input 
                  type="text" 
                  value={supplierForm.name}
                  onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  required
                  placeholder="e.g. Maruti Pharma Jodhpur"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition" 
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold mb-1 uppercase text-[10px]">GST Registration Number</label>
                <input 
                  type="text" 
                  value={supplierForm.gstNumber}
                  onChange={e => setSupplierForm({ ...supplierForm, gstNumber: e.target.value })}
                  placeholder="e.g. 08AAAAM1234M1Z5"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition" 
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold mb-1 uppercase text-[10px]">Contact Phone/Email</label>
                <input 
                  type="text" 
                  value={supplierForm.contact}
                  onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                  placeholder="e.g. +91 94142 XXXXX"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition" 
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold mb-1 uppercase text-[10px]">Office Address</label>
                <textarea 
                  rows={2}
                  value={supplierForm.address}
                  onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="Street bazar location details"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition" 
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 transition font-bold text-[11px]">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-bold text-[11px] shadow-sm">Save Wholesaler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Draft PURCHASE ORDER Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded border border-slate-200 shadow-xl overflow-hidden relative text-xs">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Issue Stock Procurement Order</h3>
                <p className="text-[10px] text-slate-400">Order drafted will be kept under 'Pending' until delivery arrives</p>
              </div>
              <button onClick={() => setIsPOModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handlePOSubmit} className="p-4 space-y-4 text-xs">
              {formError && <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-150 rounded">{formError}</div>}

              {/* Select Supplier */}
              <div>
                <label className="block text-slate-550 font-bold mb-1 uppercase text-[10px]">Target Wholesaler Candidate *</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 text-xs text-slate-700 font-bold"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ({s.gstNumber})</option>
                  ))}
                </select>
              </div>

              {/* Picker item container inline */}
              <div className="p-3 bg-slate-50 border rounded space-y-2">
                <span className="font-bold text-slate-550 text-[9px] uppercase block tracking-wider">Select Product to Purchase</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-6">
                    <select
                      value={currentProductId}
                      onChange={e => handleProductSelectChange(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded bg-white text-xs text-slate-705"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Now: {p.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <input 
                      type="number" 
                      min={1}
                      value={currentQty}
                      onChange={e => setCurrentQty(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-200 rounded bg-white text-xs" 
                      placeholder="Qty" 
                    />
                  </div>
                  <div className="sm:col-span-3 flex gap-1">
                    <input 
                      type="number" 
                      min={0.1}
                      value={currentPrice}
                      onChange={e => setCurrentPrice(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-200 rounded bg-white text-xs" 
                      placeholder="Bid Cost" 
                      title="Procurement Cost"
                    />
                    <button
                      type="button"
                      onClick={handleAddPOItem}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded border border-blue-200 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Drafted items inside PO */}
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                <span className="font-bold text-slate-500 uppercase tracking-wide block">Order Invoice Draft ({poItems.length} lines)</span>
                {poItems.length > 0 ? (
                  poItems.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg border">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{it.productName}</span>
                        <p className="text-[10px] text-slate-400">Qty: {it.quantity} • Cost: ₹{it.purchasePrice}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 font-mono">₹{it.quantity * it.purchasePrice}</span>
                        <button type="button" onClick={() => handleRemovePOItem(it.productId)} className="text-rose-500 hover:text-rose-700">Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-300 italic border border-dashed rounded-lg">Draft cart is currently empty.</div>
                )}
              </div>

              {/* Summary and submit */}
              <div className="border-t pt-3.5 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Consolidated PO Cost</span>
                  <span className="text-base font-extrabold font-mono text-blue-600">
                    ₹{poItems.reduce((acc, cur) => acc + (cur.purchasePrice * cur.quantity), 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => setIsPOModalOpen(false)} className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 transition font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded transition shadow-md cursor-pointer">Draft Procurement (PO)</button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
