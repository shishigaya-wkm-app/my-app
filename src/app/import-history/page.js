'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const REQUIRED_HEADERS = [
  'customerName',
  'kana',
  'orderDate',
  'mode',
  'position1',
  'position2',
  'direction1',
  'direction2',
  'color1',
  'color2',
  'font1',
  'font2',
  'size1',
  'size2',
];

const KANA_LIST = ['ア行', 'カ行', 'サ行', 'タ行', 'ナ行', 'ハ行', 'マ行', 'ヤ行', 'ラ行', 'ワ行'];

// CSVパース（そのまま）
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((v) => v !== '')) rows.push(row);

  return rows;
}

function getOrderDateBase(orderDate) {
  return String(orderDate || '').split('-')[0] || '';
}

function normalizeMode(value) {
  if (value === 'individual' || value === '個別') return 'individual';
  return 'common';
}

function validateItem(item, rowNumber) {
  const errors = [];

  if (!item.customerName) errors.push('顧客名が空欄');
  if (!item.kana) errors.push('フリガナが空欄');
  if (!KANA_LIST.includes(item.kana)) errors.push('フリガナが不正');
  if (!item.orderDate) errors.push('注文日が空欄');
  if (!String(item.orderDate).includes('-')) errors.push('注文日に枝番がない');

  return errors.length > 0
    ? {
        rowNumber,
        customerName: item.customerName || '',
        orderDate: item.orderDate || '',
        reason: errors.join(' / '),
      }
    : null;
}

function makeIndividualRows(item) {
  return Array.from({ length: 10 }, (_, i) => ({
    line1: item[`individual${i + 1}Line1`] || '',
    line2: item[`individual${i + 1}Line2`] || '',
  }));
}

function makeDocData(item) {
  const mode = normalizeMode(item.mode);

  const baseData = {
    orderDate: item.orderDate || '',
    orderDateBase: getOrderDateBase(item.orderDate),
    customerName: item.customerName || '',
    kana: item.kana || '',
    mode,

    position1: item.position1 || '',
    position2: item.position2 || '',
    direction1: item.direction1 || '',
    direction2: item.direction2 || '',

    color1: item.color1 || '',
    color2: item.color2 || '',
    font1: item.font1 || '',
    font2: item.font2 || '',
    size1: item.size1 || '',
    size2: item.size2 || '',

    // 🔥 追加
    note: item.note || '',

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    importedAt: serverTimestamp(),
  };

  if (mode === 'individual') {
    return {
      ...baseData,
      textIndividual: makeIndividualRows(item),
    };
  }

  return {
    ...baseData,
    textCommon: {
      line1: item.commonLine1 || '',
      line2: item.commonLine2 || '',
      second: item.commonSecond || '',
    },
  };
}

export default function ImportHistoryPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorRows, setErrorRows] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMessage('');
    setResult(null);
    setErrorRows([]);

    const text = await file.text();
    const csvRows = parseCsv(text.replace(/^\uFEFF/, ''));

    const headerRow = csvRows[0].map((h) => h.trim());

    const parsedItems = csvRows.slice(1).map((row, index) => {
      const obj = {};
      headerRow.forEach((header, colIndex) => {
        obj[header] = row[colIndex] || '';
      });
      obj.__rowNumber = index + 2;
      return obj;
    });

    setItems(parsedItems);
    setMessage(`${parsedItems.length}件読み込みました`);
  };

  const importToFirestore = async () => {
    setImporting(true);

    let success = 0;

    for (const item of items) {
      try {
        await addDoc(collection(db, 'orders'), makeDocData(item));
        success++;
      } catch (e) {
        console.error(e);
      }
    }

    setResult({ success });
    setImporting(false);
  };

  return (
    <main style={{ padding: '32px' }}>

      <button onClick={() => router.push('/')}>戻る</button>

      <h1>CSV取り込み</h1>

      <input type="file" accept=".csv" onChange={handleFile} />

      {items.length > 0 && (
        <>
          <button onClick={importToFirestore}>
            取り込み
          </button>

          <table>
            <thead>
              <tr>
                <th>顧客名</th>
                <th>注文日</th>
                <th>モード</th>
                <th>文字1</th>
                <th>文字2</th>
                <th>備考</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 10).map((item, i) => (
                <tr key={i}>
                  <td>{item.customerName}</td>
                  <td>{item.orderDate}</td>
                  <td>{item.mode}</td>
                  <td>{item.commonLine1 || item.individual1Line1}</td>
                  <td>{item.commonLine2 || item.individual1Line2}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {result && <div>登録成功：{result.success}</div>}

    </main>
  );
}