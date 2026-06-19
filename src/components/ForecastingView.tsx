/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Calendar, 
  ShieldAlert, 
  RefreshCw, 
  Flame, 
  Boxes,
  HelpCircle,
  ThumbsUp,
  LineChart as LineChartIcon,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { Product, DemandForecast, AISmartInsight, SaleTransaction } from "../types";

interface ForecastingViewProps {
  products: Product[];
  sales: SaleTransaction[];
}

export default function ForecastingView({ products, sales }: ForecastingViewProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [forecast, setForecast] = useState<DemandForecast | null>(null);
  const [insights, setInsights] = useState<AISmartInsight[]>([]);
  
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<"linear" | "regression" | "gemini">("linear");

  // Select first product by default
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  // Fetch forecast for selected product
  const fetchProductForecast = async (productId: string) => {
    if (!productId) return;
    setIsForecastLoading(true);
    try {
      const res = await fetch(`/api/forecasts?productId=${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, sales, productId })
      });
      if (!res.ok) throw new Error("Forecast API error");
      const data = await res.json();
      setForecast(data);
    } catch (err) {
      console.error("Failed to load forecast", err);
    } finally {
      setIsForecastLoading(false);
    }
  };

  // Fetch smart insights from backend
  const fetchSmartInsights = async () => {
    setIsInsightsLoading(true);
    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, sales })
      });
      if (!res.ok) throw new Error("Insights API error");
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Failed to load AI insights", err);
    } finally {
      setIsInsightsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (selectedProductId) {
      fetchProductForecast(selectedProductId);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchSmartInsights();
  }, []);

  // Format Chart Data
  // We want to combine historical sales (past 3 days) + forecasted sales (next 7 days)
  const getChartData = () => {
    if (!forecast) return [];
    
    const historical = forecast.historicalPeriodSales.map(h => ({
      day: h.dateLabel,
      "Historical Sales": h.quantity,
      "AI Projected Demand": null,
      "Upper Confidence Bounds": null
    }));

    const projections = forecast.projections.map(p => ({
      day: p.dateLabel,
      "Historical Sales": null,
      "AI Projected Demand": p.predictedQty,
      "Upper Confidence Bounds": Math.round(p.predictedQty * 1.25)
    }));

    // Join them
    return [...historical, ...projections];
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            AI Demand Forecasting Hub
          </h1>
          <p className="text-xs text-slate-500">Harness server-side regression modeling and Google GenAI prompts to secure inventory runways</p>
        </div>

        <div className="inline-flex bg-slate-100 p-1 rounded">
          <button
            onClick={() => setActiveModel("linear")}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded transition ${
              activeModel === "linear" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sardarpura Regressor
          </button>
          <button
            onClick={() => setActiveModel("gemini")}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded transition flex items-center gap-1 ${
              activeModel === "gemini" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-blue-600"
            }`}
          >
            <Brain className="w-3 h-3" />
            Google GenAI Eng.
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Product Selector & Chart Projections */}
        <div className="lg:col-span-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3.5">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900">7-Day Demand Projection Runways</h3>
              <p className="text-[10px] text-slate-400">Select product to review historical volume paired with linear trajectory bounds</p>
            </div>

            {/* Selector dropdown */}
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded max-w-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
              ))}
            </select>
          </div>

          {isForecastLoading ? (
            <div className="py-24 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
              <p>Feeding Jodhpur sales vectors into predictive models...</p>
            </div>
          ) : forecast ? (
            <div className="space-y-5">
              
              {/* Forecast metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded border border-slate-100 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">AI 7-Day Requirement</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-extrabold text-slate-900">{forecast.recommendedRunwayQty} units</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[9px] text-slate-500 font-sans">Safeguard coverage volume</p>
                </div>

                <div className="space-y-1 border-y sm:border-y-0 sm:border-x py-2 sm:py-0 sm:px-4 border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Confidence Rating</span>
                  <span className="text-lg font-extrabold text-blue-600">{(forecast.confidenceRating * 100).toFixed(0)}% Precise</span>
                  <p className="text-[9px] text-slate-500 font-sans">Standard deviation tolerance</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Est. Exhaustion Date</span>
                  <span className="text-lg font-extrabold text-rose-500">{forecast.exhaustionDateLabel}</span>
                  <p className="text-[9px] text-slate-500 font-sans">Critical reorder alarm date</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getChartData()} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip formatter={(value) => [`${value} items`]} />
                    <Legend wrapperStyle={{ fontSize: "10px", pt: 10 }} />
                    <Area type="monotone" dataKey="Upper Confidence Bounds" fill="#eff6ff" stroke="#bfdbfe" />
                    <Line type="monotone" dataKey="Historical Sales" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3.5 }} />
                    <Line type="monotone" dataKey="AI Projected Demand" stroke="#2563eb" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3.5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Action Recommendation */}
              <div className="p-3 bg-blue-50/50 rounded border border-blue-100 flex gap-2.5 text-xs items-start">
                <Brain className="w-4.5 h-4.5 text-blue-600 mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="space-y-1 text-slate-700">
                  <p className="font-bold text-blue-900 uppercase tracking-wider text-[9px]">Model Procurement Suggestion </p>
                  <p className="leading-relaxed">
                    Based on historical consumer indexes and category parameters, current warehouse inventory of <span className="font-bold text-slate-900">{forecast.currentStock} units</span> will expire around <span className="font-bold text-slate-900">{forecast.exhaustionDateLabel}</span>. We highly recommend drafting a purchase order for <span className="font-bold text-blue-600">{forecast.recommendedRunwayQty} units</span> to bridge seasonal weekend spikes.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              No demand forecasts calculated. Confirm sales ledger is populated.
            </div>
          )}

        </div>

        {/* Right Side: Smart AI Insights list */}
        <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex border-b pb-3.5 items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900">Smart AI Insights</h3>
              <p className="text-[10px] text-slate-400">Automated risk flags and recommended reorders</p>
            </div>
            <button
              onClick={fetchSmartInsights}
              disabled={isInsightsLoading}
              title="Refresh Insights"
              className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-500 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInsightsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {isInsightsLoading ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                <p>Generating intelligence parameters...</p>
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight, idx) => {
                const isRiskHigh = insight.riskScore >= 7;

                return (
                  <div key={idx} className="p-3.5 rounded border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2.5">
                    
                    {/* Header line tags */}
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        insight.insightType === "StockOutRisk" ? "bg-rose-50 text-rose-700" :
                        insight.insightType === "DemandAnomaly" ? "bg-amber-50 text-amber-700" :
                        "bg-teal-50 text-teal-700"
                      }`}>
                        {insight.insightType === "StockOutRisk" ? "STOCK RUN-OUT" : 
                         insight.insightType === "DemandAnomaly" ? "ANOMALOUS TRAJECTORY" : "OPPORTUNITY"}
                      </span>
                      <span className={`${isRiskHigh ? "text-rose-600 font-extrabold animate-pulse" : "text-slate-400"}`}>
                        Risk Score: {insight.riskScore}/10
                      </span>
                    </div>

                    {/* Description */}
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-950">{insight.title}</h4>
                      <p className="text-slate-650 leading-normal">{insight.description}</p>
                    </div>

                    {/* Action item recommendation */}
                    <div className="pt-2 border-t border-dashed border-slate-200 text-[9px] text-slate-500 flex items-start gap-1">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-700">Recommended Audit Action:</strong> {insight.recommendedAction}
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                AI insights pipeline completed. No critical flags generated today.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
