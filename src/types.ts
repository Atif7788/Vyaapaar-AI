/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "Admin" | "Staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  shopName: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  supplierName: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  expiryDate?: string; // YYYY-MM-DD
  barcode: string;
  imageUrl?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
  gstNumber: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  purchasePrice: number;
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: "Pending" | "Received";
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  gstRate: number; // Percentage e.g. 18
  gstAmount: number;
  discountRate: number; // Percentage e.g. 10
  discountAmount: number;
  subtotal: number; // (price * quantity) - discountAmount + gstAmount
}

export interface SaleTransaction {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "Cash" | "UPI" | "Card";
  cashierId: string;
  cashierName: string;
}

export interface AISmartInsight {
  id: string;
  title: string;
  description: string;
  type: "warning" | "opportunity" | "tip" | "danger";
  relevance: string;
  timestamp: string;
}

export interface DemandForecast {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  next7DaysForecast: number;
  next30DaysForecast: number;
  recommendedOrderQty: number;
  predictedDaysLeft: number; // Days until stock out
  predictedStockOutDate: string; // YYYY-MM-DD or 'Never'
  confidenceRate: number; // Percentage e.g., 94
  growthRateTrend: number; // Percentage change e.g. 12
}

export interface ProfitLossSummary {
  revenue: number;
  cogs: number; // Cost of goods sold
  grossProfit: number;
  netProfit: number; // Sales revenue - COGS - estimated general bills/taxes
  marginRate: number; // Percentage
  growthRate: number; // Monthly profit growth
}
