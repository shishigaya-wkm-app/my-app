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
  if (!['common', 'individual', '共通', '個別'].includes(item.mode)) errors.push('モードが不正');

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
  return Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      line1: item[`individual${n}Line1`] || '',
      line2: item[`individual${n}Line2`] || '',
    };
  });
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

    if (csvRows.length < 2) {
      setItems([]);
      setMessage('CSVにデータ行がありません。');
      return;
    }

    const headerRow = csvRows[0].map((h) => h.trim());
    const missing = REQUIRED_HEADERS.filter((h) => !headerRow.includes(h));

    if (missing.length > 0) {
      setItems([]);
      setMessage(`CSVの列名が不足しています：${missing.join(', ')}`);
      return;
    }

    const parsedItems = csvRows.slice(1).map((row, index) => {
      const obj = {};
      headerRow.forEach((header, colIndex) => {
        obj[header] = row[colIndex] || '';
      });
      obj.__rowNumber = index + 2;
      return obj;
    });

    const errors = [];
    const validItems = [];

    parsedItems.forEach((item) => {
      const error = validateItem(item, item.__rowNumber);
      if (error) {
        errors.push(error);
      } else {
        validItems.push(item);
      }
    });

    setItems(validItems);
    setErrorRows(errors);

    setMessage(
      `${validItems.length}件の正常データを読み込みました。${
        errors.length > 0 ? ` エラー行が${errors.length}件あります。` : ''
      }`
    );
  };

  const checkDuplicate = async (item) => {
    const q = query(
      collection(db, 'orders'),
      where('customerName', '==', item.customerName || ''),
      where('orderDate', '==', item.orderDate || '')
    );

    const snap = await getDocs(q);
    return !snap.empty;
  };

  const importToFirestore = async () => {
    if (items.length === 0) {
      alert('取り込むデータがありません。');
      return;
    }

    const ok = window.confirm(`${items.length}件をFirestoreへ登録します。よろしいですか？`);
    if (!ok) return;

    setImporting(true);
    setResult(null);

    let success = 0;
    let skipped = 0;
    let failed = 0;
    const newErrorRows = [...errorRows];

    try {
      for (const item of items) {
        try {
          const duplicated = await checkDuplicate(item);

          if (duplicated) {
            skipped++;
            newErrorRows.push({
              rowNumber: item.__rowNumber,
              customerName: item.customerName || '',
              orderDate: item.orderDate || '',
              reason: '重複のためスキップ',
            });
            continue;
          }

          await addDoc(collection(db, 'orders'), makeDocData(item));
          success++;
        } catch (error) {
          console.error(error);
          failed++;
          newErrorRows.push({
            rowNumber: item.__rowNumber,
            customerName: item.customerName || '',
            orderDate: item.orderDate || '',
            reason: error.message || 'Firestore登録失敗',
          });
        }
      }

      setErrorRows(newErrorRows);
      setResult({ success, skipped, failed });
      setMessage('CSV取り込みが完了しました。');
    } finally {
      setImporting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px',
        fontFamily: 'system-ui, sans-serif',
        background: '#ffffff',
        color: '#000000',
      }}
    >
      <button
        onClick={() => router.push('/')}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          background: '#ff9900',
          color: '#000',
          border: '2px solid #000',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        戻る
      </button>

      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>注文履歴CSV取り込み</h1>

      <div style={{ marginBottom: '20px', lineHeight: 1.8, fontSize: '18px' }}>
        <div>CSVファイルを選んで、過去の注文履歴をFirestoreへ一括登録します。</div>
        <div>同じ「顧客名＋注文日」がすでにある場合は、重複としてスキップします。</div>
      </div>

      <input type="file" accept=".csv,text/csv" onChange={handleFile} style={{ fontSize: '16px' }} />

      {fileName && (
        <div style={{ marginTop: '12px' }}>
          選択中のファイル：<strong>{fileName}</strong>
        </div>
      )}

      {message && (
        <div style={messageStyle}>
          {message}
        </div>
      )}

      {items.length > 0 && (
        <>
          <button
            onClick={importToFirestore}
            disabled={importing}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: importing ? '#ccc' : '#ff9900',
              color: '#000000',
              border: '2px solid #000',
              borderRadius: '10px',
              cursor: importing ? 'not-allowed' : 'pointer',
            }}
          >
            {importing ? '取り込み中...' : 'Firestoreへ取り込む'}
          </button>

          <h2 style={{ marginTop: '24px', fontSize: '20px' }}>読み込み確認：先頭10件</h2>

          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>CSV行</th>
                  <th style={thStyle}>顧客名</th>
                  <th style={thStyle}>フリガナ</th>
                  <th style={thStyle}>注文日</th>
                  <th style={thStyle}>モード</th>
                  <th style={thStyle}>場所1</th>
                  <th style={thStyle}>場所2</th>
                  <th style={thStyle}>文字1</th>
                  <th style={thStyle}>文字2</th>
                  <th style={thStyle}>備考</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 10).map((item, index) => (
                  <tr key={`${item.customerName}-${item.orderDate}-${index}`}>
                    <td style={tdStyle}>{item.__rowNumber}</td>
                    <td style={tdStyle}>{item.customerName}</td>
                    <td style={tdStyle}>{item.kana}</td>
                    <td style={tdStyle}>{item.orderDate}</td>
                    <td style={tdStyle}>
                      {normalizeMode(item.mode) === 'individual' ? '個別' : '共通'}
                    </td>
                    <td style={tdStyle}>{item.position1}</td>
                    <td style={tdStyle}>{item.position2}</td>
                    <td style={tdStyle}>
                      {normalizeMode(item.mode) === 'individual'
                        ? item.individual1Line1
                        : item.commonLine1}
                    </td>
                    <td style={tdStyle}>
                      {normalizeMode(item.mode) === 'individual'
                        ? item.individual1Line2
                        : item.commonLine2 || item.commonSecond}
                    </td>
                    <td style={tdStyle}>{item.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {result && (
        <div style={resultStyle}>
          <div>登録成功：{result.success}件</div>
          <div>重複スキップ：{result.skipped}件</div>
          <div>登録失敗：{result.failed}件</div>
        </div>
      )}

      {errorRows.length > 0 && (
        <>
          <h2 style={{ marginTop: '28px', fontSize: '20px', color: '#cc0000' }}>
            エラー・スキップ一覧
          </h2>

          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={errorThStyle}>CSV行</th>
                  <th style={errorThStyle}>顧客名</th>
                  <th style={errorThStyle}>注文日</th>
                  <th style={errorThStyle}>理由</th>
                </tr>
              </thead>
              <tbody>
                {errorRows.map((row, index) => (
                  <tr key={`${row.rowNumber}-${index}`}>
                    <td style={errorTdStyle}>{row.rowNumber}</td>
                    <td style={errorTdStyle}>{row.customerName}</td>
                    <td style={errorTdStyle}>{row.orderDate}</td>
                    <td style={errorTdStyle}>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

const messageStyle = {
  marginTop: '16px',
  padding: '12px',
  background: '#f5f5f5',
  border: '1px solid #999',
  borderRadius: '8px',
  color: '#000000',
};

const resultStyle = {
  marginTop: '20px',
  padding: '14px',
  border: '2px solid #000',
  borderRadius: '8px',
  background: '#fff',
  color: '#000000',
  fontSize: '18px',
  lineHeight: 1.8,
};

const thStyle = {
  border: '1px solid #000',
  padding: '8px',
  background: '#dddddd',
  color: '#000000',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  border: '1px solid #000',
  padding: '8px',
  background: '#ffffff',
  color: '#000000',
  whiteSpace: 'nowrap',
};

const errorThStyle = {
  border: '1px solid #000',
  padding: '8px',
  background: '#ffcccc',
  color: '#000000',
  whiteSpace: 'nowrap',
};

const errorTdStyle = {
  border: '1px solid #000',
  padding: '8px',
  background: '#fff5f5',
  color: '#000000',
  whiteSpace: 'nowrap',
};