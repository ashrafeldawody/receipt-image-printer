const { Printer, Image } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");
const { join } = require("path");
const { createCanvas, loadImage } = require("canvas");
const { writeFileSync } = require("fs");
const JsBarcode = require("jsbarcode");

// 80mm thermal printer = 512 pixels (most common for ESC/POS)
const receiptWidth = 512;

// Create receipt canvas
const canvas = createCanvas(receiptWidth, 2200);
const ctx = canvas.getContext('2d');

// White background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, receiptWidth, 2200);
ctx.fillStyle = 'black';

let yPos = 30;

// Logo placeholder (draw a simple shop icon - much larger)
ctx.fillStyle = 'black';
ctx.fillRect(receiptWidth/2 - 50, yPos, 100, 100);
ctx.fillStyle = 'white';
ctx.fillRect(receiptWidth/2 - 40, yPos + 10, 80, 80);
ctx.fillStyle = 'black';
yPos += 110;

// Store name (much larger and bolder)
ctx.font = 'bold 56px Arial';
ctx.textAlign = 'center';
ctx.fillText("المتجر الكبير", receiptWidth / 2, yPos);
yPos += 65;

// Store info (much larger)
ctx.font = 'bold 28px Arial';
ctx.fillText("شارع الهرم، الجيزة", receiptWidth / 2, yPos);
yPos += 40;
ctx.font = 'bold 24px Arial';
ctx.fillText("هاتف: ٠١٢٣٤٥٦٧٨٩٠", receiptWidth / 2, yPos);
yPos += 45;

// Divider line (thicker)
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(10, yPos);
ctx.lineTo(receiptWidth - 10, yPos);
ctx.stroke();
yPos += 35;

// Receipt info (much larger)
ctx.font = 'bold 26px Arial';
ctx.textAlign = 'right';
ctx.fillText("التاريخ: ٢٠٢٥-١٠-٠١ ١٤:٣٠", receiptWidth - 10, yPos);
yPos += 32;
ctx.fillText("رقم الفاتورة: ١٢٣٤٥٦٧", receiptWidth - 10, yPos);
yPos += 32;
ctx.fillText("الكاشير: أحمد", receiptWidth - 10, yPos);
yPos += 35;

// Divider (thicker)
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(10, yPos);
ctx.lineTo(receiptWidth - 10, yPos);
ctx.stroke();
yPos += 35;

// Items header (much larger and bolder)
ctx.font = 'bold 28px Arial';
ctx.textAlign = 'right';
ctx.fillText("الصنف", receiptWidth - 10, yPos);
ctx.textAlign = 'center';
ctx.fillText("الكمية", receiptWidth / 2 + 50, yPos);
ctx.fillText("السعر", receiptWidth / 2 - 30, yPos);
ctx.textAlign = 'left';
ctx.fillText("المجموع", 10, yPos);
yPos += 35;

// Divider
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(10, yPos);
ctx.lineTo(receiptWidth - 10, yPos);
ctx.stroke();
yPos += 35;

// Helper function to convert numbers to Arabic-Indic numerals
function toArabicNumerals(num) {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, d => arabicNumerals[d]);
}

// Items
const items = [
  { name: "كولا", qty: 2, price: 5.00 },
  { name: "خبز", qty: 1, price: 3.50 },
  { name: "حليب", qty: 3, price: 8.00 },
  { name: "شاي", qty: 1, price: 12.00 },
  { name: "قهوة", qty: 2, price: 25.00 }
];

ctx.font = 'bold 28px Arial';
items.forEach(item => {
  // Arabic text - align right
  ctx.textAlign = 'right';
  ctx.fillText(item.name, receiptWidth - 10, yPos);

  ctx.textAlign = 'center';
  ctx.fillText(toArabicNumerals(item.qty), receiptWidth / 2 + 50, yPos);
  ctx.fillText(toArabicNumerals(item.price.toFixed(2)), receiptWidth / 2 - 30, yPos);

  ctx.textAlign = 'left';
  const total = item.qty * item.price;
  ctx.fillText(toArabicNumerals(total.toFixed(2)), 10, yPos);

  yPos += 45;
});

yPos += 15;

// Divider
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(10, yPos);
ctx.lineTo(receiptWidth - 10, yPos);
ctx.stroke();
yPos += 35;

// Subtotal
ctx.font = 'bold 30px Arial';
ctx.textAlign = 'right';
ctx.fillText("المجموع الفرعي: " + toArabicNumerals("77.50"), receiptWidth - 10, yPos);
yPos += 35;

// Tax
ctx.font = 'bold 28px Arial';
ctx.textAlign = 'right';
ctx.fillText("الضريبة (٪١٤): " + toArabicNumerals("10.85"), receiptWidth - 10, yPos);
yPos += 40;

// Divider
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(10, yPos);
ctx.lineTo(receiptWidth - 10, yPos);
ctx.stroke();
yPos += 45;

// Total
ctx.font = 'bold 42px Arial';
ctx.textAlign = 'right';
ctx.fillText("الإجمالي: " + toArabicNumerals("88.35") + " جنيه", receiptWidth - 10, yPos);
yPos += 50;

// Divider
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(10, yPos);
ctx.lineTo(receiptWidth - 10, yPos);
ctx.stroke();
yPos += 40;

// Payment method
ctx.font = 'bold 26px Arial';
ctx.textAlign = 'right';
ctx.fillText("طريقة الدفع: نقدي", receiptWidth - 10, yPos);
yPos += 32;
ctx.fillText("الباقي: " + toArabicNumerals("11.65") + " جنيه", receiptWidth - 10, yPos);
yPos += 50;

// Thank you message
ctx.font = 'bold 34px Arial';
ctx.textAlign = 'center';
ctx.fillText("شكراً لزيارتكم", receiptWidth / 2, yPos);
yPos += 55;

// Barcode (much larger)
const barcodeCanvas = createCanvas(450, 140);
JsBarcode(barcodeCanvas, "1234567890", {
  format: "CODE128",
  width: 3,
  height: 90,
  displayValue: true,
  fontSize: 22
});
ctx.drawImage(barcodeCanvas, (receiptWidth - 450) / 2, yPos);
yPos += 150;

// Website
ctx.font = 'bold 22px Arial';
ctx.textAlign = 'center';
ctx.fillText("المتجر-الكبير.com", receiptWidth / 2, yPos);
yPos += 50;

// Trim canvas to actual content height
const finalCanvas = createCanvas(receiptWidth, yPos);
const finalCtx = finalCanvas.getContext('2d');
finalCtx.fillStyle = 'white';
finalCtx.fillRect(0, 0, receiptWidth, yPos);
finalCtx.drawImage(canvas, 0, 0);

// Save preview
const previewFile = join(process.cwd(), 'receipt_preview.png');
writeFileSync(previewFile, finalCanvas.toBuffer('image/png'));
console.log('Receipt preview saved to:', previewFile);

// Print to device
const device = new USB();
device.open(async function(err){
  if(err){
    console.error("Device error:", err);
    return;
  }

  let printer = new Printer(device, {});
  printer.align("ct");
  // Use 'd24' density for better quality on thermal printers
  printer = await printer.image(await Image.load(previewFile), 'd24');
  printer.cut().close();
  console.log('Printing complete');
});