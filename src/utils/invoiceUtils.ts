import { Order } from '../types/OrderTypes';
import { jsPDF } from 'jspdf';

interface LocalInvoiceItem {
  name: string;
  quantity: number;
  price: number; 
  giftCardKey?: string;
}

export function createInvoicePdfDoc(order: Order): jsPDF { 
  const doc = new jsPDF(); 
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight(); 
  const margin = 25; 
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Document Styles ---
  const primaryColor = '#1F2937'; 
  const secondaryColor = '#4B5563'; 
  const tableHeaderBgColor = '#F3F4F6'; 
  const lineColor = '#E5E7EB'; 

  const titleFontSize = 24;
  const sectionTitleFontSize = 14;
  const bodyFontSize = 10;
  const smallFontSize = 8;

  doc.setTextColor(primaryColor);

  // --- Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(titleFontSize);
  doc.text('INVOICE', pageWidth / 2, y, { align: 'center' });
  y += 15;
  doc.setDrawColor(lineColor);
  doc.line(margin, y, pageWidth - margin, y); 
  y += 10; 

  // --- Invoice Details & Customer Info ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(bodyFontSize);

  const detailsStartX = margin;
  const customerStartX = pageWidth / 2 + 10;
  const initialYBox = y;

  // Invoice Details (Left Side)
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice To:', detailsStartX, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, detailsStartX, y);
  y += 6;
  doc.text(order.shippingAddress.address, detailsStartX, y);
  y += 6;
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.zipCode}`, detailsStartX, y);
  y += 6;
  doc.text(order.customerEmail, detailsStartX, y);

  // Order/Invoice Meta (Right Side)
  let metaY = initialYBox;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Number:', customerStartX, metaY, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  doc.text(`INV-${order.orderNumber}`, customerStartX + 40, metaY, { align: 'left' });
  metaY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Order Number:', customerStartX, metaY, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  doc.text(order.orderNumber, customerStartX + 40, metaY, { align: 'left' });
  metaY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', customerStartX, metaY, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  let processedDate: Date;
  if (order.date && typeof (order.date as any).toDate === 'function') {
    processedDate = (order.date as any).toDate();
  } else if (order.date instanceof Date) {
    processedDate = order.date;
  } else {
    processedDate = new Date();
  }
  doc.text(processedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), customerStartX + 40, metaY, { align: 'left' });

  y = Math.max(y, metaY) + 15; 

  // --- Order Items Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(sectionTitleFontSize);
  doc.text('Order Summary', margin, y);
  y += 8;

  const tableHeaders = ['Item Description', 'Qty', 'Unit Price', 'Total'];
  const colWidths = [contentWidth * 0.5, contentWidth * 0.15, contentWidth * 0.2, contentWidth * 0.15];
  const tableHeaderY = y;
  const cellPadding = 2;

  // Draw table header background
  doc.setFillColor(tableHeaderBgColor);
  doc.rect(margin, tableHeaderY, contentWidth, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(bodyFontSize);
  doc.setTextColor(primaryColor);
  let currentX = margin + cellPadding;
  tableHeaders.forEach((header, i) => {
    doc.text(header, currentX, tableHeaderY + 7); 
    currentX += colWidths[i];
  });
  y = tableHeaderY + 10; 

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(bodyFontSize - 1); 
  doc.setTextColor(secondaryColor);

  order.items.forEach((item: LocalInvoiceItem) => {
    if (y > pageHeight - margin - 30) { 
      doc.addPage();
      y = margin;
    }
    const itemRowY = y + 7;
    currentX = margin + cellPadding;
    doc.text(item.name, currentX, itemRowY);
    currentX += colWidths[0];
    doc.text(item.quantity.toString(), currentX, itemRowY, { align: 'right', maxWidth: colWidths[1] - cellPadding * 2 });
    currentX += colWidths[1];
    doc.text(`TND ${item.price.toFixed(2)}`, currentX, itemRowY, { align: 'right', maxWidth: colWidths[2] - cellPadding * 2 });
    currentX += colWidths[2];
    doc.text(`TND ${(item.price * item.quantity).toFixed(2)}`, currentX, itemRowY, { align: 'right', maxWidth: colWidths[3] - cellPadding * 2 });
    y += 10; 
    doc.setDrawColor(lineColor);
    doc.line(margin, y, pageWidth - margin, y); 
  });

  // --- Gift Card Keys (If Any) ---
  const giftCardItems = order.items.filter(item => item.giftCardKey);
  if (giftCardItems.length > 0) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(bodyFontSize);
    doc.setTextColor(primaryColor);
    doc.text('Gift Card Keys:', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodyFontSize -1);
    giftCardItems.forEach((item: LocalInvoiceItem) => {
      doc.text(`${item.name}:`, margin + 5, y);
      doc.setFont('courier', 'normal'); 
      doc.text(item.giftCardKey!, margin + 50, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
    });
  }
  y += 5;

  // --- Totals Section ---
  const totalsX = pageWidth - margin - (contentWidth * 0.35); 
  const totalsValueX = pageWidth - margin - cellPadding;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(bodyFontSize);
  doc.setTextColor(primaryColor);

  doc.setDrawColor(lineColor);
  doc.line(totalsX - 5, y, pageWidth - margin, y); 
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(sectionTitleFontSize - 2); 
  doc.text('Grand Total:', totalsX, y, { align: 'right' });
  doc.setFontSize(sectionTitleFontSize); 
  doc.text(`TND ${order.total.toFixed(2)}`, totalsValueX, y, { align: 'right' });
  y += 15;

  // --- Footer ---
  const footerStartY = pageHeight - margin + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(smallFontSize);
  doc.setTextColor(secondaryColor);
  doc.setDrawColor(lineColor);
  doc.line(margin, footerStartY - 5, pageWidth - margin, footerStartY - 5); 

  doc.text('SharePay | ISET GAFSA | pfe2025nsd@gmail.com', pageWidth / 2, footerStartY, { align: 'center' });
  doc.text('Thank you for your business!', pageWidth / 2, footerStartY + 5, { align: 'center' });

  return doc;
}

// Function to generate a PDF invoice for an order
export const generateInvoicePDF = (order: Order): Blob => {
  const doc = createInvoicePdfDoc(order);
  return doc.output('blob');
};

// Get a filename for the invoice
export const getInvoiceFilename = (order: Order): string => {
  return `Invoice_${order.orderNumber}.pdf`;
};

// Function to create a data URL for the invoice PDF (for React components)
export const getInvoiceDataUrl = async (order: Order): Promise<string> => {
  const doc = createInvoicePdfDoc(order);
  return doc.output('datauristring');
};
