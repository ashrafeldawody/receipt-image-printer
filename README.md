# Receipt Image Printer

A Node.js SDK that converts receipts to images for thermal printers. **Solves the language encoding problem** by rendering text as images instead of relying on printer character sets.

Perfect for printing receipts in **Arabic, Chinese, Hebrew, Thai, or any language** without worrying about printer encoding support.

## Why Use This?

Traditional thermal printer libraries rely on the printer's built-in character sets, which often don't support:
- Arabic (RTL languages)
- Chinese/Japanese characters
- Hebrew, Thai, Korean, etc.

This library **renders everything as an image**, so any language that can be displayed in a browser font will work perfectly on your thermal printer.

## Features

- ✅ **Any language support** - Arabic, Chinese, Hebrew, Thai, etc.
- ✅ **RTL (Right-to-Left) support** - Perfect Arabic/Hebrew rendering
- ✅ **Bilingual receipts** - Mix languages freely
- ✅ 80mm thermal printer support (ESC/POS)
- ✅ Generate receipt images (PNG buffer)
- ✅ Direct USB printing
- ✅ **Cash drawer control** - Open drawer with custom kick codes
- ✅ Barcode support (CODE128, EAN13, etc.)
- ✅ Customizable layout
- ✅ TypeScript definitions included

## Installation

```bash
npm install receipt-image-printer
```

## Requirements

- Node.js >= 14.0.0
- USB thermal printer (80mm)

## Quick Start

```javascript
const ThermalReceiptPrinter = require('receipt-image-printer');

const printer = new ThermalReceiptPrinter();

const receiptData = {
  storeNameArabic: "المتجر الكبير",
  storeName: "Big Shop Store",
  storeInfo: {
    address: "123 Main Street, Cairo",
    phone: "Tel: +20 123 456 7890"
  },
  receiptInfo: {
    date: "2025-10-01 14:30",
    receiptNumber: "1234567",
    cashier: "Ahmed"
  },
  items: [
    { nameArabic: "كولا", name: "Cola", qty: 2, price: 5.00 },
    { nameArabic: "خبز", name: "Bread", qty: 1, price: 3.50 },
    { nameArabic: "حليب", name: "Milk", qty: 3, price: 8.00 }
  ],
  subtotal: 29.50,
  tax: 4.13,
  taxRate: 14,
  total: 33.63,
  currency: "EGP",
  payment: {
    method: "Cash",
    change: 6.37
  },
  thankYouMessageArabic: "شكراً لزيارتكم",
  thankYouMessage: "Thank you for your visit!",
  barcode: "1234567890",
  website: "www.bigshop.com",
  logo: true
};

// Print to USB thermal printer
await printer.print(receiptData);

// Print and open cash drawer
await printer.print(receiptData, { openDrawer: true });

// Get image buffer (for preview/display)
const imageBuffer = printer.getImage(receiptData);
```

## API Reference

### Constructor

```javascript
new ThermalReceiptPrinter(options)
```

**Options:**
- `width` (number): Receipt width in pixels. Default: 512 (80mm)
- `tempDir` (string): Directory for temporary files. Default: `process.cwd()`

### Methods

#### `print(receiptData, options)`

Prints receipt to USB thermal printer.

**Parameters:**
- `receiptData` (ReceiptData): Receipt configuration object
- `options` (PrintOptions): Print options
  - `density` ('s8' | 's24' | 'd8' | 'd24'): Print density. Default: 'd24'
  - `openDrawer` (boolean): Open cash drawer after printing. Default: false
  - `kickCode` (string): Custom kick code for drawer (e.g., "27,112,0,148,49")

**Returns:** `Promise<PrintResult>`

#### `openCashDrawer(options)`

Opens cash drawer without printing.

**Parameters:**
- `options` (DrawerOptions): Drawer options
  - `kickCode` (string): Custom kick code (e.g., "27,112,0,148,49")
  - `pin` (number): Pin number (0 or 1). Default: 0
  - `onTime` (number): ON time in milliseconds. Default: 120ms
  - `offTime` (number): OFF time in milliseconds. Default: 240ms

**Returns:** `Promise<{ success: boolean, message: string }>`

#### `getImage(receiptData)`

Returns receipt as PNG image buffer (for preview/display).

**Parameters:**
- `receiptData` (ReceiptData): Receipt configuration object

**Returns:** `Buffer` - PNG image buffer

## Receipt Data Structure

```typescript
interface ReceiptData {
  // Store information
  storeName?: string;
  storeNameArabic?: string;
  storeInfo?: {
    address?: string;
    phone?: string;
  };

  // Receipt metadata
  receiptInfo?: {
    date?: string;
    receiptNumber?: string;
    cashier?: string;
  };

  // Items (required)
  items: Array<{
    name?: string;
    nameArabic?: string;
    qty: number;
    price: number;
  }>;

  // Totals
  subtotal?: number;
  tax?: number;
  taxRate?: number;
  total: number; // required
  currency?: string;

  // Payment
  payment?: {
    method?: string;
    change?: number;
  };

  // Footer
  thankYouMessage?: string;
  thankYouMessageArabic?: string;
  barcode?: string | {
    value: string;
    format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
  };
  website?: string;
  logo?: boolean;
}
```

## Examples

### Print Receipt

```javascript
const ThermalReceiptPrinter = require('receipt-image-printer');

const printer = new ThermalReceiptPrinter();

const receiptData = {
  storeName: "My Store",
  items: [
    { name: "Item 1", qty: 2, price: 10.00 }
  ],
  total: 20.00
};

// Print to thermal printer
await printer.print(receiptData);

// Print and open cash drawer
await printer.print(receiptData, { openDrawer: true });
```

### Get Image Buffer (for preview/display)

```javascript
// Get image as buffer
const imageBuffer = printer.getImage(receiptData);

// Use in web server, display in UI, etc.
// Or save to file if needed
const { writeFileSync } = require('fs');
writeFileSync('./preview.png', imageBuffer);
```

### Open Cash Drawer

```javascript
// Open with default settings
await printer.openCashDrawer();

// Open with custom kick code
await printer.openCashDrawer({
  kickCode: '27,112,0,148,49'
});

// Open with custom timing
await printer.openCashDrawer({
  pin: 0,
  onTime: 120,
  offTime: 240
});
```

### Print with Custom Density

```javascript
await printer.print(receiptData, {
  density: 's24' // Lower density for faster printing
});
```

### Arabic Only Receipt

```javascript
const receiptData = {
  storeNameArabic: "متجري",
  items: [
    { nameArabic: "منتج", qty: 1, price: 15.00 }
  ],
  total: 15.00,
  thankYouMessageArabic: "شكراً"
};

await printer.print(receiptData);
```

### With Custom Barcode Format

```javascript
const receiptData = {
  storeName: "My Store",
  items: [{ name: "Item", qty: 1, price: 10.00 }],
  total: 10.00,
  barcode: {
    value: "123456789012",
    format: "EAN13"
  }
};

await printer.print(receiptData);
```

## Troubleshooting

### Printer Not Found

Make sure your USB printer is connected and drivers are installed:

```bash
# Linux - Install libusb
sudo apt-get install libusb-1.0-0-dev

# macOS - No additional setup needed

# Windows - Install zadig driver
```

### Arabic Text Issues

The library handles Arabic RTL rendering automatically. Make sure to use the `nameArabic` fields for Arabic text.

### Image Too Large

Adjust the width option:

```javascript
const printer = new ThermalReceiptPrinter({
  width: 384 // For 58mm printers
});
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
