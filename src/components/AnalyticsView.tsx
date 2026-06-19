/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  FileText, 
  Calendar, 
  Download, 
  Search, 
  Printer, 
  TrendingUp, 
  ShieldAlert, 
  RotateCcw,
  Layers,
  Sparkles
} from "lucide-react";
import { SaleTransaction, Product } from "../types";
import { generateAndDownloadInvoicePDF } from "../utils/pdfGenerator";

interface AnalyticsViewProps {
  sales: SaleTransaction[];
  products: Product[];
}

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

export default function AnalyticsView({ sales, products }: AnalyticsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("30"); // 7, 15, 30 days
  const [selectedPayment, setSelectedPayment] = useState("All");

  const [auditMessage, setAuditMessage] = useState("");

  // Process Sales filtered by Range
  const filteredSales = sales.filter(tx => {
    // Search filter
    const matchesSearch = tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tx.customerName || "Walk-in").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Payment filter
    const matchesPayment = selectedPayment === "All" || tx.paymentMethod === selectedPayment;

    // Time calculations
    const txDate = new Date(tx.date);
    const today = new Date("2026-06-19");
    const diffTime = Math.abs(today.getTime() - txDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const matchesTime = diffDays <= Number(timeRange);

    return matchesSearch && matchesPayment && matchesTime;
  });

  // Calculate Cumulative total from filters
  const totalBookedValue = filteredSales.reduce((acc, tx) => acc + tx.totalAmount, 0);
  const totalBilledTransactions = filteredSales.length;

  // Chart: Hour Wise or Day-of-Week sales frequency
  const dayNameMapper: { [key: number]: string } = {
    0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"
  };
  const weekDayAccumulator: { [day: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
  filteredSales.forEach(tx => {
    const d = new Date(tx.date);
    const dayLabel = dayNameMapper[d.getDay()] || "Mon";
    weekDayAccumulator[dayLabel] += tx.totalAmount;
  });

  const weekdayChartData = Object.keys(weekDayAccumulator).map(day => ({
    day,
    "Sales Volume (₹)": Math.round(weekDayAccumulator[day])
  }));

  // Category wise shares in current filters
  const catMap: { [cat: string]: number } = {};
  filteredSales.forEach(tx => {
    tx.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const cat = prod?.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + it.subtotal;
    });
  });

  const categoryChartData = Object.keys(catMap).map(cat => ({
    name: cat,
    value: Math.round(catMap[cat])
  }));

  // Export CSV helper
  const handleExportCSV = () => {
    let rows = [["Invoice Number", "Date", "Customer Name", "Customer Phone", "Payment Method", "Discount Rupee", "GST Rupee", "Total Billed Amount"]];
    filteredSales.forEach(tx => {
      rows.push([
        tx.invoiceNumber,
        tx.date,
        tx.customerName || "Walk-in Guest",
        tx.customerPhone || "N/A",
        tx.paymentMethod,
        tx.discountAmount.toString(),
        tx.gstAmount.toString(),
        tx.totalAmount.toString()
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Balajistore_Sales_Report_${timeRange}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setAuditMessage("✓ Sales database spreadsheet exported successfully!");
    setTimeout(() => setAuditMessage(""), 4000);
  };

  // Compile Tax Report PDF
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
         {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Sales Logs & Tax Auditing</h1>
          <p className="text-xs text-slate-500">Query detailed invoices, filter weekend trend parameters, and download tax data spreadsheets</p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 transition text-slate-705 font-bold text-xs rounded flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Ledger
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 transition text-white font-bold text-xs rounded flex items-center gap-1 cursor-pointer shadow-sm shadow-blue-600/10"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Tax Audit Sheet
          </button>
        </div>
      </div>

      {auditMessage && (
        <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold animate-bounce">
          {auditMessage}
        </div>
      )}

      {/* Advanced filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition" 
              placeholder="Search invoice #, customer..." 
            />
          </div>

          {/* Time range select */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-55 border border-slate-200 rounded cursor-pointer focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
          >
            <option value="7">Previous 7 Days</option>
            <option value="15">Previous 15 Days</option>
            <option value="30">Previous 30 Days</option>
          </select>

          {/* Payment Method */}
          <select
            value={selectedPayment}
            onChange={e => setSelectedPayment(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-55 border border-slate-200 rounded cursor-pointer focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
          >
            <option value="All">All Payment Options</option>
            <option value="UPI">UPI Only</option>
            <option value="Cash">Cash Only</option>
            <option value="Card">Cards Only</option>
          </select>

          {/* Quick Metrics */}
          <div className="bg-slate-50 border border-slate-200 p-1 px-3.5 rounded flex justify-between items-center text-[10px] text-slate-605 font-mono">
            <span>Resultant Volume:</span>
            <span className="font-bold text-slate-950">₹{totalBookedValue.toLocaleString("en-IN")} ({totalBilledTransactions})</span>
          </div>

        </div>
      </div>

      {/* Secondary Metrics / Weekend analysis & Pie splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekend Lift / Weekday Trend chart */}
        <div className="lg:col-span-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b pb-2.5 mb-3 flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900">Weekly Sales Lift Frequency</h3>
              <p className="text-[10px] text-slate-505">Analyze peak business hours on Saturdays and Sundays to plan staffing levels</p>
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-extrabold">WEEKDAY DEMAND</span>
          </div>

          <div className="h-52 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekdayChartData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString("en-IN")}`]} />
                <Area type="monotone" dataKey="Sales Volume (₹)" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie breakdown */}
        <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b pb-2.5 mb-3">
            <h3 className="text-xs font-bold text-slate-900">Category sales breakdown</h3>
            <p className="text-[10px] text-slate-500">Distribution by product classification</p>
          </div>

          <div className="h-40 relative flex items-center justify-center text-xs">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString("en-IN")}`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-300">No category parameters match filters</span>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="text-[9px] text-slate-450 font-bold uppercase">Total Sales</span>
              <span className="text-xs font-bold font-mono">₹{totalBookedValue.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t">
            {categoryChartData.map((item, idx) => (
              <div key={item.name} className="flex justify-between text-[11px] text-slate-650">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">₹{item.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Audit List Spreadsheet Row Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-fade-in mb-8 text-xs">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-900">Comprehensive Invoices Ledger</h3>
          <span className="text-[9px] bg-slate-100 px-2.5 py-0.5 rounded font-mono font-bold text-slate-500">RECORD COUNT: {filteredSales.length}</span>
        </div>

        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Invoice Reference</th>
                <th className="py-2.5 px-3">Billed Date</th>
                <th className="py-2.5 px-3">Recipient customer</th>
                <th className="py-2.5 px-3">Payment Option</th>
                <th className="py-2.5 px-3">Applied Discount</th>
                <th className="py-2.5 px-3">Unified GST Tax</th>
                <th className="py-2.5 px-4 text-right pr-4 font-semibold">Total Payable</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSales.length > 0 ? (
                filteredSales.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{tx.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500">{tx.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="space-y-0.5">
                        <span>{tx.customerName || "Walk-in Buyer"}</span>
                        {tx.customerPhone && <span className="text-[9px] text-slate-400 block font-mono">Cont: {tx.customerPhone}</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        tx.paymentMethod === "UPI" ? "bg-emerald-50 text-emerald-700 border border-emerald-250" :
                        tx.paymentMethod === "Card" ? "bg-blue-50 text-blue-700 border border-blue-250" :
                        "bg-amber-50 text-amber-700 border border-amber-250"
                      }`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-500 font-semibold">-₹{tx.discountAmount.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-500">₹{tx.gstAmount.toFixed(0)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 pr-4">₹{tx.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => generateAndDownloadInvoicePDF(tx)}
                        title="Download PDF Invoice"
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 transition text-blue-600 rounded-md inline-flex items-center justify-center gap-1 cursor-pointer font-bold text-[10px]"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic bg-slate-50">
                    No transactions match current filters. Check date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
