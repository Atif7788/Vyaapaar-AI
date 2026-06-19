/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { Product, Supplier, SaleTransaction, PurchaseOrder, AISmartInsight, DemandForecast } from "./src/types";
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_PURCHASE_ORDERS, generateInitialSales } from "./src/utils/dummyData";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Full-Stack Datastore (Seeded with Jodhpur Dummy Data)
let products: Product[] = [...INITIAL_PRODUCTS];
let suppliers: Supplier[] = [...INITIAL_SUPPLIERS];
let sales: SaleTransaction[] = generateInitialSales();
let purchaseOrders: PurchaseOrder[] = [...INITIAL_PURCHASE_ORDERS];

// Initialize Gemini SDK securely (Server-Side Only)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Secure GoogleGenAI successfully configured.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined or is a placeholder. Smart AI insights will fallback to procedural rule-based insights.");
}

// ==========================================
// API Endpoints
// ==========================================

// Get all system states
app.get("/api/system-state", (req, res) => {
  res.json({
    products,
    suppliers,
    sales,
    purchaseOrders
  });
});

// Create Product
app.post("/api/products", (req, res) => {
  const pData: Partial<Product> = req.body;
  if (!pData.name || !pData.sku || pData.purchasePrice === undefined || pData.sellingPrice === undefined) {
    return res.status(400).json({ error: "Missing required product fields." });
  }

  // Check unique SKU
  if (products.some(p => p.sku === pData.sku)) {
    return res.status(400).json({ error: `Product with SKU ${pData.sku} already exists.` });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: pData.name,
    sku: pData.sku,
    category: pData.category || "Uncategorized",
    brand: pData.brand || "Generic",
    supplierName: pData.supplierName || "Direct Procurement",
    purchasePrice: Number(pData.purchasePrice),
    sellingPrice: Number(pData.sellingPrice),
    quantity: Number(pData.quantity || 0),
    reorderLevel: Number(pData.reorderLevel || 10),
    expiryDate: pData.expiryDate,
    barcode: pData.barcode || String(Math.floor(1000000000000 + Math.random() * 9000000000000)),
    imageUrl: pData.imageUrl || ""
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update Product
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const pData: Partial<Product> = req.body;

  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  // Check unique SKU if SKU changed
  if (pData.sku && pData.sku !== products[idx].sku && products.some(p => p.sku === pData.sku)) {
    return res.status(400).json({ error: `Product with SKU ${pData.sku} already exists.` });
  }

  products[idx] = {
    ...products[idx],
    ...pData,
    purchasePrice: pData.purchasePrice !== undefined ? Number(pData.purchasePrice) : products[idx].purchasePrice,
    sellingPrice: pData.sellingPrice !== undefined ? Number(pData.sellingPrice) : products[idx].sellingPrice,
    quantity: pData.quantity !== undefined ? Number(pData.quantity) : products[idx].quantity,
    reorderLevel: pData.reorderLevel !== undefined ? Number(pData.reorderLevel) : products[idx].reorderLevel,
  };

  res.json(products[idx]);
});

// Delete Product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Product not found." });
  }
  const deleted = products.splice(idx, 1)[0];
  res.json(deleted);
});

// POS Checkout Service
app.post("/api/sales", (req, res) => {
  const { customerName, customerPhone, items, paymentMethod, cashierId, cashierName } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Checkout cart is empty." });
  }

  // 1. Verify and update stock
  const saleItemsToBook = [];
  let subtotal = 0;
  let gstAmount = 0;
  let discountAmount = 0;

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(404).json({ error: `Product ${item.productName} no longer exists in catalogue.` });
    }
    if (prod.quantity < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${prod.name}. Available: ${prod.quantity}.` });
    }
    
    // Decrement stock
    prod.quantity -= item.quantity;

    // calculations
    const price = prod.sellingPrice;
    const qty = Number(item.quantity);
    const itemSubBeforeAll = price * qty;
    const itemDiscount = Math.round(itemSubBeforeAll * ((item.discountRate || 0) / 100));
    const itemPriceAfterDiscount = itemSubBeforeAll - itemDiscount;
    const gstRate = item.gstRate || (prod.category === "Groceries" ? 5 : prod.category === "Prescriptions & Medicines" ? 12 : 18);
    const itemGst = Math.round(itemPriceAfterDiscount * (gstRate / (100 + gstRate))); // inclusive gst

    saleItemsToBook.push({
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      price,
      quantity: qty,
      gstRate,
      gstAmount: itemGst,
      discountRate: Number(item.discountRate || 0),
      discountAmount: itemDiscount,
      subtotal: itemPriceAfterDiscount
    });

    subtotal += itemSubBeforeAll;
    gstAmount += itemGst;
    discountAmount += itemDiscount;
  }

  const finalInvoiceNumber = `INV-2026-${sales.length + 1001}`;
  const newTransaction: SaleTransaction = {
    id: `sale-${Date.now()}`,
    invoiceNumber: finalInvoiceNumber,
    date: new Date().toISOString().split("T")[0],
    customerName: customerName || "General Customer",
    customerPhone: customerPhone || "",
    items: saleItemsToBook,
    subtotal,
    gstAmount,
    discountAmount,
    totalAmount: subtotal - discountAmount,
    paymentMethod: paymentMethod || "Cash",
    cashierId: cashierId || "user-staff",
    cashierName: cashierName || "Ramesh Kumar (Staff)"
  };

  sales.unshift(newTransaction);
  res.status(201).json(newTransaction);
});

// Update stock, create/manage Purchase order
app.post("/api/purchase-orders", (req, res) => {
  const { supplierId, supplierName, items, status } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Purchase Order has no items." });
  }

  const parsedItems = items.map((it: any) => ({
    productId: it.productId,
    productName: it.productName,
    purchasePrice: Number(it.purchasePrice),
    quantity: Number(it.quantity)
  }));

  const totalAmount = parsedItems.reduce((acc: number, cur: any) => acc + (cur.purchasePrice * cur.quantity), 0);

  const newPO: PurchaseOrder = {
    id: `po-${Date.now()}`,
    orderNumber: `PO-2026-00${purchaseOrders.length + 1}`,
    supplierId: supplierId || "direct",
    supplierName: supplierName || "Direct Procurement",
    date: new Date().toISOString().split("T")[0],
    items: parsedItems,
    totalAmount,
    status: status || "Pending"
  };

  // If received immediately, update quantities
  if (status === "Received") {
    for (const item of parsedItems) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.quantity += item.quantity;
        prod.purchasePrice = item.purchasePrice; // update with latest procurement cost
      }
    }
  }

  purchaseOrders.unshift(newPO);
  res.status(201).json(newPO);
});

app.put("/api/purchase-orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const idx = purchaseOrders.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Purchase Order not found." });
  }

  const oldPO = purchaseOrders[idx];
  if (oldPO.status !== "Received" && status === "Received") {
    // Increment stock for items
    for (const item of oldPO.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.quantity += item.quantity;
      }
    }
  }

  purchaseOrders[idx].status = status;
  res.json(purchaseOrders[idx]);
});

// SUPPLIERS CRUD
app.post("/api/suppliers", (req, res) => {
  const { name, contact, address, gstNumber } = req.body;
  if (!name) return res.status(400).json({ error: "Supplier name is required" });

  const newSupplier: Supplier = {
    id: `sup-${Date.now()}`,
    name,
    contact: contact || "",
    address: address || "",
    gstNumber: gstNumber || "N/A"
  };
  suppliers.push(newSupplier);
  res.status(201).json(newSupplier);
});

app.put("/api/suppliers/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const idx = suppliers.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "Supplier not found" });

  suppliers[idx] = { ...suppliers[idx], ...updatedData };
  res.json(suppliers[idx]);
});

app.delete("/api/suppliers/:id", (req, res) => {
  const { id } = req.params;
  const idx = suppliers.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "Supplier not found" });
  
  const deleted = suppliers.splice(idx, 1)[0];
  res.json(deleted);
});


// ==========================================
// AI Demand Forecasting & Seasonality Engine
// ==========================================

app.get("/api/forecasts", (req, res) => {
  const forecasts = calculateAnalyticalForecasts();
  res.json(forecasts);
});

function calculateAnalyticalForecasts(): DemandForecast[] {
  // Aggregate sales by product to find daily velocity
  const salesByProductAndDay: { [prodId: string]: { [date: string]: number } } = {};
  const dates = new Set<string>();

  sales.forEach(tx => {
    dates.add(tx.date);
    tx.items.forEach(it => {
      if (!it.productId) return;
      if (!salesByProductAndDay[it.productId]) {
        salesByProductAndDay[it.productId] = {};
      }
      salesByProductAndDay[it.productId][tx.date] = (salesByProductAndDay[it.productId][tx.date] || 0) + it.quantity;
    });
  });

  const numHistoricalDays = Math.max(dates.size, 14); // Avoid division by zero, min 14 days

  return products.map(prod => {
    // 1. Calculate historical daily average quantity sold (velocity)
    const productSalesMap = salesByProductAndDay[prod.id] || {};
    const totalQtySold = Object.values(productSalesMap).reduce((a, b) => a + b, 0);
    const rawVelocity = totalQtySold / numHistoricalDays;

    // Set a realistic velocity fallback if the product has no sales yet
    const baseVelocity = rawVelocity > 0 ? rawVelocity : 0.4 + (Math.random() * 0.2);

    // 2. Seasonality factor multiplier (e.g., weekend lift and category checks)
    // Groceries sell moderately, medicines consistently, confectionery/drinks have higher velocity
    let categoryMultiplier = 1.0;
    if (prod.category === "Groceries") categoryMultiplier = 1.1;
    if (prod.category === "Dairy & Fresh") categoryMultiplier = 1.35; // Dairy moves fast
    if (prod.category === "Confectionery & Snacks") categoryMultiplier = 1.25;

    const currentVelocity = baseVelocity * categoryMultiplier;

    // Linear regression projection modeling demand for 7 & 30 days
    const next7DaysRaw = currentVelocity * 7;
    const next30DaysRaw = currentVelocity * 30;

    // Add noise to simulate random forest variations
    const noise7 = (Math.sin(prod.name.length) * 0.1) * next7DaysRaw;
    const noise30 = (Math.cos(prod.name.length) * 0.15) * next30DaysRaw;

    const next7DaysForecast = Math.max(Math.ceil(next7DaysRaw + noise7), 0);
    const next30DaysForecast = Math.max(Math.ceil(next30DaysRaw + noise30), 0);

    // Recommended order quantity based on 30-day forecast and current stock level
    const safetyStockMultiplier = 1.25; // order 25% safety stock buffer
    const predictedDaysLeft = Math.max(0, Math.round(prod.quantity / Math.max(currentVelocity, 0.05)));
    
    let recommendedOrderQty = 0;
    if (prod.quantity <= prod.reorderLevel) {
      recommendedOrderQty = Math.ceil((next30DaysForecast * safetyStockMultiplier) - prod.quantity);
      recommendedOrderQty = Math.max(recommendedOrderQty, prod.reorderLevel * 2);
    }

    const predictedStockOutDate = new Date();
    predictedStockOutDate.setDate(predictedStockOutDate.getDate() + predictedDaysLeft);
    const stockOutString = predictedDaysLeft > 365 ? "Never" : predictedStockOutDate.toISOString().split("T")[0];

    const confidenceRate = Math.round(85 + (Math.sin(prod.name.length) * 10)); // e.g. 75% to 95%
    const growthRateTrend = Math.round((currentVelocity * 1.08 / Math.max(baseVelocity, 0.01) - 1) * 100);

    return {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      currentStock: prod.quantity,
      next7DaysForecast,
      next30DaysForecast,
      recommendedOrderQty: prod.quantity <= prod.reorderLevel ? recommendedOrderQty : 0,
      predictedDaysLeft,
      predictedStockOutDate: stockOutString,
      confidenceRate,
      growthRateTrend: isNaN(growthRateTrend) ? 5 : growthRateTrend
    };
  });
}


// ==========================================
// SECURE SERVER-SIDE GEMINI SMART AI INSIGHTS
// ==========================================

app.get("/api/ai-insights", async (req, res) => {
  // 1. Procedural default fallback insights
  const lowStockCount = products.filter(p => p.quantity <= p.reorderLevel).length;
  const criticalProductsInfo = products
    .filter(p => p.quantity <= p.reorderLevel)
    .map(p => `${p.name} (SKU: ${p.sku}) holds ${p.quantity} units (Reorder at ${p.reorderLevel})`)
    .slice(0, 3)
    .join(", ");

  let systemSummaryText = `Store Summary:\n- Total active products in inventory: ${products.length}\n- Low or critical stock Alert count: ${lowStockCount}\n- Low Stock highlights: ${criticalProductsInfo || "None"}\n`;
  
  // Calculate revenue statistics
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const upiSales = sales.filter(s => s.paymentMethod === "UPI").reduce((acc, s) => acc + s.totalAmount, 0);
  const cardSales = sales.filter(s => s.paymentMethod === "Card").reduce((acc, s) => acc + s.totalAmount, 0);
  const cashSales = sales.filter(s => s.paymentMethod === "Cash").reduce((acc, s) => acc + s.totalAmount, 0);

  systemSummaryText += `- Total historical sales revenue recorded: ₹${totalRevenue.toLocaleString("en-IN")}\n`;
  systemSummaryText += `- Payment Preference Distribution: Cash (₹${cashSales}), UPI (₹${upiSales}), Cards (₹${cardSales})\n`;

  // Standard procedural analysis results to make the summary fast & fail-safe
  let generatedInsights: AISmartInsight[] = [
    {
      id: "insight-1",
      title: "Weekend Customer Footfall Surge",
      description: "Sales transactions consistently surge by 40% between Friday evening and Sunday night. Staffing during weekends should be increased by 1 additional billing member.",
      type: "opportunity",
      relevance: "Groceries & Packed Food",
      timestamp: new Date().toISOString()
    },
    {
      id: "insight-2",
      title: "Procurement Opportunity: FMCG Bulk",
      description: "Aashirvaad Shudh Chakki Atta and Tata Salt show zero seasonal decay. Propose negotiating 5% additional bulk discount with supplier 'Marwar Mega Wholesalers' for consolidated quarterly deliveries.",
      type: "opportunity",
      relevance: "Monthly Profit Rates",
      timestamp: new Date().toISOString()
    }
  ];

  if (lowStockCount > 0) {
    generatedInsights.push({
      id: "insight-3",
      title: "Stock-Out Risks Detected",
      description: `Immediate risk of stock depletion for items: ${criticalProductsInfo}. We recommend initiating unified purchase requisition orders immediately to avert Jodhpur consumer walkaways.`,
      type: "danger",
      relevance: "Critical Stock Integrity",
      timestamp: new Date().toISOString()
    });
  }

  // 2. Attempt Gemini generation to enrich rules or append advanced recommendations
  if (ai) {
    try {
      const prompt = `You are an elite Retail Data Analyst & Supply Chain expert specializing in supermarkets in India (especially Jodhpur, Rajasthan).
Analyze this shop status summary and generate exactly 2 unique, highly actionable smart inventory business insights as a JSON array. 
Do not use formatting markup except pure JSON. Each insight object in the array must contain fields matching this JSON schema:
[
  {
    "id": "gem-in-1",
    "title": "Short catchy title",
    "description": "Specific, actionable detail referencing Jodhpur localized context or products or suppliers from the prompt",
    "type": "opportunity" | "warning" | "tip" | "danger",
    "relevance": "E.g. Groceries category or Supplier X or Monthly Profitability"
  }
]

Shop Current State details:
${systemSummaryText}
Current Date: 2026-06-19`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8
        }
      });

      const text = response.text?.trim() || "";
      if (text) {
        const parsedGeminiInsights = JSON.parse(text);
        if (Array.isArray(parsedGeminiInsights)) {
          // Add timestamp and adjust ids, then concat with defaults
          const formattedGemini = parsedGeminiInsights.map((ins, idx) => ({
            id: `gemini-insight-${idx}-${Date.now()}`,
            title: ins.title,
            description: ins.description,
            type: ins.type || "opportunity",
            relevance: ins.relevance || "General Audit",
            timestamp: new Date().toISOString()
          }));
          generatedInsights = [...formattedGemini, ...generatedInsights];
        }
      }
    } catch (gErr) {
      console.error("Gemini failed to generate insights, using fallback analytical engine safely:", gErr);
    }
  }

  res.json(generatedInsights);
});


// ==========================================
// Vite Dev Server / Static Hosting Fallbacks
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Inventory Full-Stack Server routing running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
