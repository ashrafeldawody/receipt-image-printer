const ThermalReceiptPrinter = require('../src/index.js');

// Arabic receipt data with RTL support
const receiptData = {
  logo: true,
  storeNameArabic: "المتجر الكبير",
  storeName: "Big Store",
  storeInfo: {
    address: "شارع الهرم، الجيزة",
    phone: "٠١٢٣٤٥٦٧٨٩٠"
  },
  receiptInfo: {
    date: "٢٠٢٥-١٠-٠١ ١٤:٣٠",
    receiptNumber: "١٢٣٤٥٦٧",
    cashier: "أحمد"
  },
  items: [
    { nameArabic: "كولا", name: "Cola", qty: 2, price: 5.00 },
    { nameArabic: "خبز", name: "Bread", qty: 1, price: 3.50 },
    { nameArabic: "حليب", name: "Milk", qty: 3, price: 8.00 },
    { nameArabic: "شاي", name: "Tea", qty: 1, price: 12.00 },
    { nameArabic: "قهوة", name: "Coffee", qty: 2, price: 25.00 }
  ],
  subtotal: 77.50,
  tax: 10.85,
  taxRate: 14,
  total: 88.35,
  currency: "جنيه",
  payment: {
    method: "نقدي",
    change: 11.65
  },
  thankYouMessageArabic: "شكراً لزيارتكم",
  thankYouMessage: "Thank you for visiting",
  barcode: {
    value: "1234567890",
    format: "CODE128"
  },
  website: "المتجر-الكبير.com"
};

async function printArabicReceipt() {
  const printer = new ThermalReceiptPrinter();

  try {
    // Print receipt and open cash drawer
    await printer.print(receiptData, {
      openDrawer: true,
      density: 'd24'
    });
    console.log('✓ Receipt printed and drawer opened successfully');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

printArabicReceipt();