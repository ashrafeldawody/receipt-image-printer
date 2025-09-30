export interface StoreInfo {
  address?: string;
  phone?: string;
}

export interface ReceiptInfo {
  date?: string;
  receiptNumber?: string;
  cashier?: string;
}

export interface ReceiptItem {
  name?: string;
  nameArabic?: string;
  qty: number;
  price: number;
}

export interface Payment {
  method?: string;
  change?: number;
}

export interface Barcode {
  value: string;
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
}

export interface ReceiptData {
  storeName?: string;
  storeNameArabic?: string;
  storeInfo?: StoreInfo;
  receiptInfo?: ReceiptInfo;
  items: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  taxRate?: number;
  total: number;
  currency?: string;
  payment?: Payment;
  thankYouMessage?: string;
  thankYouMessageArabic?: string;
  barcode?: string | Barcode;
  website?: string;
  logo?: boolean;
}

export interface PrinterOptions {
  width?: number;
  tempDir?: string;
}

export interface PrintOptions {
  density?: 's8' | 's24' | 'd8' | 'd24';
}

export interface PrintResult {
  success: boolean;
  message: string;
}

export class ThermalReceiptPrinter {
  constructor(options?: PrinterOptions);

  /**
   * Print receipt to USB thermal printer
   * @param receiptData - Receipt configuration
   * @param options - Print options
   * @returns Promise with print result
   */
  print(receiptData: ReceiptData, options?: PrintOptions): Promise<PrintResult>;

  /**
   * Get receipt as PNG image buffer
   * @param receiptData - Receipt configuration object
   * @returns PNG image buffer
   */
  getImage(receiptData: ReceiptData): Buffer;
}

export default ThermalReceiptPrinter;
