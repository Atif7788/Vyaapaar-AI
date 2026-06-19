/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Supplier, SaleTransaction, PurchaseOrder } from "../types";

export const JODHPUR_SHOPS = [
  { id: "groceries", name: "Shree Balaji Groceries (Sardarpura)", category: "Groceries" },
  { id: "pharmacy", name: "Cactus Medicals (Shastri Nagar)", category: "Medical Store" },
  { id: "stationery", name: "Modern Stationery & Prints (Chopasni)", category: "Stationery Shop" },
  { id: "restaurant", name: "Jodhpur Sweet Home & Restaurant", category: "Restaurant & Cafe" }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Marwar Mega Wholesalers",
    contact: "+91 94141 12345",
    address: "Pal Road, Jodhpur, Rajasthan - 342008",
    gstNumber: "08AAAAM1234M1Z5"
  },
  {
    id: "sup-2",
    name: "Rajasthan Pharma Agency",
    contact: "+91 291 2645678",
    address: "Soor Sagar Road, Jodhpur, Rajasthan - 342001",
    gstNumber: "08BCDEF5678A2Z0"
  },
  {
    id: "sup-3",
    name: "Classmate Stationery Hub & Co",
    contact: "+91 98290 87654",
    address: "Tripolia Bazar, Jodhpur, Rajasthan - 342002",
    gstNumber: "08GHIJK9012B3Z1"
  },
  {
    id: "sup-4",
    name: "Amul Saras Dairy Distributors",
    contact: "+91 94600 55443",
    address: "Industrial Area Phase II, Jodhpur, Rajasthan - 342003",
    gstNumber: "08LMNOP3456C4Z2"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Groceries / Daily Essentials
  {
    id: "prod-1",
    name: "Aashirvaad Shudh Chakki Atta 10kg",
    sku: "ATT-AASH-10K",
    category: "Groceries",
    brand: "ITC",
    supplierName: "Marwar Mega Wholesalers",
    purchasePrice: 380,
    sellingPrice: 440,
    quantity: 45,
    reorderLevel: 15,
    expiryDate: "2026-12-15",
    barcode: "8901725181222",
    imageUrl: ""
  },
  {
    id: "prod-2",
    name: "Fortune Mustard Oil 1L",
    sku: "OIL-FORT-01L",
    category: "Groceries",
    brand: "Adani Wilmar",
    supplierName: "Marwar Mega Wholesalers",
    purchasePrice: 145,
    sellingPrice: 175,
    quantity: 6, // Low stock! Below reorder of 10
    reorderLevel: 10,
    expiryDate: "2026-10-05",
    barcode: "8906007281033",
    imageUrl: ""
  },
  {
    id: "prod-3",
    name: "Tata Salt Lite 1kg",
    sku: "SAL-TATA-01K",
    category: "Groceries",
    brand: "Tata",
    supplierName: "Marwar Mega Wholesalers",
    purchasePrice: 22,
    sellingPrice: 28,
    quantity: 80,
    reorderLevel: 20,
    expiryDate: "2027-08-10",
    barcode: "8901058002313",
    imageUrl: ""
  },
  {
    id: "prod-4",
    name: "Surf Excel Easy Wash 1kg",
    sku: "DET-SURF-01K",
    category: "Groceries",
    brand: "Unilever",
    supplierName: "Marwar Mega Wholesalers",
    purchasePrice: 110,
    sellingPrice: 140,
    quantity: 2, // Critical low stock!
    reorderLevel: 8,
    expiryDate: "2028-01-01",
    barcode: "8901030753516",
    imageUrl: ""
  },
  // Medical
  {
    id: "prod-5",
    name: "Dolo 650mg Tablets (Strip of 15)",
    sku: "MED-DOLO-650",
    category: "Prescriptions & Medicines",
    brand: "Micro Labs",
    supplierName: "Rajasthan Pharma Agency",
    purchasePrice: 24,
    sellingPrice: 32,
    quantity: 120,
    reorderLevel: 30,
    expiryDate: "2027-04-12",
    barcode: "8904091122334",
    imageUrl: ""
  },
  {
    id: "prod-6",
    name: "Crocin Pain Relief Strip",
    sku: "MED-CROC-010",
    category: "Prescriptions & Medicines",
    brand: "GSK",
    supplierName: "Rajasthan Pharma Agency",
    purchasePrice: 18,
    sellingPrice: 24,
    quantity: 121,
    reorderLevel: 25,
    expiryDate: "2026-09-30",
    barcode: "8902091445566",
    imageUrl: ""
  },
  {
    id: "prod-13",
    name: "Betadine Ointment 20g",
    sku: "MED-BETA-020",
    category: "Prescriptions & Medicines",
    brand: "Win-Medicare",
    supplierName: "Rajasthan Pharma Agency",
    purchasePrice: 95,
    sellingPrice: 125,
    quantity: 4, // Critical stock
    reorderLevel: 10,
    expiryDate: "2026-08-15",
    barcode: "8903091123456",
    imageUrl: ""
  },
  // Stationery / Books
  {
    id: "prod-7",
    name: "Classmate Notebook Spiral A4 (120 Pgs)",
    sku: "STN-CLAS-A4S",
    category: "Stationery",
    brand: "ITC classmate",
    supplierName: "Classmate Stationery Hub & Co",
    purchasePrice: 45,
    sellingPrice: 65,
    quantity: 65,
    reorderLevel: 15,
    expiryDate: undefined,
    barcode: "8901725110192",
    imageUrl: ""
  },
  {
    id: "prod-8",
    name: "Parker Beta Standard Blue Pen",
    sku: "STN-PARK-BLU",
    category: "Stationery",
    brand: "Parker",
    supplierName: "Classmate Stationery Hub & Co",
    purchasePrice: 140,
    sellingPrice: 200,
    quantity: 14,
    reorderLevel: 15, // Low stock
    expiryDate: undefined,
    barcode: "8901235123458",
    imageUrl: ""
  },
  // Dairy & Packed Foods
  {
    id: "prod-9",
    name: "Amul Salted Butter 100g",
    sku: "DRY-AMUL-100",
    category: "Dairy & Fresh",
    brand: "Amul",
    supplierName: "Amul Saras Dairy Distributors",
    purchasePrice: 46,
    sellingPrice: 56,
    quantity: 42,
    reorderLevel: 12,
    expiryDate: "2026-07-28",
    barcode: "8901262010043",
    imageUrl: ""
  },
  {
    id: "prod-10",
    name: "Saras Toned Fresh Milk 1L",
    sku: "DRY-SARA-01L",
    category: "Dairy & Fresh",
    brand: "Saras",
    supplierName: "Amul Saras Dairy Distributors",
    purchasePrice: 48,
    sellingPrice: 54,
    quantity: 35,
    reorderLevel: 10,
    expiryDate: "2026-06-25", // Short expiry
    barcode: "8906012620785",
    imageUrl: ""
  },
  {
    id: "prod-11",
    name: "Cadbury Dairy Milk Silk 150g",
    sku: "CON-CADB-SIL",
    category: "Confectionery & Snacks",
    brand: "Mondelez",
    supplierName: "Marwar Mega Wholesalers",
    purchasePrice: 125,
    sellingPrice: 160,
    quantity: 28,
    reorderLevel: 8,
    expiryDate: "2026-11-20",
    barcode: "8901058002276",
    imageUrl: ""
  },
  {
    id: "prod-12",
    name: "Haldiram Bhujia Sev 400g",
    sku: "CON-HALD-BHU",
    category: "Confectionery & Snacks",
    brand: "Haldiram's",
    supplierName: "Marwar Mega Wholesalers",
    purchasePrice: 82,
    sellingPrice: 110,
    quantity: 50,
    reorderLevel: 12,
    expiryDate: "2026-12-10",
    barcode: "8904063200787",
    imageUrl: ""
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-1",
    orderNumber: "PO-2026-001",
    supplierId: "sup-1",
    supplierName: "Marwar Mega Wholesalers",
    date: "2026-05-10",
    items: [
      { productId: "prod-1", productName: "Aashirvaad Shudh Chakki Atta 10kg", purchasePrice: 380, quantity: 20 },
      { productId: "prod-2", productName: "Fortune Mustard Oil 1L", purchasePrice: 145, quantity: 15 }
    ],
    totalAmount: 9775,
    status: "Received"
  },
  {
    id: "po-2",
    orderNumber: "PO-2026-002",
    supplierId: "sup-4",
    supplierName: "Amul Saras Dairy Distributors",
    date: "2026-06-15",
    items: [
      { productId: "prod-9", productName: "Amul Salted Butter 100g", purchasePrice: 46, quantity: 30 },
      { productId: "prod-10", productName: "Saras Toned Fresh Milk 1L", purchasePrice: 48, quantity: 40 }
    ],
    totalAmount: 3300,
    status: "Received"
  },
  {
    id: "po-3",
    orderNumber: "PO-2026-003",
    supplierId: "sup-2",
    supplierName: "Rajasthan Pharma Agency",
    date: "2026-06-18",
    items: [
      { productId: "prod-5", productName: "Dolo 650mg Tablets (Strip of 15)", purchasePrice: 24, quantity: 50 },
      { productId: "prod-13", productName: " Betadine Ointment 20g", purchasePrice: 95, quantity: 10 }
    ],
    totalAmount: 2150,
    status: "Pending"
  }
];

// Helper to generate initial simulated transactions across the last 30 days
// We want ~40 sales entries to make high quality charts
export function generateInitialSales(): SaleTransaction[] {
  const sales: SaleTransaction[] = [];
  const paymentMethods: ("Cash" | "UPI" | "Card")[] = ["UPI", "Cash", "UPI", "Card", "Cash", "UPI"];
  const customerNames = [
    "Rahul Sharma", "Pooja Bhati", "Arvind Singh", "Sanjay Jha", "Anil Vyas",
    "Divya Purohit", "Mahendra Shah", "Karan Gehlot", "Sunita Kanwar", "Vikram Mehta",
    "Manish Gahlot", "Neeraj Goyal", "Rajendra Prasad", "Mukesh Sankhla", "Dimple Chouhan"
  ];

  // We go back 45 days. Today in code context is 2026-06-19.
  const today = new Date("2026-06-19");
  
  let invoiceCounter = 1001;

  for (let i = 45; i >= 0; i--) {
    const saleDate = new Date(today);
    saleDate.setDate(today.getDate() - i);
    
    // Some seasonality: higher sales on weekends (Friday, Saturday, Sunday)
    const dayOfWeek = saleDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const salesCount = isWeekend ? 2 : 1; // 2 invoices on weekend, 1 on weekday on avg
    
    for (let s = 0; s < salesCount; s++) {
      // Pick random customer
      const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
      
      // Select 1 to 4 random products
      const itemsCount = 1 + Math.floor(Math.random() * 3);
      const saleItems = [];
      let subtotal = 0;
      let gstAmount = 0;
      let discountAmount = 0;
      
      const usedProductIndices = new Set();
      
      for (let j = 0; j < itemsCount; j++) {
        let pIndex = Math.floor(Math.random() * INITIAL_PRODUCTS.length);
        while (usedProductIndices.has(pIndex)) {
          pIndex = Math.floor(Math.random() * INITIAL_PRODUCTS.length);
        }
        usedProductIndices.add(pIndex);
        
        const prod = INITIAL_PRODUCTS[pIndex];
        const qty = 1 + Math.floor(Math.random() * 3);
        const price = prod.sellingPrice;
        
        const gstRate = prod.category === "Groceries" ? 5 : prod.category === "Prescriptions & Medicines" ? 12 : 18;
        const discountRate = Math.random() > 0.7 ? 10 : 0; // 10% discount sometimes
        
        const itemSubBeforeAll = price * qty;
        const itemDiscount = Math.round(itemSubBeforeAll * (discountRate / 100));
        const itemPriceAfterDiscount = itemSubBeforeAll - itemDiscount;
        const itemGst = Math.round(itemPriceAfterDiscount * (gstRate / (100 + gstRate))); // inclusive GST
        
        saleItems.push({
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          price: prod.sellingPrice,
          quantity: qty,
          gstRate,
          gstAmount: itemGst,
          discountRate,
          discountAmount: itemDiscount,
          subtotal: itemPriceAfterDiscount
        });
        
        subtotal += itemSubBeforeAll;
        gstAmount += itemGst;
        discountAmount += itemDiscount;
      }
      
      const totalAmount = subtotal - discountAmount;
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      sales.push({
        id: `sale-${invoiceCounter}`,
        invoiceNumber: `INV-${saleDate.getFullYear()}-${invoiceCounter}`,
        date: saleDate.toISOString().split("T")[0],
        customerName: customer,
        customerPhone: "+91 98765 " + String(10000 + Math.floor(Math.random() * 90000)),
        items: saleItems,
        subtotal,
        gstAmount,
        discountAmount,
        totalAmount,
        paymentMethod,
        cashierId: s % 2 === 0 ? "user-admin" : "user-staff",
        cashierName: s % 2 === 0 ? "Bhajan Lal (Owner)" : "Ramesh Kumar (Staff)"
      });
      
      invoiceCounter++;
    }
  }
  
  return sales.sort((a, b) => b.date.localeCompare(a.date) || b.invoiceNumber.localeCompare(a.invoiceNumber));
}
