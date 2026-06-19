/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Scissors, 
  DollarSign, 
  PieChart as PieIcon, 
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";
import { Product, SaleTransaction } from "../types";

interface ProfitLossDashProps {
  products: Product[];
  sales: SaleTransaction[];
}

interface ExpenseLine {
  id: string;
  label: string;
  amount: number;
}

export default function ProfitLossDash({ products, sales }: ProfitLossDashProps) {
  // Configurable Opex expenses
  const [expenses, setExpenses] = useState<ExpenseLine[]>([
    { id: "1", label: "Shop Rent (Sardarpura Bazar)", amount: 5000 },
    { id: "2", label: "Electricity & AC Maintenance", amount: 1800 },
    { id: "3", label: "Helper Salaries (2 attendants)", amount: 6200 },
    { id: "4", label: "Cloud Software & Printing slips", amount: 499 }
  ]);

  const [newExpenseLabel, setNewExpenseLabel] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState(1000);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseLabel) return;
    setExpenses([...expenses, {
      id: Date.now().toString(),
      label: newExpenseLabel,
      amount: newExpenseAmount
    }]);
    setNewExpenseLabel("");
    setNewExpenseAmount(500);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(it => it.id !== id));
  };

  // Calculations for current Sales log (June 1 - June 19, 2026)
  const calculatePLSummary = () => {
    let grossRevenue = 0;
    let costOfGoodsSold = 0;
    let itemsSoldQuantity = 0;

    sales.forEach(tx => {
      grossRevenue += tx.totalAmount;
      tx.items.forEach(it => {
        itemsSoldQuantity += it.quantity;
        // find cost price
        const prod = products.find(p => p.id === it.productId);
        const costPrice = prod ? prod.purchasePrice : Math.round(it.price * 0.75);
        costOfGoodsSold += costPrice * it.quantity;
      });
    });

    const grossProfit = grossRevenue - costOfGoodsSold;
    const totalOpex = expenses.reduce((acc, cur) => acc + cur.amount, 0);
    const netProfit = grossProfit - totalOpex;

    const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      costOfGoodsSold,
      itemsSoldQuantity,
      grossProfit,
      totalOpex,
      netProfit,
      grossMarginPercent,
      netMarginPercent
    };
  };

  const {
    grossRevenue,
    costOfGoodsSold,
    itemsSoldQuantity,
    grossProfit,
    totalOpex,
    netProfit,
    grossMarginPercent,
    netMarginPercent
  } = calculatePLSummary();

  const isNetProfitPositive = netProfit >= 0;

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Financial Profit & Loss Sheet</h1>
          <p className="text-xs text-slate-500">Calculate Gross margins, recorded COGS, and configurable workspace operational expenses (Opex)</p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded font-bold">
          Billing Period: Jun 01 - Jun 19
        </div>
      </div>

      {/* Main KPI widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Gross Sales Revenue</span>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 font-mono">₹{grossRevenue.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-slate-500">{itemsSoldQuantity} catalog products checked out</p>
          </div>
        </div>

        {/* COGS */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cost of Goods Sold (COGS)</span>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-950 font-mono">₹{costOfGoodsSold.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-rose-600 font-medium font-sans">Procurement value debit</p>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Gross Margin Profit</span>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 font-mono">₹{grossProfit.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold font-sans">{grossMarginPercent.toFixed(1)}% margins</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Final Shop Net Profit</span>
          <div className="space-y-1">
            <h3 className={`text-xl font-extrabold font-mono ${isNetProfitPositive ? "text-emerald-600" : "text-rose-600"}`}>
              ₹{netProfit.toLocaleString("en-IN")}
            </h3>
            <p className="text-[10px] font-semibold text-blue-600 font-sans">
              Net Margin: {netMarginPercent.toFixed(1)}% bottomline
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Financial Ledger Spreadsheet */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-sm font-bold text-slate-900">Double-Entry Financial Summary</span>
            <span className="text-[9px] bg-blue-50 text-blue-700 px-2.2 py-0.5 rounded font-extrabold">LEDGER</span>
          </div>

          <div className="p-4.5 space-y-3.5 text-xs">
            {/* Rows of Ledger */}
            <div className="space-y-3.5">
              
              {/* Gross Revenue */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-700 text-sm">A. Gross Retails Revenue</span>
                <span className="font-mono font-bold text-blue-600 text-sm">+₹{grossRevenue.toLocaleString("en-IN")}</span>
              </div>

              {/* COGS (Debit) */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100 pl-4 font-sans">
                <span className="text-slate-550">Less: Wholesale Cost of Goods (COGS)</span>
                <span className="font-mono font-medium text-rose-500">-₹{costOfGoodsSold.toLocaleString("en-IN")}</span>
              </div>

              {/* Gross Profit Subtotal */}
              <div className="flex justify-between items-center py-2 bg-slate-50 p-2 rounded font-bold">
                <span className="text-slate-800">B. Integrated Gross Margin Profit (A - COGS)</span>
                <span className="font-mono text-slate-900">₹{grossProfit.toLocaleString("en-IN")}</span>
              </div>

              {/* Opex Expenses Debit list */}
              <div className="py-1">
                <span className="font-semibold text-slate-700 text-sm block mb-1">C. Indirect Commercial Expenditures (Opex)</span>
                <div className="space-y-1.5 pl-4 pb-2">
                  {expenses.map(exp => (
                    <div key={exp.id} className="flex justify-between text-slate-500 mt-1">
                      <span>• {exp.label}</span>
                      <span className="font-mono font-medium">-₹{exp.amount.toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-600 border-t pt-2 border-slate-100">
                    <span>Aggregate Operating Expenses (Opex Aggregate)</span>
                    <span className="font-mono">-₹{totalOpex.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Net profits */}
              <div className={`p-3.5 rounded flex justify-between items-center font-bold border ${
                isNetProfitPositive ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-220 text-rose-900"
              }`}>
                <span>FINAL ESTIMATED NET RETAIL PROFIT (B - C)</span>
                <span className="font-mono text-sm">₹{netProfit.toLocaleString("en-IN")}</span>
              </div>

            </div>
          </div>
        </div>

        {/* Right: Opex Configurator Panel */}
        <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="border-b pb-2.5 border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Configure Local Opex</h3>
            <p className="text-[10px] text-slate-400">Add or adjust custom expenditures like rent fees, light bills or transport</p>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Expense Title</label>
              <input 
                type="text" 
                value={newExpenseLabel}
                onChange={e => setNewExpenseLabel(e.target.value)}
                required
                placeholder="e.g. Sweets Box/Transport charges"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Expenditure Cost (₹)</label>
              <input 
                type="number" 
                min={1}
                value={newExpenseAmount}
                onChange={e => setNewExpenseAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <button 
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 transition font-bold text-[10px] text-white rounded shadow cursor-pointer text-center"
            >
              Add Custom Expense Debit
            </button>
          </form>

          {/* List of current expenses for quick deletions */}
          <div className="space-y-2 border-t pt-4 border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-snug block">Registered Monthly Costs</span>
            <div className="divide-y divide-slate-50 max-h-[160px] overflow-y-auto">
              {expenses.map(exp => (
                <div key={exp.id} className="flex justify-between items-center py-2 text-xs">
                  <span className="truncate max-w-[150px]">{exp.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">₹{exp.amount}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveExpense(exp.id)}
                      className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
