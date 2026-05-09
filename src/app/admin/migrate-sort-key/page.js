'use client';

import { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

function makeSortKeyFromOrderDate(orderDate) {
  const raw = String(orderDate || '').trim();
  const match = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})-(\d{1,})$/);

  if (!match) return '';

  const year = match[1];
  const month = String(match[2]).padStart(2, '0');
  const day = String(match[3]).padStart(2, '0');
  const branch = String(match[4]).padStart(2, '0');

  return `${year}${month}${day}-${branch}`;
}

export default function MigrateSortKeyPage() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState([]);

  const runMigration = async () => {
    if (!window.confirm('Firestoreのorders全件にsortKeyを追加・更新します。実行しますか？')) {
      return;
    }

    setRunning(true);
    setMessage('処理中...');
    setResults([]);

    try {
      const snap = await getDocs(collection(db, 'orders'));

      let updated = 0;
      let skipped = 0;
      const logs = [];

      for (const document of snap.docs) {
        const data = document.data();
        const sortKey = makeSortKeyFromOrderDate(data.orderDate);

        if (!sortKey) {
          skipped += 1;
          logs.push({
            id: document.id,
            customerName: data.customerName || '',
            orderDate: data.orderDate || '',
            sortKey: '',
            result: 'スキップ：orderDate形式不明',
          });
          continue;
        }

        await updateDoc(doc(db, 'orders', document.id), { sortKey });

        updated += 1;
        logs.push({
          id: document.id,
          customerName: data.customerName || '',
          orderDate: data.orderDate || '',
          sortKey,
          result: '更新OK',
        });
      }

      setResults(logs);
      setMessage(`完了：更新 ${updated}件 / スキップ ${skipped}件`);
    } catch (error) {
      console.error(error);
      setMessage('エラーが発生しました。コンソールを確認してください。');
    } finally {
      setRunning(false);
    }
  };

  const skippedResults = results.filter((row) => row.result.includes('スキップ'));

  return (
    <main
      style={{
        minHeight: '100vh',
        height: 'auto',
        overflow: 'auto',
        padding: '30px',
        fontFamily: 'sans-serif',
        background: '#ffffff',
        color: '#000000',
        boxSizing: 'border-box',
      }}
    >
      <h1>sortKey 一括追加</h1>

      <p>
        Firestore の orders コレクションに保存済みの注文へ、
        orderDate から sortKey を作成して追加します。
      </p>

      <button
        onClick={runMigration}
        disabled={running}
        style={{
          width: '220px',
          height: '48px',
          fontSize: '16px',
          fontWeight: 'bold',
          background: running ? '#ccc' : '#ff9900',
          color: '#000',
          border: '2px solid #000',
          borderRadius: '8px',
          cursor: running ? 'not-allowed' : 'pointer',
        }}
      >
        {running ? '処理中...' : 'sortKeyを一括追加'}
      </button>

      <div style={{ marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        {message}
      </div>

      {skippedResults.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            border: '3px solid red',
            background: '#fff4f4',
            color: '#000',
          }}
        >
          <h2 style={{ marginTop: 0 }}>スキップされたデータ</h2>

          {skippedResults.map((row) => (
            <div key={row.id} style={{ marginBottom: '14px', fontSize: '16px' }}>
              <div><b>顧客名：</b>{row.customerName}</div>
              <div><b>orderDate：</b>{row.orderDate || '空欄'}</div>
              <div><b>doc ID：</b>{row.id}</div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
          <h2>処理結果一覧</h2>

          <table
            style={{
              borderCollapse: 'collapse',
              minWidth: '900px',
              width: '100%',
              fontSize: '13px',
              background: '#fff',
              color: '#000',
            }}
          >
            <thead>
              <tr>
                <th style={cellStyle}>顧客名</th>
                <th style={cellStyle}>orderDate</th>
                <th style={cellStyle}>sortKey</th>
                <th style={cellStyle}>結果</th>
                <th style={cellStyle}>doc ID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.id}>
                  <td style={cellStyle}>{row.customerName}</td>
                  <td style={cellStyle}>{row.orderDate}</td>
                  <td style={cellStyle}>{row.sortKey}</td>
                  <td style={cellStyle}>{row.result}</td>
                  <td style={cellStyle}>{row.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const cellStyle = {
  border: '1px solid #999',
  padding: '6px',
  color: '#000',
  background: '#fff',
};