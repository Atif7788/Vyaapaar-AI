/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { SaleTransaction } from "../types";

export function generateAndDownloadInvoicePDF(txn: SaleTransaction) {
  // Base dimensions of A4: 210 x 297 mm
  // Margins: Left: 15mm, Right: 15mm (content width = 180mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // 1. Color Palette / Styling constants
  const primaryColor = [30, 41, 59]; // slate-800
  const accentColor = [37, 99, 235]; // blue-600
  const textColor = [51, 65, 85]; // slate-700
  const lightBgColor = [248, 250, 252]; // slate-50
  
  // Setup Grid Color
  doc.setDrawColor(226, 232, 240); // slate-200
  
  // Header: Shop Name & Address Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("SHREE BALAJI SUPERMARKET", 15, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("Sardarpura Bazar, Jodhpur, Rajasthan - 342001", 15, 25);
  doc.text("GSTIN: 08AAAAM1234M1Z5 | Support: +91 98765 43210", 15, 30);
  
  // Tax Invoice Accent Label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("TAX INVOICE", 195, 20, { align: "right" });
  
  // Solid horizontal banner separator
  doc.setLineWidth(0.4);
  doc.line(15, 35, 195, 35);
  
  // 2. Metadata: Billing Receiver and Invoice Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("BILL TO (CUSTOMER):", 15, 43);
  doc.text("INVOICE METADATA:", 115, 43);
  
  // Recipient details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(txn.customerName || "Walk-In Guest", 15, 49);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  if (txn.customerPhone) {
    doc.text(`Contact: +91 ${txn.customerPhone}`, 15, 54);
  } else {
    doc.text("Contact: Not Specified", 15, 54);
  }
  doc.text("Jodhpur, RJ, India", 15, 59);

  // Invoice parameters details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Invoice No:  ${txn.invoiceNumber}`, 115, 49);
  doc.text(`Date Issued: ${txn.date}`, 115, 54);
  doc.text(`Payment Mode: ${txn.paymentMethod || "UPI"}`, 115, 59);
  doc.text(`Billed By:    ${txn.cashierName || "Staff Desk"}`, 115, 64);

  // Thin separator lines
  doc.setLineWidth(0.2);
  doc.line(15, 69, 195, 69);

  // 3. Grid Table Header Block
  const tableY = 74;
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(15, tableY, 180, 8, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("#", 18, tableY + 5.5);
  doc.text("Item / Description", 28, tableY + 5.5);
  doc.text("Unit Price", 110, tableY + 5.5, { align: "right" });
  doc.text("Qty", 128, tableY + 5.5, { align: "right" });
  doc.text("Discount", 150, tableY + 5.5, { align: "right" });
  doc.text("GST Rate", 170, tableY + 5.5, { align: "right" });
  doc.text("Line Total", 192, tableY + 5.5, { align: "right" });

  // 4. Grid Table Rows Rendering
  let currentY = tableY + 8;
  txn.items.forEach((item, index) => {
    // Alternate row backgrounds for superior visual aesthetics
    if (index % 2 === 1) {
      doc.setFillColor(250, 252, 254);
      doc.rect(15, currentY, 180, 7.5, "F");
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    // Line item numbers
    doc.text(String(index + 1), 18, currentY + 5);
    
    // Truncate length of names to keep layout safe
    const displayName = item.productName.length > 38 
      ? item.productName.slice(0, 36) + "..." 
      : item.productName;
    doc.text(displayName, 28, currentY + 5);
    
    // Numeric cell details
    doc.text(`Rs. ${item.price.toFixed(2)}`, 110, currentY + 5, { align: "right" });
    doc.text(String(item.quantity), 128, currentY + 5, { align: "right" });
    doc.text(`${item.discountRate}%`, 150, currentY + 5, { align: "right" });
    doc.text(`${item.gstRate}%`, 170, currentY + 5, { align: "right" });
    doc.text(`Rs. ${item.subtotal.toFixed(2)}`, 192, currentY + 5, { align: "right" });
    
    // Grid bottom line
    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + 7.5, 195, currentY + 7.5);
    currentY += 7.5;
  });

  // 5. Financial Summary Calculations Box
  currentY += 5;
  const totalsXLabel = 145;
  const totalsXVal = 192;
  
  // Highlight Container Box
  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(219, 234, 254); // blue-100
  doc.rect(115, currentY, 80, 38, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  // Subtotal base gross
  doc.text("Before Tax Subtotal:", totalsXLabel, currentY + 6, { align: "right" });
  doc.text(`Rs. ${txn.subtotal.toFixed(2)}`, totalsXVal, currentY + 6, { align: "right" });
  
  // Discounts
  doc.setFont("helvetica", "normal");
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text("Discounts Allowed:", totalsXLabel, currentY + 12, { align: "right" });
  doc.text(`-Rs. ${txn.discountAmount.toFixed(2)}`, totalsXVal, currentY + 12, { align: "right" });
  
  // CGST & SGST Integrated Breakouts (Half of inclusive taxes)
  const gstPartition = txn.gstAmount / 2;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Integrated CGST (2.5% - 14%):", totalsXLabel, currentY + 18, { align: "right" });
  doc.text(`Rs. ${gstPartition.toFixed(2)}`, totalsXVal, currentY + 18, { align: "right" });
  
  doc.text("Integrated SGST (2.5% - 14%):", totalsXLabel, currentY + 24, { align: "right" });
  doc.text(`Rs. ${gstPartition.toFixed(2)}`, totalsXVal, currentY + 24, { align: "right" });
  
  // Internal divider
  doc.setDrawColor(191, 219, 254);
  doc.line(117, currentY + 28, 193, currentY + 28);
  
  // Grand final amount payable
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("Final Bill Amount (Net):", totalsXLabel, currentY + 33, { align: "right" });
  doc.text(`Rs. ${txn.totalAmount.toFixed(2)}`, totalsXVal, currentY + 33, { align: "right" });

  // 6. Signature / Bottom Terms & Stipulations
  const footerY = Math.max(currentY + 50, 240);
  
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(15, footerY, 180, 20, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("TERMS AND CONDITIONS:", 18, footerY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("1. All sales are conclusive. Perishables and medicines are exempted from standard trade replacement.", 18, footerY + 10);
  doc.text("2. This invoice is digitally generated under standard CGST/SGST framework rules. Physical signatures are exempt.", 18, footerY + 15);
  
  // Bottom greeting line
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("~~ Thank you for shopping with Shree Balaji! Please visit again. ~~", 105, footerY + 28, { align: "center" });

  // Output save file trigger
  doc.save(`Invoice_${txn.invoiceNumber}.pdf`);
}
