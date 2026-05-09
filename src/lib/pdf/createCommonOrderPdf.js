import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JsBarcode from 'jsbarcode';
import { calcLinePrice, isGoldOrSilver } from '../calc';

function text(value) {
  return String(value || '');
}

function yen(value) {
  if (value === '' || value === null || value === undefined || Number(value) === 0) return '';
  return Number(value).toLocaleString('ja-JP');
}

function todayText() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function adjustedLength(value) {
  if (!value) return 0;
  let str = String(value);
  str = str.replace(/（株）|\(株\)/g, '■');
  str = str.replace(/[（）() 　]/g, '');
  return str.length;
}

function checkDigit(code12) {
  const nums = String(code12).split('').map(Number);
  const sum = nums.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

function makeBarcode(total) {
  const amount = String(Number(total || 0)).padStart(6, '0');
  const base12 = `291002${amount}`;
  return `${base12}${checkDigit(base12)}`;
}

function makeBarcodePngDataUrl(value) {
  const canvas = document.createElement('canvas');

  JsBarcode(canvas, value, {
    format: 'EAN13',
    displayValue: true,
    margin: 0,
    width: 1.55,
    height: 50,
    fontSize: 14,
    textMargin: 4,
  });

  return canvas.toDataURL('image/png');
}

function drawRect(page, x, y, w, h, options = {}) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderWidth: options.borderWidth ?? 0.8,
    borderColor: rgb(0, 0, 0),
    color: options.fill ? rgb(...options.fill) : undefined,
  });
}

function drawRawText(page, value, x, y, size, font, options = {}) {
  page.drawText(text(value), {
    x,
    y,
    size,
    font,
    color: options.color || rgb(0, 0, 0),
  });
}

function textWidth(font, value, size) {
  return font.widthOfTextAtSize(text(value), size);
}

function drawCenterText(page, value, x, y, w, h, size, font, options = {}) {
  const str = text(value);
  const width = textWidth(font, str, size);
  const tx = x + (w - width) / 2;
  const ty = y + (h - size) / 2 + 0.5;

  page.drawText(str, {
    x: tx,
    y: ty,
    size,
    font,
    color: options.color || rgb(0, 0, 0),
  });
}

function drawRightText(page, value, rightX, y, size, font) {
  const str = text(value);
  const width = textWidth(font, str, size);

  page.drawText(str, {
    x: rightX - width,
    y,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawCell(page, value, x, y, w, h, font, options = {}) {
  drawRect(page, x, y, w, h, {
    borderWidth: options.borderWidth ?? 0.8,
    fill: options.fill,
  });

  const size = options.size || 12;

  if (options.align === 'right') {
    drawRightText(page, value, x + w - 6, y + (h - size) / 2 + 0.5, size, font);
    return;
  }

  if (options.align === 'left') {
    drawRawText(page, value, x + 8, y + (h - size) / 2 + 0.5, size, font);
    return;
  }

  drawCenterText(page, value, x, y, w, h, size, font);
}

function drawBlackBar(page, label, x, y, w, h, font, size = 20) {
  drawRect(page, x, y, w, h, {
    fill: [0, 0, 0],
    borderWidth: 0.8,
  });

  drawCenterText(page, label, x, y, w, h, size, font, {
    color: rgb(1, 1, 1),
  });
}

export async function createCommonOrderPdf(orderData) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularFontBytes = await fetch('/fonts/NotoSansJP-Regular.ttf').then((res) =>
    res.arrayBuffer()
  );
  const boldFontBytes = await fetch('/fonts/NotoSansJP-Bold.ttf').then((res) =>
    res.arrayBuffer()
  );

  const regularFont = await pdfDoc.embedFont(regularFontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);

  const page = pdfDoc.addPage([595.28, 841.89]);

  const quantity = Number(orderData.quantity || 0);

  const line1 = orderData.textCommon?.line1 || '';
  const line2 = orderData.textCommon?.line2 || '';
  const second = orderData.textCommon?.second || '';

  const unit1 = calcLinePrice(line1);
  const unit2 = calcLinePrice(line2);
  const unit3 = calcLinePrice(second);

  const qty1 = unit1 ? quantity : '';
  const qty2 = unit2 ? quantity : '';
  const qty3 = unit3 ? quantity : '';

  const amount1 = unit1 && quantity ? unit1 * quantity : '';
  const amount2 = unit2 && quantity ? unit2 * quantity : '';
  const amount3 = unit3 && quantity ? unit3 * quantity : '';

  const colorUnit =
    (isGoldOrSilver(orderData.color1)
      ? (adjustedLength(line1) + adjustedLength(line2)) * 20
      : 0) +
    (isGoldOrSilver(orderData.color2) ? adjustedLength(second) * 20 : 0);

  const colorQty = colorUnit ? quantity : '';
  const colorAmount = colorUnit && quantity ? colorUnit * quantity : '';

  const optionUnit = orderData.options?.winter ? 100 : 0;
  const optionQty = optionUnit ? quantity : '';
  const optionAmount = optionUnit && quantity ? optionUnit * quantity : '';

  const total =
    Number(amount1 || 0) +
    Number(amount2 || 0) +
    Number(amount3 || 0) +
    Number(colorAmount || 0) +
    Number(optionAmount || 0);

  const barcodeValue = makeBarcode(total);

  const x = 42;
  const w = 512;

  drawBlackBar(page, 'ネーム刺繍注文書', x, 780, w, 32, boldFont, 21);

  drawCell(page, 'お客様名', x, 748, 78, 30, boldFont, { size: 13 });
  drawCell(page, orderData.customerName || '', x + 78, 748, 270, 30, regularFont, { size: 13 });
  drawCell(page, '注文日', x + 348, 748, 74, 30, boldFont, { size: 13 });
  drawCell(page, orderData.orderDate || todayText(), x + 422, 748, 90, 30, regularFont, { size: 13 });

  const orderTop = 708;
  const rowH = 31;

  const c0 = x;
  const c1 = x + 72;
  const c2 = x + 145;
  const c3 = x + 326;

  drawCell(page, '注文内容', c0, orderTop, 145, rowH, boldFont, { size: 14 });
  drawCell(page, '1ヶ所目', c2, orderTop, 181, rowH, boldFont, { size: 14 });
  drawCell(page, '2ヶ所目', c3, orderTop, 186, rowH, boldFont, { size: 14 });

  drawCell(page, '文字', c0, orderTop - rowH * 2, 72, rowH * 2, boldFont, { size: 14 });
  drawCell(page, '1行目', c1, orderTop - rowH, 73, rowH, boldFont, { size: 13 });
  drawCell(page, '2行目', c1, orderTop - rowH * 2, 73, rowH, boldFont, { size: 13 });

  // 1行目・2行目の入力欄は横罫線なしにするため、2行分をまとめて描画
  drawRect(page, c2, orderTop - rowH * 2, 181, rowH * 2);
  drawRect(page, c3, orderTop - rowH * 2, 186, rowH * 2);

  drawCenterText(page, line1, c2, orderTop - rowH, 181, rowH, 13, regularFont);
  drawCenterText(page, second, c3, orderTop - rowH, 186, rowH, 13, regularFont);
  drawCenterText(page, line2, c2, orderTop - rowH * 2, 181, rowH, 13, regularFont);

  let y = orderTop - rowH * 3;

  [
    ['場所', orderData.position1, orderData.position2],
    ['向き', orderData.direction1, orderData.direction2],
    ['糸色', orderData.color1, orderData.color2],
    ['書体', orderData.font1, orderData.font2],
    ['大きさ', orderData.size1, orderData.size2],
  ].forEach((row) => {
    drawCell(page, row[0], c0, y, 145, rowH, boldFont, { size: 14, align: 'left' });
    drawCell(page, row[1] || '', c2, y, 181, rowH, regularFont, { size: 13 });
    drawCell(page, row[2] || '', c3, y, 186, rowH, regularFont, { size: 13 });
    y -= rowH;
  });

  drawCell(page, '追加項目', c0, y, 145, rowH, boldFont, { size: 14, align: 'left' });
  drawCell(page, orderData.options?.winter ? '防寒着への刺繍' : '', c2, y, 367, rowH, regularFont, { size: 13 });
  y -= rowH;

  drawCell(page, '備考欄', c0, y, 145, rowH, boldFont, { size: 14, align: 'left' });
  drawCell(page, orderData.note || '', c2, y, 367, rowH, regularFont, { size: 13, align: 'left' });

  const priceTitleY = y - 46;
  const pH = 31;

  drawBlackBar(page, 'ネーム料金', x, priceTitleY, w, 32, boldFont, 21);

  const pTop = priceTitleY - pH;
  const p0 = x;
  const p1 = x + 72;
  const p2 = x + 235;
  const p3 = x + 327;
  const p4 = x + 399;

  drawCell(page, '料金項目', p0, pTop, 235, pH, boldFont, { size: 13 });
  drawCell(page, '単価', p2, pTop, 92, pH, boldFont, { size: 13 });
  drawCell(page, '数量', p3, pTop, 72, pH, boldFont, { size: 13 });
  drawCell(page, '金額', p4, pTop, 113, pH, boldFont, { size: 13 });

  drawCell(page, '基本料', p0, pTop - pH * 3, 72, pH * 3, boldFont, { size: 13 });
  drawCell(page, '1ヶ所目/1行目', p1, pTop - pH, 163, pH, regularFont, { size: 12, align: 'left' });
  drawCell(page, '1ヶ所目/2行目', p1, pTop - pH * 2, 163, pH, regularFont, { size: 12, align: 'left' });
  drawCell(page, '2ヶ所目', p1, pTop - pH * 3, 163, pH, regularFont, { size: 12, align: 'left' });

  drawCell(page, yen(unit1), p2, pTop - pH, 92, pH, regularFont, { size: 12, align: 'right' });
  drawCell(page, qty1, p3, pTop - pH, 72, pH, regularFont, { size: 12 });
  drawCell(page, yen(amount1), p4, pTop - pH, 113, pH, regularFont, { size: 12, align: 'right' });

  drawCell(page, yen(unit2), p2, pTop - pH * 2, 92, pH, regularFont, { size: 12, align: 'right' });
  drawCell(page, qty2, p3, pTop - pH * 2, 72, pH, regularFont, { size: 12 });
  drawCell(page, yen(amount2), p4, pTop - pH * 2, 113, pH, regularFont, { size: 12, align: 'right' });

  drawCell(page, yen(unit3), p2, pTop - pH * 3, 92, pH, regularFont, { size: 12, align: 'right' });
  drawCell(page, qty3, p3, pTop - pH * 3, 72, pH, regularFont, { size: 12 });
  drawCell(page, yen(amount3), p4, pTop - pH * 3, 113, pH, regularFont, { size: 12, align: 'right' });

  drawCell(page, '追加料金', p0, pTop - pH * 5, 72, pH * 2, boldFont, { size: 13 });
  drawCell(page, '糸色（金・銀）', p1, pTop - pH * 4, 163, pH, regularFont, { size: 12, align: 'left' });
  drawCell(page, '防寒着への刺繍', p1, pTop - pH * 5, 163, pH, regularFont, { size: 12, align: 'left' });

  drawCell(page, yen(colorUnit), p2, pTop - pH * 4, 92, pH, regularFont, { size: 12, align: 'right' });
  drawCell(page, colorQty, p3, pTop - pH * 4, 72, pH, regularFont, { size: 12 });
  drawCell(page, yen(colorAmount), p4, pTop - pH * 4, 113, pH, regularFont, { size: 12, align: 'right' });

  drawCell(page, yen(optionUnit), p2, pTop - pH * 5, 92, pH, regularFont, { size: 12, align: 'right' });
  drawCell(page, optionQty, p3, pTop - pH * 5, 72, pH, regularFont, { size: 12 });
  drawCell(page, yen(optionAmount), p4, pTop - pH * 5, 113, pH, regularFont, { size: 12, align: 'right' });

  drawCell(page, 'ネーム料金合計（税込）', p0, pTop - pH * 6, 235, pH, boldFont, { size: 13, align: 'left' });
  drawCell(page, '', p2, pTop - pH * 6, 277, pH, regularFont, { size: 12 });
  drawRightText(page, yen(total), x + w - 15, pTop - pH * 6 + 6, 18, boldFont);

  const barcodePngDataUrl = makeBarcodePngDataUrl(barcodeValue);
  const barcodeImage = await pdfDoc.embedPng(barcodePngDataUrl);

page.drawImage(barcodeImage, {
  x: 402,
  y: pTop - pH * 5.6 - 68,
  width: 150,
  height: 52,
});

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return URL.createObjectURL(blob);
}