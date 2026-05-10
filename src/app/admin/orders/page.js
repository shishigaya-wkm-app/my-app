'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

const PAGE_SIZE = 100;

function normalizeDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const match = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (!match) return raw;

  return `${match[1]}/${String(match[2]).padStart(2, '0')}/${String(match[3]).padStart(2, '0')}`;
}

function matchesFilter(order, filters) {
  const name = String(order.customerName || '');
  const keyword = String(filters.customerName || '').trim();

  if (keyword && !name.includes(keyword)) return false;

  const date = normalizeDate(filters.orderDate);
  if (date && order.orderDateBase !== date) return false;

  if (filters.mode && order.mode !== filters.mode) return false;

  return true;
}

function getContent(order) {
  if (order.mode === 'individual') {
    return (order.textIndividual || [])
      .map((row, index) =>
        row?.line1 || row?.line2
          ? `${index + 1}: ${row.line1 || ''} ${row.line2 || ''}`
          : ''
      )
      .filter(Boolean)
      .join(' / ');
  }

  return `${order.textCommon?.line1 || ''} ${order.textCommon?.line2 || ''} ${order.textCommon?.second || ''}`;
}

export default function AdminOrdersPage() {
　const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [mode, setMode] = useState('');
  const [orders, setOrders] = useState([]);

  const [pageNumber, setPageNumber] = useState(1);
  const [lastDocs, setLastDocs] = useState([]);
  const [hasNext, setHasNext] = useState(false);

  const currentFilters = {
    customerName,
    orderDate,
    mode,
  };

  const loadOrders = async ({ reset = false, next = false, prev = false } = {}) => {
    setLoading(true);

    try {
      let cursor = null;
      let targetPage = pageNumber;

      if (reset) {
        targetPage = 1;
      } else if (next) {
        cursor = lastDocs[pageNumber - 1] || null;
        targetPage = pageNumber + 1;
      } else if (prev) {
        targetPage = Math.max(1, pageNumber - 1);
        cursor = targetPage > 1 ? lastDocs[targetPage - 2] : null;
      }

      const parts = [collection(db, 'orders'), orderBy('sortKey', 'desc')];

      if (cursor) {
        parts.push(startAfter(cursor));
      }

      parts.push(limit(PAGE_SIZE + 1));

      const q = query(...parts);
      const snap = await getDocs(q);

      const docs = snap.docs;
      const visibleDocs = docs.slice(0, PAGE_SIZE);

      const list = visibleDocs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        .filter((order) => matchesFilter(order, currentFilters));

      setOrders(list);
      setHasNext(docs.length > PAGE_SIZE);
      setPageNumber(targetPage);

      if (visibleDocs.length > 0) {
        setLastDocs((prevDocs) => {
          const copy = reset ? [] : [...prevDocs];
          copy[targetPage - 1] = visibleDocs[visibleDocs.length - 1];
          return copy;
        });
      } else if (reset) {
        setLastDocs([]);
      }
    } catch (error) {
      console.error(error);
      alert('注文データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (order) => {
    const ok = window.confirm(
      `この注文データを削除しますか？\n\n${order.orderDate || ''}\n${order.customerName || ''}\n${order.mode === 'individual' ? '個別' : '共通'}`
    );

    if (!ok) return;

    try {
      await deleteDoc(doc(db, 'orders', order.id));
      alert('削除しました。');
      await loadOrders({ reset: true });
    } catch (error) {
      console.error(error);
      alert('削除に失敗しました。');
    }
  };

  const handleSearch = () => {
    setLastDocs([]);
    setPageNumber(1);
    loadOrders({ reset: true });
  };

  useEffect(() => {
    loadOrders({ reset: true });
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'auto',
        background: '#ffffff',
        color: '#000000',
        padding: '24px',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
      }}
    >

<button
  className="app-button"
  onClick={() => router.push('/')}
  style={{
    width: '120px',
    height: '42px',
    fontSize: '14px',
    background: '#ff9900',
    marginBottom: '18px',
  }}
>
  戻る
</button>

      <h1 style={{ marginTop: 0 }}>注文データ管理</h1>


      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 180px 160px 120px',
          gap: '10px',
          marginBottom: '16px',
          alignItems: 'end',
        }}
      >
        <label>
          <div style={labelStyle}>顧客名 部分一致</div>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="例：ワークマン"
            style={inputStyle}
          />
        </label>

        <label>
          <div style={labelStyle}>注文日 空欄可</div>
          <input
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            placeholder="2026/05/09"
            style={inputStyle}
          />
        </label>

        <label>
          <div style={labelStyle}>モード 空欄可</div>
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={inputStyle}>
            <option value="">すべて</option>
            <option value="common">共通</option>
            <option value="individual">個別</option>
          </select>
        </label>

        <button onClick={handleSearch} disabled={loading} style={searchButtonStyle}>
          {loading ? '検索中...' : '検索'}
        </button>
      </div>

      <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
        {PAGE_SIZE}件ずつ取得　現在：{pageNumber}ページ目　表示件数：{orders.length}件
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => loadOrders({ prev: true })}
          disabled={loading || pageNumber <= 1}
          style={{
            ...pageButtonStyle,
            background: pageNumber <= 1 ? '#ccc' : '#dddddd',
          }}
        >
          前の100件
        </button>

        <button
          onClick={() => loadOrders({ next: true })}
          disabled={loading || !hasNext}
          style={{
            ...pageButtonStyle,
            background: !hasNext ? '#ccc' : '#99cc00',
            marginLeft: '10px',
          }}
        >
          次の100件
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            minWidth: '900px',
            borderCollapse: 'collapse',
            background: '#fff',
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>注文日</th>
              <th style={thStyle}>顧客名</th>
              <th style={thStyle}>モード</th>
              <th style={thStyle}>sortKey</th>
              <th style={thStyle}>内容</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const modeText = order.mode === 'individual' ? '個別' : '共通';
              const content = getContent(order);

              return (
                <tr key={order.id}>
                  <td style={tdStyle}>{order.orderDate || ''}</td>
                  <td style={tdStyle}>{order.customerName || ''}</td>
                  <td style={tdStyle}>{modeText}</td>
                  <td style={tdStyle}>{order.sortKey || ''}</td>
                  <td style={tdStyle}>{content}</td>
                  <td style={tdStyle}>
                    <button onClick={() => deleteOrder(order)} style={deleteButtonStyle}>
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={6}>
                  この100件の中には該当する注文データがありません。必要なら「次の100件」を押してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const labelStyle = {
  fontSize: '13px',
  fontWeight: 'bold',
  marginBottom: '4px',
};

const inputStyle = {
  width: '100%',
  height: '40px',
  fontSize: '15px',
  padding: '6px',
  boxSizing: 'border-box',
  border: '1px solid #000',
  borderRadius: '6px',
  background: '#fff',
  color: '#000',
};

const searchButtonStyle = {
  height: '40px',
  fontSize: '15px',
  fontWeight: 'bold',
  background: '#ff9900',
  color: '#000',
  border: '2px solid #000',
  borderRadius: '8px',
  cursor: 'pointer',
};

const pageButtonStyle = {
  width: '120px',
  height: '38px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#000',
  border: '1px solid #000',
  borderRadius: '8px',
  cursor: 'pointer',
};

const thStyle = {
  border: '1px solid #000',
  background: '#dddddd',
  padding: '8px',
  fontSize: '14px',
};

const tdStyle = {
  border: '1px solid #000',
  padding: '8px',
  fontSize: '13px',
  verticalAlign: 'top',
};

const deleteButtonStyle = {
  width: '70px',
  height: '34px',
  background: '#ff6666',
  color: '#000',
  border: '1px solid #000',
  borderRadius: '6px',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};