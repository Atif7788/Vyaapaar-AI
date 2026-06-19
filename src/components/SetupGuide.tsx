/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Database, 
  Terminal, 
  FileCode, 
  Network, 
  Info, 
  BookOpen, 
  Settings,
  Pocket,
  Globe,
  Share2
} from "lucide-react";

export default function SetupGuide() {
  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Technical Architecture & Deployments</h1>
          <p className="text-xs text-slate-500">Examine systemic ER diagram schemas, backend endpoint structures, and deployment protocols</p>
        </div>

        <div className="text-[10px] text-slate-500 font-mono tracking-wide px-2.5 py-0.5 bg-slate-100 rounded">
          v1.4.0 Stable Core
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: ER diagrams and schemas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ER Diagram Representation using CSS & ASCII */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2.5 border-slate-100">
              <Network className="w-4.5 h-4.5 text-blue-500" />
              Relational Database Entity Relationship (ERD) Setup
            </h3>

            {/* Layout Boxes representing tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Product Card */}
              <div className="border border-slate-200 rounded overflow-hidden text-xs">
                <div className="bg-slate-800 text-white p-2 font-bold font-mono text-center relative text-[11px]">
                  TABLE: products
                  <span className="absolute top-1/2 -translate-y-1/2 right-2 text-[8px] bg-blue-600 px-1 py-0.2 rounded font-sans uppercase">PK: id</span>
                </div>
                <div className="p-2.5 bg-slate-50 divide-y divide-slate-100 space-y-1 font-mono text-[9px] text-slate-600">
                  <div className="flex justify-between"><span>id</span> <span className="text-slate-400">UUID VARCHAR(36)</span></div>
                  <div className="flex justify-between font-semibold text-slate-900"><span>sku</span> <span>VARCHAR(24) [UNIQUE]</span></div>
                  <div className="flex justify-between"><span>name</span> <span>VARCHAR(128)</span></div>
                  <div className="flex justify-between"><span>category</span> <span>VARCHAR(64)</span></div>
                  <div className="flex justify-between"><span>purchasePrice</span> <span>DECIMAL(10,2)</span></div>
                  <div className="flex justify-between"><span>sellingPrice</span> <span>DECIMAL(10,2)</span></div>
                  <div className="flex justify-between"><span>quantity</span> <span>INT (Current Stock)</span></div>
                  <div className="flex justify-between text-blue-600 font-bold"><span>supplierName</span> <span>FK (Table: suppliers)</span></div>
                </div>
              </div>

              {/* Suppliers Card */}
              <div className="border border-slate-200 rounded overflow-hidden text-xs">
                <div className="bg-slate-800 text-white p-2 font-bold font-mono text-center relative text-[11px]">
                  TABLE: suppliers
                  <span className="absolute top-1/2 -translate-y-1/2 right-2 text-[8px] bg-blue-600 px-1 py-0.2 rounded font-sans uppercase">PK: id</span>
                </div>
                <div className="p-2.5 bg-slate-50 divide-y divide-slate-100 space-y-1 font-mono text-[9px] text-slate-600">
                  <div className="flex justify-between"><span>id</span> <span className="text-slate-400">UUID VARCHAR(36)</span></div>
                  <div className="flex justify-between font-semibold text-slate-900"><span>name</span> <span>VARCHAR(100) [UNIQUE]</span></div>
                  <div className="flex justify-between"><span>contact</span> <span>VARCHAR(64)</span></div>
                  <div className="flex justify-between"><span>address</span> <span>TEXT</span></div>
                  <div className="flex justify-between"><span>gstNumber</span> <span>VARCHAR(15)</span></div>
                </div>
              </div>

              {/* Sales invoice Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-800 text-white p-2.5 font-bold font-mono text-center relative">
                  TABLE: sales_transactions
                  <span className="absolute top-1/2 -translate-y-1/2 right-2 text-[8px] bg-indigo-600 px-1 py-0.2 rounded">PK: id</span>
                </div>
                <div className="p-3 bg-slate-50 divide-y divide-slate-100 space-y-1 font-mono text-[10px] text-slate-600">
                  <div className="flex justify-between"><span>id</span> <span className="text-slate-400">UUID VARCHAR(36)</span></div>
                  <div className="flex justify-between font-semibold text-slate-900"><span>invoiceNumber</span> <span>VARCHAR(20)</span></div>
                  <div className="flex justify-between"><span>date</span> <span>DATE (Format: YYYY-MM-DD)</span></div>
                  <div className="flex justify-between"><span>customerName</span> <span>VARCHAR(100)</span></div>
                  <div className="flex justify-between text-indigo-600"><span>items</span> <span>JSON ARRAY (SaleItem[])</span></div>
                  <div className="flex justify-between font-bold text-slate-900"><span>totalAmount</span> <span>DECIMAL(10,2)</span></div>
                  <div className="flex justify-between"><span>paymentMethod</span> <span>ENUM ('UPI','Cash','Card')</span></div>
                </div>
              </div>

              {/* Purchase Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-800 text-white p-2.5 font-bold font-mono text-center relative">
                  TABLE: purchase_orders
                  <span className="absolute top-1/2 -translate-y-1/2 right-2 text-[8px] bg-indigo-600 px-1 py-0.2 rounded">PK: id</span>
                </div>
                <div className="p-3 bg-slate-50 divide-y divide-slate-100 space-y-1 font-mono text-[10px] text-slate-600">
                  <div className="flex justify-between"><span>id</span> <span className="text-slate-400">UUID VARCHAR(36)</span></div>
                  <div className="flex justify-between font-semibold text-slate-900"><span>orderNumber</span> <span>VARCHAR(20)</span></div>
                  <div className="flex justify-between text-indigo-600"><span>supplierId</span> <span>FK (Table: suppliers)</span></div>
                  <div className="flex justify-between"><span>items</span> <span>JSON ARRAY (POItem[])</span></div>
                  <div className="flex justify-between"><span>totalAmount</span> <span>DECIMAL(12,2)</span></div>
                  <div className="flex justify-between font-bold text-amber-700"><span>status</span> <span>ENUM ('Pending', 'Received')</span></div>
                </div>
              </div>

            </div>

            {/* ASCII Connection Lines */}
            <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 leading-normal border font-mono">
              <span className="font-bold text-slate-700 block mb-1">DATA FLOW RULES (ACID TRANSACTIONS):</span>
              1. checkout POS (POST /api/sales) builds sales_transaction record and immediately issues ATOMIC inventory decrement on products.quantity.<br/>
              2. receive PO (PUT /api/purchase-orders/:id/receive) alters status to 'Received' and triggers inventory increment on child product lines.
            </div>

          </div>

          {/* Web service endpoint list */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2.5 border-slate-100">
              <Terminal className="w-4.5 h-4.5 text-blue-600" />
              REST API Endpoint Registry Reference
            </h3>

            <div className="space-y-2.5">
              
              {/* Product GET Route */}
              <div className="p-2.5 rounded bg-slate-55 border border-slate-105 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">GET</span>
                  <span className="font-mono text-xs font-bold text-slate-800">/api/products</span>
                </div>
                <span className="text-[10px] text-slate-650">Fetch all products catalog including SKUs, margins, stock thresholds</span>
              </div>

              {/* Sales Checkout POS */}
              <div className="p-2.5 rounded bg-slate-55 border border-slate-105 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-800">/api/sales</span>
                </div>
                <span className="text-[10px] text-slate-650">Create standard cash/UPI billing ticket & check stock levels</span>
              </div>

              {/* Purchase orders */}
              <div className="p-2.5 rounded bg-slate-55 border border-slate-105 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-800">/api/purchase-orders</span>
                </div>
                <span className="text-[10px] text-slate-650">Issue stock replenishment requirements from wholesaler partners</span>
              </div>

              {/* AI Forecasts */}
              <div className="p-2.5 rounded bg-slate-55 border border-slate-105 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">GET</span>
                  <span className="font-mono text-xs font-bold text-slate-800">/api/forecasts?productId=:id</span>
                </div>
                <span className="text-[10px] text-slate-650">Process regresive forecasts & suggest ideal reorder sizes</span>
              </div>

              {/* AI Insights */}
              <div className="p-2.5 rounded bg-slate-55 border border-slate-105 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">GET</span>
                  <span className="font-mono text-xs font-bold text-slate-800">/api/ai-insights</span>
                </div>
                <span className="text-[10px] text-slate-650">Poll server insights enriched dynamically by Google GenAI models</span>
              </div>

            </div>

          </div>

        </div>

        {/* Right Side: Quick facts / Setup tutorials */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-900 border-b pb-2.5 border-slate-100 flex items-center gap-1.5">
              <Globe className="w-4.5 h-4.5 text-blue-500" />
              Cloud Run Deployment Guide
            </h3>

            <p className="text-slate-600 leading-normal">
              This full-stack application utilizes an Express backend coupled with Vite frontend middleware. To run in a standalone Linux container (Docker), deploy via following parameters:
            </p>

            <div className="bg-slate-950 p-3.5 rounded text-[10px] text-slate-100 font-mono space-y-2 overflow-x-auto select-all leading-normal border shadow-md">
              <p className="text-slate-400"># 1. Compile bundle</p>
              <p>npm run build</p>
              
              <p className="text-slate-400"># 2. Boot production server</p>
              <p>NODE_ENV=production npm start</p>
            </div>

            <div className="bg-blue-50 p-2.5 rounded border border-blue-105 space-y-1 leading-normal">
              <span className="font-bold text-blue-900 block uppercase text-[10px]">Gemini Secrets configuration</span>
              <p className="text-[10px] text-slate-700">
                Register environment key: <code className="font-bold font-mono">GEMINI_API_KEY</code> on your cloud host console. Once declared, the system automatically migrates standard procedural logs into AI-enriched suggestions.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-1 text-slate-900 font-bold border-b pb-2">
              <BookOpen className="w-4.5 h-4.5 text-slate-450" />
              Features Checklist Status
            </div>

            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>Auto-Reorder Alerts</strong>: Fully Operational
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>GST Invoicing</strong>: Inclusive calculation syncd
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>Regression Forecasts</strong>: Enabled dynamically
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>Google GenAI</strong>: Embedded at server layer
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
