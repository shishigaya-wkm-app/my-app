'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import { calcLinePrice, isGoldOrSilver } from './calc';

function yen(value) {
  const n = Number(value || 0);
  return n ? n.toLocaleString('ja-JP') : '';
}

function todayText() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function esc(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function adjustedLength(text) {
  return String(text || '')
    .replace(/（株）|\(株\)/g, '■')
    .replace(/[（）() 　]/g, '').length;
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

function barcodeImg(total) {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, makeBarcode(total), {
    format: 'EAN13',
    displayValue: false,
    margin: 0,
    width: 2,
    height: 44,
  });
  return canvas.toDataURL('image/png');
}

function calcCommon(orderData) {
  const qty = Number(orderData.quantity || 0);
  const t1 = orderData.textCommon?.line1 || '';
  const t2 = orderData.textCommon?.line2 || '';
  const t3 = orderData.textCommon?.second || '';

  const u1 = calcLinePrice(t1);
  const u2 = calcLinePrice(t2);
  const u3 = calcLinePrice(t3);

  const a1 = u1 * qty;
  const a2 = u2 * qty;
  const a3 = u3 * qty;

  const colorUnit =
    (isGoldOrSilver(orderData.color1) ? (adjustedLength(t1) + adjustedLength(t2)) * 20 : 0) +
    (isGoldOrSilver(orderData.color2) ? adjustedLength(t3) * 20 : 0);

  const colorAmount = colorUnit * qty;
  const winterUnit = orderData.options?.winter ? 100 : 0;
  const winterAmount = winterUnit * qty;
  const total = a1 + a2 + a3 + colorAmount + winterAmount;

  return { qty, t1, t2, t3, u1, u2, u3, a1, a2, a3, colorUnit, colorAmount, winterUnit, winterAmount, total };
}

function calcIndividual(orderData) {
  const rows = Array.from({ length: 10 }, (_, i) => ({
    line1: orderData.textIndividual?.[i]?.line1 || '',
    line2: orderData.textIndividual?.[i]?.line2 || '',
  }));

  const firstTotal = rows.reduce((s, r) => s + calcLinePrice(r.line1), 0);
  const secondTotal = rows.reduce((s, r) => s + calcLinePrice(r.line2), 0);

  const colorAmount =
    (isGoldOrSilver(orderData.color1)
      ? rows.reduce((s, r) => s + adjustedLength(r.line1), 0) * 20
      : 0) +
    (isGoldOrSilver(orderData.color2)
      ? rows.reduce((s, r) => s + adjustedLength(r.line2), 0) * 20
      : 0);

  const filled = rows.filter((r) => r.line1 || r.line2).length;
  const winterUnit = orderData.options?.winter ? 100 : 0;
  const winterAmount = winterUnit ? filled * 100 : 0;
  const total = firstTotal + secondTotal + colorAmount + winterAmount;

  return { rows, firstTotal, secondTotal, colorAmount, winterUnit, winterAmount, filled, total };
}

const page = `
  width:794px;
  height:1123px;
  background:#fff;
  color:#000;
  box-sizing:border-box;
  padding:42px 48px;
  font-family:"Yu Gothic","Meiryo",sans-serif;
  font-size:14px;
`;

const table = `
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
`;

function cell(bg = '#fff', h = 30, align = 'center', size = 14) {
  return `
    border:1px solid #000;
    background:${bg};
    height:${h}px;
    text-align:${align};
    vertical-align:middle;
    padding:3px 5px;
    box-sizing:border-box;
    font-size:${size}px;
    line-height:1.2;
    word-break:break-word;
    white-space:pre-wrap;
  `;
}

function titleBar(text) {
  return `<div style="border:1px solid #000;background:#ddd;text-align:center;font-weight:bold;padding:5px 0;margin-top:14px;">${text}</div>`;
}

function buildCommonHtml(orderData) {
  const c = calcCommon(orderData);
  const bc = barcodeImg(c.total);

  return `
    <div style="${page}">
      <div style="text-align:center;font-size:30px;font-weight:bold;margin-bottom:18px;">ネーム刺繍注文書</div>

      <table style="${table};margin-bottom:12px;">
        <tr>
          <td style="${cell('#ddd', 34)};width:16%;">お客様名</td>
          <td style="${cell('#fff', 34, 'left')};width:46%;">${esc(orderData.customerName)}</td>
          <td style="${cell('#ddd', 34)};width:16%;">ご注文日</td>
          <td style="${cell('#fff', 34)};width:22%;">${todayText()}</td>
        </tr>
      </table>

      ${titleBar('注文内容')}

      <table style="${table}">
        <tr>
          <td style="${cell('#ddd', 30)};width:15%;"></td>
          <td style="${cell('#ddd', 30)};width:42.5%;">1ヶ所目</td>
          <td style="${cell('#ddd', 30)};width:42.5%;">2ヶ所目</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 70)}" rowspan="2">文字</td>
          <td style="${cell('#fff', 35)}">${esc(c.t1)}</td>
          <td style="${cell('#fff', 70)}" rowspan="2">${esc(c.t3)}</td>
        </tr>
        <tr>
          <td style="${cell('#fff', 35)}">${esc(c.t2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">場所</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.position1)}</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.position2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">向き</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.direction1)}</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.direction2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">糸色</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.color1)}</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.color2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">書体</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.font1)}</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.font2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">大きさ</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.size1)}</td>
          <td style="${cell('#fff', 30)}">${esc(orderData.size2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">数量</td>
          <td style="${cell('#fff', 30)}" colspan="2">${c.qty ? `${c.qty}着` : ''}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">追加項目</td>
          <td style="${cell('#fff', 30, 'left')}" colspan="2">${orderData.options?.winter ? '防寒着への刺繍' : ''}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 60)}">備考欄</td>
          <td style="${cell('#fff', 60, 'left')}" colspan="2">${esc(orderData.note)}</td>
        </tr>
      </table>

      ${titleBar('ネーム料金')}

      <table style="${table}">
        <tr>
          <td style="${cell('#ddd', 30)};width:40%;">料金項目</td>
          <td style="${cell('#ddd', 30)};width:20%;">単価</td>
          <td style="${cell('#ddd', 30)};width:20%;">数量</td>
          <td style="${cell('#ddd', 30)};width:20%;">金額</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">基本料</td>
          <td style="${cell('#fff', 30)}">${yen(c.u1)}</td>
          <td style="${cell('#fff', 30)}">${c.u1 ? c.qty : ''}</td>
          <td style="${cell('#fff', 30)}">${yen(c.a1)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">1ヶ所目/2行目</td>
          <td style="${cell('#fff', 30)}">${yen(c.u2)}</td>
          <td style="${cell('#fff', 30)}">${c.u2 ? c.qty : ''}</td>
          <td style="${cell('#fff', 30)}">${yen(c.a2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">2ヶ所目</td>
          <td style="${cell('#fff', 30)}">${yen(c.u3)}</td>
          <td style="${cell('#fff', 30)}">${c.u3 ? c.qty : ''}</td>
          <td style="${cell('#fff', 30)}">${yen(c.a3)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">糸色(金・銀)</td>
          <td style="${cell('#fff', 30)}">${yen(c.colorUnit)}</td>
          <td style="${cell('#fff', 30)}">${c.colorUnit ? c.qty : ''}</td>
          <td style="${cell('#fff', 30)}">${yen(c.colorAmount)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 30)}">追加料金<br>防寒着への刺繍</td>
          <td style="${cell('#fff', 30)}">${yen(c.winterUnit)}</td>
          <td style="${cell('#fff', 30)}">${c.winterUnit ? c.qty : ''}</td>
          <td style="${cell('#fff', 30)}">${yen(c.winterAmount)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 62)}">ネーム料金合計（税込）</td>
          <td style="${cell('#fff', 62)}" colspan="2">
            <div style="font-size:11px;margin-bottom:2px;">バーコード</div>
            <img src="${bc}" style="height:44px;max-width:240px;" />
          </td>
          <td style="${cell('#fff', 62)};font-size:24px;font-weight:bold;">${yen(c.total)}</td>
        </tr>
      </table>
    </div>
  `;
}

function buildIndividualHtml(orderData) {
  const c = calcIndividual(orderData);
  const bc = barcodeImg(c.total);

  const rows = c.rows.map((r, i) => `
    <tr>
      <td style="${cell('#ddd', 27)}">${i + 1}着目</td>
      <td style="${cell('#fff', 27)}">${esc(r.line1)}</td>
      <td style="${cell('#fff', 27)}">${esc(r.line2)}</td>
    </tr>
  `).join('');

  return `
    <div style="${page}">
      <div style="text-align:center;font-size:30px;font-weight:bold;margin-bottom:14px;">ネーム刺繍注文書</div>

      <table style="${table};margin-bottom:10px;">
        <tr>
          <td style="${cell('#ddd', 32)};width:16%;">お客様名</td>
          <td style="${cell('#fff', 32, 'left')};width:46%;">${esc(orderData.customerName)}</td>
          <td style="${cell('#ddd', 32)};width:16%;">ご注文日</td>
          <td style="${cell('#fff', 32)};width:22%;">${todayText()}</td>
        </tr>
      </table>

      ${titleBar('注文内容')}

      <table style="${table}">
        <tr>
          <td style="${cell('#ddd', 28)};width:15%;">数量</td>
          <td style="${cell('#ddd', 28)};width:42.5%;">1ヶ所目/1行目</td>
          <td style="${cell('#ddd', 28)};width:42.5%;">1ヶ所目/2行目 または 2ヶ所目</td>
        </tr>
        ${rows}
        <tr>
          <td style="${cell('#ddd', 28)}">場所</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.position1)}</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.position2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">向き</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.direction1)}</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.direction2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">糸色</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.color1)}</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.color2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">書体</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.font1)}</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.font2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">大きさ</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.size1)}</td>
          <td style="${cell('#fff', 28)}">${esc(orderData.size2)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">追加項目</td>
          <td style="${cell('#fff', 28, 'left')}" colspan="2">${orderData.options?.winter ? '防寒着への刺繍' : ''}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 48)}">備考欄</td>
          <td style="${cell('#fff', 48, 'left')}" colspan="2">${esc(orderData.note)}</td>
        </tr>
      </table>

      ${titleBar('ネーム料金')}

      <table style="${table}">
        <tr>
          <td style="${cell('#ddd', 28)};width:40%;">料金項目</td>
          <td style="${cell('#ddd', 28)};width:20%;">単価</td>
          <td style="${cell('#ddd', 28)};width:20%;">数量</td>
          <td style="${cell('#ddd', 28)};width:20%;">金額</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">基本料<br>1ヶ所目/1行目</td>
          <td style="${cell('#fff', 28)}">${yen(c.firstTotal)}</td>
          <td style="${cell('#fff', 28)}">${c.firstTotal ? 1 : ''}</td>
          <td style="${cell('#fff', 28)}">${yen(c.firstTotal)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">1ヶ所目/2行目</td>
          <td style="${cell('#fff', 28)}">${yen(c.secondTotal)}</td>
          <td style="${cell('#fff', 28)}">${c.secondTotal ? 1 : ''}</td>
          <td style="${cell('#fff', 28)}">${yen(c.secondTotal)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">糸色(金・銀)</td>
          <td style="${cell('#fff', 28)}">${yen(c.colorAmount)}</td>
          <td style="${cell('#fff', 28)}">${c.colorAmount ? 1 : ''}</td>
          <td style="${cell('#fff', 28)}">${yen(c.colorAmount)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 28)}">追加料金<br>防寒着への刺繍</td>
          <td style="${cell('#fff', 28)}">${yen(c.winterUnit)}</td>
          <td style="${cell('#fff', 28)}">${c.winterAmount ? c.filled : ''}</td>
          <td style="${cell('#fff', 28)}">${yen(c.winterAmount)}</td>
        </tr>
        <tr>
          <td style="${cell('#ddd', 58)}">ネーム料金合計（税込）</td>
          <td style="${cell('#fff', 58)}" colspan="2">
            <div style="font-size:11px;margin-bottom:2px;">バーコード</div>
            <img src="${bc}" style="height:42px;max-width:240px;" />
          </td>
          <td style="${cell('#fff', 58)};font-size:24px;font-weight:bold;">${yen(c.total)}</td>
        </tr>
      </table>
    </div>
  `;
}

export async function createOrderPdfBlob(orderData, mode = 'common') {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.innerHTML = mode === 'individual' ? buildIndividualHtml(orderData) : buildCommonHtml(orderData);
  document.body.appendChild(wrapper);

  const canvas = await html2canvas(wrapper.firstElementChild, {
    scale: 1.7,
    backgroundColor: '#ffffff',
  });

  document.body.removeChild(wrapper);

  const imgData = canvas.toDataURL('image/jpeg', 0.78);
  const pdf = new jsPDF('p', 'mm', 'a4', true);
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  return pdf.output('blob');
}