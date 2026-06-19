/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  Clock,
  ThumbsUp,
  Briefcase
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Product, SaleTransaction } from "../types";

interface DashboardHomeProps {
  products: Product[];
  sales: SaleTransaction[];
  onNavigateToTab: (tab: string) => void;
  userRole: string;
}

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

export default function DashboardHome({ products, sales, onNavigateToTab, userRole }: DashboardHomeProps) {
  // Calculations
  const totalProducts = products.length;
  
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0);
  
  // Sales Today (2026-06-19)
  const todayStr = "2026-06-19";
  const todaySalesTx = sales.filter(s => s.date === todayStr);
  const todaySalesAmount = todaySalesTx.reduce((acc, s) => acc + s.totalAmount, 0);

  // Month Sales (June 2026)
  const juneSales = sales.filter(s => s.date.startsWith("2026-06"));
  const monthlySalesAmount = juneSales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Monthly Profit
  // Profit = soldPrice - purchasePrice for all sold items in June
  let monthlyCOGS = 0;
  juneSales.forEach(tx => {
    tx.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const costPrice = prod ? prod.purchasePrice : Math.round(it.price * 0.75); // fallback
      monthlyCOGS += costPrice * it.quantity;
    });
  });
  const monthlyProfitAmount = monthlySalesAmount - monthlyCOGS;

  const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel);
  const lowStockCount = lowStockItems.length;

  // Chart Data: 30-Day Sales Trend
  // Aggregate sales over previous 30 days
  const dailyAgg: { [date: string]: { revenue: number, profit: number } } = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2026-06-19");
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dailyAgg[dateStr] = { revenue: 0, profit: 0 };
  }

  sales.forEach(tx => {
    if (dailyAgg[tx.date]) {
      dailyAgg[tx.date].revenue += tx.totalAmount;
      // calc profit for this tx
      let txCOGS = 0;
      tx.items.forEach(it => {
        const prod = products.find(p => p.id === it.productId);
        const cost = prod ? prod.purchasePrice : Math.round(it.price * 0.8);
        txCOGS += cost * it.quantity;
      });
      dailyAgg[tx.date].profit += (tx.totalAmount - txCOGS);
    }
  });

  const salesTrendData = Object.keys(dailyAgg).map(date => {
    // Format date as "15 Jun"
    const parsed = new Date(date);
    const label = parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return {
      date: label,
      "Revenue (₹)": Math.round(dailyAgg[date].revenue),
      "Profit (₹)": Math.round(dailyAgg[date].profit)
    };
  });

  // Chart Data: Category-wise Sales Performance
  const categorySalesMap: { [cat: string]: number } = {};
  sales.forEach(tx => {
    tx.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const cat = prod?.category || "Other";
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + it.subtotal;
    });
  });

  const categoryChartData = Object.keys(categorySalesMap).map(cat => ({
    category: cat,
    "Sales (₹)": Math.round(categorySalesMap[cat])
  })).sort((a, b) => b["Sales (₹)"] - a["Sales (₹)"]);

  // Chart Data: Payment Methods Pie
  const paymentMap: { [method: string]: number } = { UPI: 0, Cash: 0, Card: 0 };
  sales.forEach(tx => {
    paymentMap[tx.paymentMethod] = (paymentMap[tx.paymentMethod] || 0) + tx.totalAmount;
  });

  const paymentChartData = Object.keys(paymentMap).map(method => ({
    name: method,
    value: Math.round(paymentMap[method])
  }));

  // Top Selling Products
  const productSalesQty: { [name: string]: { qty: number, revenue: number, category: string } } = {};
  sales.forEach(tx => {
    tx.items.forEach(it => {
      if (!productSalesQty[it.productName]) {
        const prod = products.find(p => p.id === it.productId);
        productSalesQty[it.productName] = { qty: 0, revenue: 0, category: prod?.category || "Groceries" };
      }
      productSalesQty[it.productName].qty += it.quantity;
      productSalesQty[it.productName].revenue += it.subtotal;
    });
  });

  const topSellingProducts = Object.keys(productSalesQty).map(name => ({
    name,
    qty: productSalesQty[name].qty,
    revenue: productSalesQty[name].revenue,
    category: productSalesQty[name].category
  })).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const displayedRecentTx = sales.slice(0, 5);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Main Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Reporting session as of: 2026-06-19 • Jodhpur Branch • Mode: <span className="text-blue-600 font-semibold">{userRole} View</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {userRole === "Admin" && (
            <button
              onClick={() => onNavigateToTab("pos")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition active:scale-95 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-sm shadow-blue-600/15 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              New POS Billing Invoice
            </button>
          )}
          <button
            onClick={() => onNavigateToTab("inventory")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-bold text-xs rounded-md flex items-center gap-1 border border-slate-200 cursor-pointer"
          >
            Check Inventory Stock
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-sm transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Products</span>
            <span className="p-1 bg-blue-50 text-blue-600 rounded"><Layers className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{totalProducts}</h3>
            <p className="text-[9px] text-emerald-600 mt-1 font-semibold">✓ Active catalogs</p>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-sm transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stock Valuation</span>
            <span className="p-1 bg-purple-50 text-purple-600 rounded"><Briefcase className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">₹{totalInventoryValue.toLocaleString("en-IN")}</h3>
            <p className="text-[9px] text-slate-400 mt-1 font-mono">Cost basis valuation</p>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-sm transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Sales</span>
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded"><IndianRupee className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">₹{todaySalesAmount.toLocaleString("en-IN")}</h3>
            <p className="text-[9px] text-emerald-600 mt-1 font-semibold">{todaySalesTx.length} receipts generated</p>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-sm transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly (Jun)</span>
            <span className="p-1 bg-blue-50 text-blue-605 rounded"><TrendingUp className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">₹{monthlySalesAmount.toLocaleString("en-IN")}</h3>
            <p className="text-[9px] text-blue-600 mt-1 font-semibold">↑ 8.2% vs baseline</p>
          </div>
        </div>

        {/* Monthly Net Profit */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-sm transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Profit</span>
            <span className="p-1 bg-teal-50 text-teal-600 rounded"><ThumbsUp className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">₹{monthlyProfitAmount.toLocaleString("en-IN")}</h3>
            <p className="text-[9px] text-teal-600 mt-1 font-semibold">Margin: {Math.round((monthlyProfitAmount/monthlySalesAmount)*100)}% return</p>
          </div>
        </div>

        {/* Low Stock count with explicit border accent */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-sm transition duration-200 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Low Stock alerts</span>
            <span className="p-1 bg-rose-50 text-rose-650 rounded"><AlertTriangle className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold tracking-tight text-red-650">{lowStockCount}</h3>
            {lowStockCount > 0 ? (
              <p className="text-[9px] text-red-500 mt-1 font-semibold animate-pulse">✖ Orders required</p>
            ) : (
              <p className="text-[9px] text-emerald-600 mt-1 font-semibold">✓ Stocks healthy</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Line graph 30-day Trend */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-655">30-Day Sales & Profit Summary</h3>
              <p className="text-[10px] text-slate-400">Chronological transaction values tracked over Jodhpur</p>
            </div>
            <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold uppercase">₹ LIVE TREND</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString("en-IN")}`]} />
                <Line type="monotone" dataKey="Revenue (₹)" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Profit (₹)" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Payment Breakdown */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-655">Payment preferences</h3>
              <p className="text-[10px] text-slate-450">Distribution by currency streams (₹)</p>
            </div>
          </div>
          <div className="h-[150px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString("en-IN")}`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase font-bold">Total Sales</span>
              <span className="text-sm font-extrabold text-slate-800">₹{monthlySalesAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-100 mt-2">
            {paymentChartData.map((item, idx) => (
              <div key={item.name} className="space-y-0.5">
                <div className="inline-flex items-center gap-1 justify-center">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-bold text-[10px] text-slate-600">{item.name}</span>
                </div>
                <p className="font-mono text-slate-700 text-[10px] font-bold">₹{item.value.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low-Stock Quick Panel, Category-wise Performance and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category-wise Performance Bar Chart */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm lg:col-span-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-655">Category Sales Distribution</h3>
            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Real-time valuation</span>
          </div>
          <div className="h-56">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={8} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={8} width={80} tickLine={false} />
                  <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString("en-IN")}`]} />
                  <Bar dataKey="Sales (₹)" fill="#2563eb" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[11px] text-slate-400">No Sales Data Available</div>
            )}
          </div>
        </div>

        {/* Top Product Movers */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm lg:col-span-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-655">Top Volume Movers</h3>
            <span className="text-[9px] text-emerald-600 font-bold uppercase font-sans">Ranked</span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
            {topSellingProducts.map((p, idx) => {
              const maxVal = topSellingProducts[0]?.qty || 1;
              const barWidth = Math.round((p.qty / maxVal) * 100);
              return (
                <div key={p.name} className="py-2 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span className="truncate max-w-[200px]">{idx + 1}. {p.name}</span>
                    <span className="font-mono text-blue-600 font-extrabold">{p.qty} sold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${barWidth}%` }}></div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono w-14 text-right">₹{p.revenue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Table Section: Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Recent Checkout Invoices */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm xl:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-655">Recent Transaction Log (Live)</h3>
              <p className="text-[10px] text-slate-450">Invoices authorized in Sardarpura Branch office</p>
            </div>
            <button
              onClick={() => onNavigateToTab("analytics")}
              className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              See Full Audit Ledger
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 pl-1.5">Invoice ID</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Client Tag</th>
                  <th className="pb-2.5">Payment</th>
                  <th className="pb-2.5 text-right pr-1.5">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {displayedRecentTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-2 pl-1.5 font-mono font-bold text-slate-700">{tx.invoiceNumber}</td>
                    <td className="py-2 text-slate-450 font-mono">{tx.date}</td>
                    <td className="py-2 font-medium text-slate-900">{tx.customerName || "Walk-in Guest"}</td>
                    <td className="py-2">
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        tx.paymentMethod === "UPI" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        tx.paymentMethod === "Card" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono font-bold text-slate-900 pr-1.5">₹{tx.totalAmount.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Count panel with distinct accent colors */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm xl:col-span-4 space-y-3.5 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-655">Critical Runways ({lowStockCount})</h3>
            <button
              onClick={() => onNavigateToTab("inventory")}
              className="text-[10px] text-red-655 font-bold uppercase hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Restock Assist
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
            {lowStockItems.length > 0 ? (
              lowStockItems.map(p => (
                <div key={p.id} className="p-2.5 rounded bg-rose-50/75 border border-rose-100 hover:bg-rose-100/50 transition">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">{p.name}</h4>
                      <p className="text-[9px] text-slate-500 tracking-wider font-mono">SKU: {p.sku}</p>
                    </div>
                    <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-sm uppercase font-mono">
                      {p.quantity} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-rose-200/50 text-[9px] text-rose-800 font-bold">
                    <span>Safety limit: {p.reorderLevel}</span>
                    <span className="underline cursor-pointer hover:text-red-950" onClick={() => onNavigateToTab("inventory")}>Adjust stock →</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-405 space-y-2">
                <div className="text-base">🎉</div>
                <p className="font-bold text-slate-700">All inventory items are healthy.</p>
                <p className="text-[9px] px-2 text-slate-400 leading-normal">No items are currently below their pre-set reorder levels.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
