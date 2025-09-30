import ThermalReceiptPrinter from '../src/index.js';
import { writeFileSync } from 'fs';

// Create printer instance
const printer = new ThermalReceiptPrinter();

// Define receipt data
const receiptData = {
  // Store information
  storeNameArabic: "المتجر الكبير",
  storeName: "Big Shop Store",
  storeInfo: {
    address: "123 Main Street, Cairo",
    phone: "Tel: +20 123 456 7890"
  },

  // Receipt metadata
  receiptInfo: {
    date: new Date().toLocaleString(),
    receiptNumber: "1234567",
    cashier: "Ahmed"
  },

  // Items
  items: [
    { nameArabic: "كولا", name: "Cola", qty: 2, price: 5.00 },
    { nameArabic: "خبز", name: "Bread", qty: 1, price: 3.50 },
    { nameArabic: "حليب", name: "Milk", qty: 3, price: 8.00 },
    { nameArabic: "شاي", name: "Tea", qty: 1, price: 12.00 },
    { nameArabic: "قهوة", name: "Coffee", qty: 2, price: 25.00 }
  ],

  // Totals
  subtotal: 77.50,
  tax: 10.85,
  taxRate: 14,
  total: 88.35,
  currency: "EGP",

  // Payment
  payment: {
    method: "Cash",
    change: 11.65
  },

  // Footer
  thankYouMessageArabic: "شكراً لزيارتكم",
  thankYouMessage: "Thank you for your visit!",
  barcode: "1234567890",
  website: "www.bigshop.com",
  logo: true
};

// Example 1: Get image buffer (for preview/display)
console.log('Generating receipt image...');
const imageBuffer = printer.getImage(receiptData);
console.log(`Image buffer size: ${imageBuffer.length} bytes`);

// Optionally save to file for preview
writeFileSync('./receipt_preview.png', imageBuffer);
console.log('Preview saved to: ./receipt_preview.png');

// Example 2: Print to USB printer
try {
  console.log('Printing receipt...');
  const result = await printer.print(receiptData);
  console.log(result.message);
} catch (error) {
  console.error('Print error:', error.message);
}
