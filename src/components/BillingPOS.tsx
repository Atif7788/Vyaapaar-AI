/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  User, 
  Phone, 
  ShoppingBag, 
  X, 
  Printer, 
  CheckCircle, 
  Info,
  Sparkles
} from "lucide-react";
import { Product, SaleItem } from "../types";
import { generateAndDownloadInvoicePDF } from "../utils/pdfGenerator";

interface BillingPOSProps {
  products: Product[];
  onCheckOut: (payload: {
    customerName: string;
    customerPhone: string;
    items: { productId: string; quantity: number; discountRate: number; gstRate: number }[];
    paymentMethod: "Cash" | "UPI" | "Card";
  }) => Promise<any>;
}

export default function BillingPOS({ products, onCheckOut }: BillingPOSProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cart, setCart] = useState<{
    product: Product;
    quantity: number;
    discountRate: number; // percentage
    gstRate: number; // percentage
  }[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card">("UPI");

  // Receipt Modal
  const [receiptInvoice, setReceiptInvoice] = useState<any | null>(null);

  // Filter Catalog
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const eligibleProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      alert(`Error: ${product.name} is completely out of stock.`);
      return;
    }

    const existingIdx = cart.findIndex(item => item.product.id === product.id);
    if (existingIdx !== -1) {
      const currentQty = cart[existingIdx].quantity;
      if (currentQty >= product.quantity) {
        alert(`Cannot add more. Retail stock limit is ${product.quantity} units for ${product.name}.`);
        return;
      }
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      setCart(updated);
    } else {
      // suggest standard GST rate based on categories
      let suggestedGst = 18;
      if (product.category === "Groceries") suggestedGst = 5;
      else if (product.category === "Prescriptions & Medicines") suggestedGst = 12;

      setCart([...cart, {
        product,
        quantity: 1,
        discountRate: 0,
        gstRate: suggestedGst
      }]);
    }
  };

  const updateQuantity = (id: string, newQty: number) => {
    const idx = cart.findIndex(item => item.product.id === id);
    if (idx === -1) return;

    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }

    const maxStock = cart[idx].product.quantity;
    if (newQty > maxStock) {
      alert(`Cannot exceed available warehouse stock of ${maxStock} items.`);
      return;
    }

    const updated = [...cart];
    updated[idx].quantity = newQty;
    setCart(updated);
  };

  const updateDiscount = (id: string, rate: number) => {
    const idx = cart.findIndex(item => item.product.id === id);
    if (idx === -1) return;
    const updated = [...cart];
    updated[idx].discountRate = Math.min(Math.max(rate, 0), 100);
    setCart(updated);
  };

  const updateGstRating = (id: string, rate: number) => {
    const idx = cart.findIndex(item => item.product.id === id);
    if (idx === -1) return;
    const updated = [...cart];
    updated[idx].gstRate = rate;
    setCart(updated);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
  };

  // Calculations
  const calculateCartSummary = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let gstTotal = 0;

    cart.forEach(item => {
      const itemSub = item.product.sellingPrice * item.quantity;
      const disc = Math.round(itemSub * (item.discountRate / 100));
      const amountAfterDisc = itemSub - disc;
      
      // Inclusive GST breakout: gstAmount = basePrice * (rate / 100+rate)
      const gstAmt = Math.round(amountAfterDisc * (item.gstRate / (100 + item.gstRate)));

      subtotal += itemSub;
      discountTotal += disc;
      gstTotal += gstAmt;
    });

    const netAmount = subtotal - discountTotal;

    return {
      subtotal,
      discountTotal,
      gstTotal,
      netAmount
    };
  };

  const { subtotal, discountTotal, gstTotal, netAmount } = calculateCartSummary();

  const handlePOSCheckoutSubmit = async () => {
    if (cart.length === 0) {
      alert("Error: Billing cart is empty.");
      return;
    }

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          discountRate: item.discountRate,
          gstRate: item.gstRate
        })),
        paymentMethod
      };

      const result = await onCheckOut(payload);
      setReceiptInvoice(result);
      
      // Automatic PDF generate/download
      try {
        generateAndDownloadInvoicePDF(result);
      } catch (pdfErr) {
        console.error("Auto PDF generation error:", pdfErr);
      }
      
      // Clear POS Screen
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
    } catch (err: any) {
      alert(err.message || "Checkout failed. Please verify stock volumes.");
    }
  };

  const printDocumentView = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* POS Top Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Active Point of Sale (POS)</h1>
          <p className="text-xs text-slate-500">Quick clerk desk for retail search, dynamic GST booking, and billing receipt generation</p>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-700 text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          Sardarpura Counter #1 Active
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Product Search, Catalog Panels */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3.5">
            
            {/* Search inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-600 transition outline-none" 
                  placeholder="Search name, barcode..." 
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-55 border border-slate-200 rounded"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                  ))}
                </select>
                {(selectedCategory !== "All" || searchTerm) && (
                  <button 
                    onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
                    className="p-1 px-3 border border-slate-200 text-xs text-slate-400 hover:text-slate-600 rounded transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {eligibleProducts.length > 0 ? (
                eligibleProducts.map(p => {
                  const outOfStock = p.quantity <= 0;
                  const lowStock = p.quantity <= p.reorderLevel;

                  return (
                    <div 
                      key={p.id}
                      onClick={() => !outOfStock && addToCart(p)}
                      className={`p-3 rounded border transition flex flex-col justify-between cursor-pointer space-y-2.5 ${
                        outOfStock ? "bg-slate-50 border-slate-100 opacity-60" :
                        "bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[120px] block" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono tracking-wider">SKU: {p.sku}</p>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-1 rounded border border-slate-100">
                        <span className="font-bold text-blue-600 text-xs">₹{p.sellingPrice}</span>
                        {outOfStock ? (
                          <span className="text-[9px] font-extrabold text-rose-600 uppercase">SOLDOUT</span>
                        ) : (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            lowStock ? "bg-amber-50 text-amber-700 font-extrabold" : "bg-slate-100 text-slate-500"
                          }`}>
                            {p.quantity} left
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center text-slate-400 text-xs">
                  No products match current catalog filters.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: Cart Summary & Receipt Metadata */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Checkout Bill Basket ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 min-h-[150px] divide-y divide-slate-50">
              {cart.length > 0 ? (
                cart.map(item => {
                  const itemTotal = item.product.sellingPrice * item.quantity;
                  const itemDiscount = Math.round(itemTotal * (item.discountRate / 100));

                  return (
                    <div key={item.product.id} className="pt-3 first:pt-0 space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">{item.product.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">₹{item.product.sellingPrice} each</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 items-center">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded overflow-hidden col-span-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-slate-150 transition text-slate-500 font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={e => updateQuantity(item.product.id, Number(e.target.value))}
                            className="w-full text-center text-xs font-mono font-bold bg-transparent border-none outline-none focus:ring-0 py-0.5" 
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-slate-150 transition text-slate-500 font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* GST Select */}
                        <select
                          value={item.gstRate}
                          onChange={e => updateGstRating(item.product.id, Number(e.target.value))}
                          className="bg-slate-50 border border-slate-200 text-[10px] py-1 rounded w-full cursor-pointer"
                        >
                          <option value={0}>0% GST</option>
                          <option value={5}>5% GST</option>
                          <option value={12}>12% GST</option>
                          <option value={18}>18% GST</option>
                          <option value={28}>28% GST</option>
                        </select>

                        {/* Discount Input */}
                        <div className="relative">
                          <input 
                            type="number" 
                            min={0}
                            max={100}
                            value={item.discountRate}
                            onChange={e => updateDiscount(item.product.id, Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 text-[10px] py-1 rounded pr-5 text-center font-mono" 
                            placeholder="Disc%"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                        </div>
                      </div>

                      {/* Line cost description */}
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 bg-slate-50 p-1 rounded-lg px-2">
                        <span>GST break: ₹{Math.round((itemTotal - itemDiscount) * (item.gstRate / (100 + item.gstRate)))}</span>
                        <span>Disc break: -₹{itemDiscount}</span>
                        <span className="font-bold text-slate-700">Net: ₹{itemTotal - itemDiscount}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-300 flex flex-col justify-center items-center gap-2">
                  <ShoppingBag className="w-8 h-8 text-neutral-200" />
                  <p className="text-xs">Cart is empty. Tap items on left.</p>
                </div>
              )}
            </div>

            {/* Recipient info & details */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-550 uppercase">Customer Details (Optional)</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none" 
                    placeholder="Customer Name" 
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none" 
                    placeholder="Customer Phone" 
                  />
                </div>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="pt-2 space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">MANDATORY PAYMENT METHOD</label>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`py-1.5 px-2 text-xs font-bold border rounded transition flex justify-center items-center gap-1 cursor-pointer ${
                    paymentMethod === "UPI" ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`py-1.5 px-2 text-xs font-bold border rounded transition flex justify-center items-center gap-1 cursor-pointer ${
                    paymentMethod === "Cash" ? "bg-amber-50 border-amber-505 text-amber-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Card")}
                  className={`py-1.5 px-2 text-xs font-bold border rounded transition flex justify-center items-center gap-1 cursor-pointer ${
                    paymentMethod === "Card" ? "bg-blue-50 border-blue-500 text-blue-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Card
                </button>
              </div>
            </div>

            {/* Totals & Confirm Panel */}
            <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Sub-taxable Total</span>
                <span className="font-mono font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-500 text-[11px]">
                <span>Unified Discounts Recess</span>
                <span className="font-mono font-medium">-₹{discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Inclusive GST Tax (CGST+SGST)</span>
                <span className="font-mono font-medium">₹{gstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-800 text-xs font-bold pt-1.5 border-t border-dashed border-slate-200">
                <span>Net Amount Payable</span>
                <span className="font-mono text-blue-600 text-base">₹{netAmount.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handlePOSCheckoutSubmit}
                disabled={cart.length === 0}
                className={`w-full py-2.5 mt-1.5 text-center text-xs font-bold rounded transition ${
                  cart.length > 0 ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow shadow-blue-600/10 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Book Invoice & Finalize Payment (₹{netAmount})
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Printable Thermal Receipt Mockup Modal */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-lg border border-slate-200 shadow-2xl p-5 relative space-y-4 animate-fade-in text-xs">
            
            {/* Modal Exit */}
            <button
              onClick={() => setReceiptInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success icon */}
            <div className="text-center space-y-1">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Checkout Finalized Successfully</h3>
              <p className="text-[10px] text-slate-400 font-mono">Invoice reference: {receiptInvoice.invoiceNumber}</p>
            </div>

            {/* Mini Thermal Ticket */}
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 font-mono text-left text-[11px] text-slate-700 space-y-3 shadow-inner">
              <div className="text-center space-y-0.5 border-b pb-2.5 border-dashed border-slate-300">
                <span className="font-bold text-xs text-slate-900">SHREE BALAJI SUPERMARKET</span>
                <p className="text-[9px] text-slate-400">Sardarpura Bazar, Jodhpur, RJ</p>
                <p className="text-[9px] text-slate-405">GSTIN: 08AAAAM1234M1Z5</p>
              </div>

              <div className="space-y-0.5">
                <p>Invoice: {receiptInvoice.invoiceNumber}</p>
                <p>Cashier: {receiptInvoice.cashierName}</p>
                <p>Customer: {receiptInvoice.customerName || "Walk-In Guest"}</p>
                {receiptInvoice.customerPhone && <p>Contact: {receiptInvoice.customerPhone}</p>}
                <p>Payment: {receiptInvoice.paymentMethod} (SUCCESS)</p>
              </div>

              <div className="border-t border-b py-2 border-dashed border-slate-300 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Item Name [Qty]</span>
                  <span>Amount</span>
                </div>
                {receiptInvoice.items.map((it: SaleItem) => (
                  <div key={it.productId} className="flex justify-between">
                    <span>{it.productName.slice(0, 18)} [x{it.quantity}]</span>
                    <span>₹{it.subtotal.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-right font-semibold">
                <p>Subtotal: ₹{receiptInvoice.subtotal.toFixed(0)}</p>
                <p className="text-rose-600">Discounts Allowed: -₹{receiptInvoice.discountAmount.toFixed(0)}</p>
                <p>Inclusive GST: ₹{receiptInvoice.gstAmount.toFixed(0)}</p>
                <p className="font-bold text-xs text-slate-900 pt-1">Total Payable: ₹{receiptInvoice.totalAmount.toFixed(0)}</p>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400 space-y-0.5 capitalize">
                <p>Thank you for shopping with Shree Balaji!</p>
                <p>Billed at local time {new Date(receiptInvoice.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateAndDownloadInvoicePDF(receiptInvoice)}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 transition font-bold text-white rounded flex items-center justify-center gap-1.5 shadow shadow-blue-500/10 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Redownload PDF
                </button>
                <button
                  type="button"
                  onClick={printDocumentView}
                  className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 transition font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Thermal Print
                </button>
              </div>
              <button
                type="button"
                onClick={() => setReceiptInvoice(null)}
                className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium transition rounded cursor-pointer"
              >
                Close Ticket
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
