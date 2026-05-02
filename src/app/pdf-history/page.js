'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';

function formatDate(value) {
  if (!value) return '';

  try {
    if (value.toDate) {
      const d = value.toDate();
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  } catch (e) {
    return '';
  }

  return '';
}

function modeText(mode) {
  return mode === 'individual' ? '個別' : '共通';
}

export default function PdfHistoryPage() {
  const router = useRouter();

  const [pdfList, setPdfList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadPdfList = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, 'pdfOrders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPdfList(list);
    } catch (error) {
      console.error(error);
      alert('PDF履歴の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPdfList();
  }, []);

  const filteredList = pdfList.filter((item) => {
    const keywordText = keyword.trim();

    const matchesKeyword =
      keywordText === '' ||
      String(item.customerName || '').includes(keywordText) ||
      String(item.fileName || '').includes(keywordText);

    const matchesMode =
      modeFilter === 'all' || item.mode === modeFilter;

    return matchesKeyword && matchesMode;
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '28px',
        background: '#ffffff',
        color: '#000000',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <button
        onClick={() => router.push('/')}
        style={{
          padding: '10px 22px',
          fontSize: '16px',
          fontWeight: 'bold',
          background: '#ff9900',
          color: '#000',
          border: '2px solid #000',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '18px',
        }}
      >
        戻る
      </button>

      <h1 style={{ fontSize: '28px', marginBottom: '18px' }}>
        PDF検索
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '18px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="顧客名 または ファイル名で検索"
          style={{
            width: '360px',
            maxWidth: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #000',
            borderRadius: '8px',
          }}
        />

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #000',
            borderRadius: '8px',
            background: '#fff',
            color: '#000',
          }}
        >
          <option value="all">すべて</option>
          <option value="common">共通</option>
          <option value="individual">個別</option>
        </select>

        <button
          onClick={loadPdfList}
          style={{
            padding: '10px 18px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: '#dddddd',
            color: '#000',
            border: '2px solid #000',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          検索
        </button>
      </div>

      <div style={{ marginBottom: '12px', fontSize: '16px' }}>
        表示件数：{filteredList.length}件
      </div>

      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
  {keyword.trim() === ''
    ? '※検索ワード未入力のため全件表示しています'
    : '※検索ワードで絞り込み中'}
</div>

      {loading ? (
        <div style={{ fontSize: '18px', padding: '20px' }}>
          読み込み中...
        </div>
      ) : filteredList.length === 0 ? (
        <div
          style={{
            padding: '20px',
            border: '2px solid #000',
            borderRadius: '8px',
            background: '#f5f5f5',
            fontSize: '18px',
          }}
        >
          該当するPDF履歴がありません。
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              borderCollapse: 'collapse',
              minWidth: '900px',
              width: '100%',
              color: '#000',
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>作成日時</th>
                <th style={thStyle}>顧客名</th>
                <th style={thStyle}>モード</th>
                <th style={thStyle}>ファイル名</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{formatDate(item.createdAt)}</td>
                  <td style={tdStyle}>{item.customerName || ''}</td>
                  <td style={tdStyle}>{modeText(item.mode)}</td>
                  <td style={tdStyle}>{item.fileName || ''}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => window.open(item.viewUrl, '_blank')}
                      style={{
                        padding: '8px 16px',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        background: '#ff9900',
                        color: '#000',
                        border: '2px solid #000',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      PDF表示
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const thStyle = {
  border: '1px solid #000',
  padding: '9px',
  background: '#dddddd',
  color: '#000',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  border: '1px solid #000',
  padding: '9px',
  background: '#ffffff',
  color: '#000',
  whiteSpace: 'nowrap',
};