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
    width: 1.45,
    height: 46,
    fontSize: 13,
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

function drawMultiLineLeftText(page, lines, x, y, w, h, size, font) {
  const arr = Array.isArray(lines) ? lines : String(lines || '').split('\n');
  const lineHeight = size + 3;
  const totalHeight = arr.length * lineHeight;
  const startY = y + (h - totalHeight) / 2 + size + 6;

  arr.forEach((line, index) => {
    page.drawText(text(line), {
      x: x + 8,
      y: startY - index * lineHeight,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

function drawCell(page, value, x, y, w, h, font, options = {}) {
  drawRect(page, x, y, w, h, {
    borderWidth: options.borderWidth ?? 0.8,
    fill: options.fill,
  });

  const size = options.size || 12;

  if (options.multiline) {
    drawMultiLineLeftText(page, value, x, y, w, h, size, font);
    return;
  }

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

function getIndividualRows(orderData) {
  const list = Array.isArray(orderData.textIndividual) ? orderData.textIndividual : [];

  return Array.from({ length: 10 }).map((_, index) => {
    const item = list[index] || {};

    return {
      label: `${index + 1}着目`,
      line1: item.line1 || '',
      line2: item.line2 || item.second || '',
      quantity: Number(item.quantity || item.qty || 0),
    };
  });
}

export async function createIndividualOrderPdf(orderData) {
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

  const rows = getIndividualRows(orderData);

  const totalQuantity = Number(
    orderData.quantity || rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  );

  let firstLineAmount = 0;
  let secondLineAmount = 0;
  let colorAmount = 0;

  rows.forEach((row) => {
    const q = Number(row.quantity || 0);
    if (!q) return;

    const line1Price = calcLinePrice(row.line1);
    const line2Price = calcLinePrice(row.line2);

    firstLineAmount += line1Price * q;
    secondLineAmount += line2Price * q;

    if (isGoldOrSilver(orderData.color1)) {
      colorAmount += adjustedLength(row.line1) * q * 20;
    }

    if (isGoldOrSilver(orderData.color2)) {
      colorAmount += adjustedLength(row.line2) * q * 20;
    }
  });

  const winterUnit = orderData.options?.winter ? 100 : 0;
  const winterQty = winterUnit ? totalQuantity : '';
  const winterAmount = winterUnit ? winterUnit * totalQuantity : 0;

  const total =
    Number(firstLineAmount || 0) +
    Number(secondLineAmount || 0) +
    Number(colorAmount || 0) +
    Number(winterAmount || 0);

  const barcodeValue = makeBarcode(total);

  const x = 42;
  const w = 512;

  /*
    タイトル
  */
  drawBlackBar(page, 'ネーム刺繍注文書', x, 780, w, 32, boldFont, 21);

  /*
    お客様名・注文日
  */
  drawCell(page, 'お客様名', x, 748, 78, 30, boldFont, { size: 13 });
  drawCell(page, orderData.customerName || '', x + 78, 748, 270, 30, regularFont, {
    size: 13,
  });
  drawCell(page, '注文日', x + 348, 748, 74, 30, boldFont, { size: 13 });
  drawCell(page, orderData.orderDate || todayText(), x + 422, 748, 90, 30, regularFont, {
    size: 13,
  });

  /*
    注文内容
  */
  const orderTop = 708;
  const patternRowH = 24;

  const c0 = x;
  const c1 = x + 72;
  const c2 = x + 145;
  const c3 = x + 326;

  drawCell(page, '注文内容', c0, orderTop, 145, 30, boldFont, { size: 14 });
  drawCell(page, '1ヶ所目/1行目', c2, orderTop, 181, 30, boldFont, { size: 12 });
  drawCell(page, '1ヶ所目/2行目 または 2ヶ所目', c3, orderTop, 186, 30, boldFont, {
    size: 10,
  });

  drawCell(page, '文字', c0, orderTop - patternRowH * 10, 72, patternRowH * 10, boldFont, {
    size: 14,
  });

  let y = orderTop - patternRowH;

  rows.forEach((row) => {
    drawCell(page, row.label, c1, y, 73, patternRowH, boldFont, { size: 10.5 });
    drawCell(page, row.line1, c2, y, 181, patternRowH, regularFont, { size: 10.5 });
    drawCell(page, row.line2, c3, y, 186, patternRowH, regularFont, { size: 10.5 });
    y -= patternRowH;
  });

  /*
    場所〜備考欄
    ここを少し狭くして、パターン10付近と下部のバランスを取る
  */
  const infoRowH = 24;

  [
    ['場所', orderData.position1, orderData.position2],
    ['向き', orderData.direction1, orderData.direction2],
    ['糸色', orderData.color1, orderData.color2],
    ['書体', orderData.font1, orderData.font2],
    ['大きさ', orderData.size1, orderData.size2],
  ].forEach((row) => {
    drawCell(page, row[0], c0, y, 145, infoRowH, boldFont, { size: 13, align: 'left' });
    drawCell(page, row[1] || '', c2, y, 181, infoRowH, regularFont, { size: 11.5 });
    drawCell(page, row[2] || '', c3, y, 186, infoRowH, regularFont, { size: 11.5 });
    y -= infoRowH;
  });

  drawCell(page, '追加項目', c0, y, 145, infoRowH, boldFont, { size: 13, align: 'left' });
  drawCell(page, orderData.options?.winter ? '防寒着への刺繍' : '', c2, y, 367, infoRowH, regularFont, {
    size: 11.5,
  });
  y -= infoRowH;

  drawCell(page, '備考欄', c0, y, 145, infoRowH, boldFont, { size: 13, align: 'left' });
  drawCell(page, orderData.note || '', c2, y, 367, infoRowH, regularFont, {
    size: 11.5,
    align: 'left',
  });

  /*
    ネーム料金
  */
  const priceTitleY = y - 42;
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

  drawCell(page, '基本料', p0, pTop - pH * 2, 72, pH * 2, boldFont, { size: 13 });

  drawCell(page, '1ヶ所目/1行目', p1, pTop - pH, 163, pH, regularFont, {
    size: 12,
    align: 'left',
  });
  drawCell(page, yen(firstLineAmount), p2, pTop - pH, 92, pH, regularFont, {
    size: 12,
    align: 'right',
  });
  drawCell(page, firstLineAmount ? 1 : '', p3, pTop - pH, 72, pH, regularFont, {
    size: 12,
  });
  drawCell(page, yen(firstLineAmount), p4, pTop - pH, 113, pH, regularFont, {
    size: 12,
    align: 'right',
  });

  /*
    ここが重なり対策。
    1つのセル内に2行で描く専用処理にしている。
  */
  drawCell(page, ['1ヶ所目/2行目', 'または 2ヶ所目'], p1, pTop - pH * 2, 163, pH, regularFont, {
    size: 10.2,
    multiline: true,
  });
  drawCell(page, yen(secondLineAmount), p2, pTop - pH * 2, 92, pH, regularFont, {
    size: 12,
    align: 'right',
  });
  drawCell(page, secondLineAmount ? 1 : '', p3, pTop - pH * 2, 72, pH, regularFont, {
    size: 12,
  });
  drawCell(page, yen(secondLineAmount), p4, pTop - pH * 2, 113, pH, regularFont, {
    size: 12,
    align: 'right',
  });

  drawCell(page, '追加料金', p0, pTop - pH * 4, 72, pH * 2, boldFont, { size: 13 });

  drawCell(page, '糸色（金・銀）', p1, pTop - pH * 3, 163, pH, regularFont, {
    size: 12,
    align: 'left',
  });
  drawCell(page, yen(colorAmount), p2, pTop - pH * 3, 92, pH, regularFont, {
    size: 12,
    align: 'right',
  });
  drawCell(page, colorAmount ? 1 : '', p3, pTop - pH * 3, 72, pH, regularFont, {
    size: 12,
  });
  drawCell(page, yen(colorAmount), p4, pTop - pH * 3, 113, pH, regularFont, {
    size: 12,
    align: 'right',
  });

  drawCell(page, '防寒着への刺繍', p1, pTop - pH * 4, 163, pH, regularFont, {
    size: 12,
    align: 'left',
  });
  drawCell(page, yen(winterUnit), p2, pTop - pH * 4, 92, pH, regularFont, {
    size: 12,
    align: 'right',
  });
  drawCell(page, winterQty, p3, pTop - pH * 4, 72, pH, regularFont, {
    size: 12,
  });
  drawCell(page, yen(winterAmount), p4, pTop - pH * 4, 113, pH, regularFont, {
    size: 12,
    align: 'right',
  });

  drawCell(page, 'ネーム料金合計（税込）', p0, pTop - pH * 5, 235, pH, boldFont, {
    size: 13,
    align: 'left',
  });
  drawCell(page, '', p2, pTop - pH * 5, 277, pH, regularFont, { size: 12 });
  drawRightText(page, yen(total), x + w - 15, pTop - pH * 5 + 6, 18, boldFont);

  /*
    バーコード
    はみ出し対策で少し小さく、少し上に配置
  */
  const barcodePngDataUrl = makeBarcodePngDataUrl(barcodeValue);
  const barcodeImage = await pdfDoc.embedPng(barcodePngDataUrl);

page.drawImage(barcodeImage, {
  x: 402,
  y: pTop - pH * 5 - 55,
  width: 150,
  height: 52,
});

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return URL.createObjectURL(blob);
}