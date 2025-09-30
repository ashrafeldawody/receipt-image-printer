import { Printer, Image } from "@node-escpos/core";
import USB from "@node-escpos/usb-adapter";
import { createCanvas } from "canvas";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import JsBarcode from "jsbarcode";

/**
 * Thermal Receipt Printer SDK
 * Generates and prints receipts for 80mm ESC/POS thermal printers with Arabic support
 */
export class ThermalReceiptPrinter {
  constructor(options = {}) {
    this.width = options.width || 512; // 80mm thermal printer width
    this.tempDir = options.tempDir || process.cwd();
  }

  /**
   * Generate receipt image from receipt data
   * @param {Object} receiptData - Receipt configuration object
   * @returns {Buffer} - PNG image buffer
   */
  generateReceipt(receiptData) {
    const {
      storeName = "",
      storeNameArabic = "",
      storeInfo = {},
      receiptInfo = {},
      items = [],
      subtotal = 0,
      tax = 0,
      total = 0,
      payment = {},
      thankYouMessage = "",
      thankYouMessageArabic = "",
      barcode = null,
      website = ""
    } = receiptData;

    const canvas = createCanvas(this.width, 2200);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.width, 2200);
    ctx.fillStyle = 'black';

    let yPos = 30;

    // Logo (if provided)
    if (receiptData.logo) {
      // Simple placeholder logo
      ctx.fillStyle = 'black';
      ctx.fillRect(this.width/2 - 50, yPos, 100, 100);
      ctx.fillStyle = 'white';
      ctx.fillRect(this.width/2 - 40, yPos + 10, 80, 80);
      ctx.fillStyle = 'black';
      yPos += 110;
    }

    // Store name
    if (storeNameArabic) {
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(storeNameArabic, this.width / 2, yPos);
      yPos += 65;
    }

    if (storeName) {
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.fillText(storeName, this.width / 2, yPos);
      yPos += 40;
    }

    // Store info
    if (storeInfo.address) {
      ctx.font = 'bold 24px Arial';
      ctx.fillText(storeInfo.address, this.width / 2, yPos);
      yPos += 35;
    }
    if (storeInfo.phone) {
      ctx.fillText(storeInfo.phone, this.width / 2, yPos);
      yPos += 45;
    }

    // Divider
    this._drawLine(ctx, yPos, 3);
    yPos += 35;

    // Receipt info
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'left';
    if (receiptInfo.date) {
      ctx.fillText(`Date: ${receiptInfo.date}`, 10, yPos);
      yPos += 32;
    }
    if (receiptInfo.receiptNumber) {
      ctx.fillText(`Receipt #: ${receiptInfo.receiptNumber}`, 10, yPos);
      yPos += 32;
    }
    if (receiptInfo.cashier) {
      ctx.fillText(`Cashier: ${receiptInfo.cashier}`, 10, yPos);
      yPos += 35;
    }

    // Divider
    this._drawLine(ctx, yPos, 3);
    yPos += 35;

    // Items header
    ctx.font = 'bold 28px Arial';
    ctx.fillText("Item", 10, yPos);
    ctx.textAlign = 'center';
    ctx.fillText("Qty", this.width / 2 - 30, yPos);
    ctx.fillText("Price", this.width / 2 + 50, yPos);
    ctx.textAlign = 'right';
    ctx.fillText("Total", this.width - 10, yPos);
    yPos += 35;

    // Divider
    this._drawLine(ctx, yPos, 3);
    yPos += 35;

    // Items
    ctx.font = 'bold 28px Arial';
    items.forEach(item => {
      ctx.textAlign = 'left';
      ctx.direction = 'rtl';
      if (item.nameArabic) {
        ctx.fillText(item.nameArabic, 10, yPos);
      }
      ctx.direction = 'ltr';
      if (item.name) {
        ctx.font = 'bold 22px Arial';
        ctx.fillText(item.name, 10, yPos + (item.nameArabic ? 28 : 0));
      }

      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.qty.toString(), this.width / 2 - 30, yPos);
      ctx.fillText(item.price.toFixed(2), this.width / 2 + 50, yPos);

      ctx.textAlign = 'right';
      const itemTotal = item.qty * item.price;
      ctx.fillText(itemTotal.toFixed(2), this.width - 10, yPos);

      yPos += 55;
    });

    yPos += 15;

    // Divider
    this._drawLine(ctx, yPos, 3);
    yPos += 35;

    // Subtotal
    if (subtotal) {
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'left';
      ctx.fillText("Subtotal:", 10, yPos);
      ctx.textAlign = 'right';
      ctx.fillText(subtotal.toFixed(2), this.width - 10, yPos);
      yPos += 35;
    }

    // Tax
    if (tax) {
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Tax (${receiptData.taxRate || 14}%):`, 10, yPos);
      ctx.textAlign = 'right';
      ctx.fillText(tax.toFixed(2), this.width - 10, yPos);
      yPos += 40;
    }

    // Divider
    this._drawLine(ctx, yPos, 4);
    yPos += 45;

    // Total
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'left';
    ctx.fillText("TOTAL:", 10, yPos);
    ctx.textAlign = 'right';
    ctx.fillText(`${total.toFixed(2)} ${receiptData.currency || 'EGP'}`, this.width - 10, yPos);
    yPos += 50;

    // Divider
    this._drawLine(ctx, yPos, 3);
    yPos += 40;

    // Payment method
    if (payment.method) {
      ctx.font = 'bold 26px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Payment: ${payment.method}`, 10, yPos);
      yPos += 32;
    }
    if (payment.change !== undefined) {
      ctx.fillText(`Change: ${payment.change.toFixed(2)} ${receiptData.currency || 'EGP'}`, 10, yPos);
      yPos += 50;
    }

    // Thank you message
    if (thankYouMessageArabic) {
      ctx.font = 'bold 34px Arial';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(thankYouMessageArabic, this.width / 2, yPos);
      yPos += 45;
    }
    if (thankYouMessage) {
      ctx.direction = 'ltr';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(thankYouMessage, this.width / 2, yPos);
      yPos += 55;
    }

    // Barcode
    if (barcode) {
      const barcodeCanvas = createCanvas(450, 140);
      JsBarcode(barcodeCanvas, barcode.value || barcode, {
        format: barcode.format || "CODE128",
        width: 3,
        height: 90,
        displayValue: true,
        fontSize: 22
      });
      ctx.drawImage(barcodeCanvas, (this.width - 450) / 2, yPos);
      yPos += 150;
    }

    // Website
    if (website) {
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(website, this.width / 2, yPos);
      yPos += 50;
    }

    // Trim canvas to actual content height
    const finalCanvas = createCanvas(this.width, yPos);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.fillStyle = 'white';
    finalCtx.fillRect(0, 0, this.width, yPos);
    finalCtx.drawImage(canvas, 0, 0);

    return finalCanvas.toBuffer('image/png');
  }

  /**
   * Print receipt to USB thermal printer
   * @param {Object} receiptData - Receipt configuration
   * @param {Object} options - Print options
   */
  async print(receiptData, options = {}) {
    return new Promise((resolve, reject) => {
      const device = new USB();

      device.open(async (err) => {
        if (err) {
          return reject(err);
        }

        try {
          // Generate receipt image
          const imageBuffer = this.generateReceipt(receiptData);

          // Save to temp file (required by Image.load)
          const tempFile = join(this.tempDir, `receipt_${Date.now()}.png`);
          writeFileSync(tempFile, imageBuffer);

          // Print
          let printer = new Printer(device, {});
          printer.align("ct");
          printer = await printer.image(await Image.load(tempFile), options.density || 'd24');
          printer.cut().close();

          // Clean up
          unlinkSync(tempFile);

          resolve({ success: true, message: 'Receipt printed successfully' });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get receipt as image buffer (for preview/display)
   * @param {Object} receiptData - Receipt configuration
   * @returns {Buffer} PNG image buffer
   */
  getImage(receiptData) {
    return this.generateReceipt(receiptData);
  }

  /**
   * Helper method to draw horizontal line
   */
  _drawLine(ctx, yPos, width = 2) {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(10, yPos);
    ctx.lineTo(this.width - 10, yPos);
    ctx.stroke();
  }
}

export default ThermalReceiptPrinter;
