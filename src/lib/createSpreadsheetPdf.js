'use client';

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzH0amQxluSgDd_GjAaRAgBjDFVF3lkyNjvU88iyUOBR3on1VmmEatFzH9jnU7gAVhDuA/exec';

function getTodayBase() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

async function makePdfOrderDate(customerName) {
  const baseDate = getTodayBase();

  const q = query(
    collection(db, 'pdfOrders'),
    where('customerName', '==', customerName || ''),
    where('orderDateBase', '==', baseDate)
  );

  const snap = await getDocs(q);
  const branch = String(snap.size + 1).padStart(2, '0');

  return {
    orderDateBase: baseDate,
    orderDate: `${baseDate}-${branch}`,
  };
}

function base64ToPdfBlob(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: 'application/pdf' });
}

export async function createSpreadsheetPdf({ orderData, mode, savePdf }) {
  const customerName = orderData.customerName || '';
  const { orderDateBase, orderDate } = savePdf
    ? await makePdfOrderDate(customerName)
    : { orderDateBase: getTodayBase(), orderDate: `${getTodayBase()}-preview` };

  const res = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify({
      orderData: {
        ...orderData,
        pdfOrderDate: orderDate,
      },
      mode,
      savePdf,
      pdfOrderDate: orderDate,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.error || 'PDF作成に失敗しました');
  }

  const blob = base64ToPdfBlob(json.pdfBase64);
  const previewUrl = URL.createObjectURL(blob);

  if (savePdf && json.fileId) {
    await addDoc(collection(db, 'pdfOrders'), {
      customerName,
      kana: orderData.kana || '',
      mode: mode || '',
      orderDate,
      orderDateBase,
      fileName: json.fileName || '',
      fileId: json.fileId || '',
      viewUrl: json.viewUrl || '',
      downloadUrl: json.downloadUrl || '',
      createdAt: serverTimestamp(),
    });
  }

  return {
    blob,
    previewUrl,
    fileName: json.fileName || '',
    fileId: json.fileId || '',
    viewUrl: json.viewUrl || '',
    downloadUrl: json.downloadUrl || '',
    orderDate,
  };
}