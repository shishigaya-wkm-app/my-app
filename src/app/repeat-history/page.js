'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useOrder } from '../../context/OrderContext';

const kanaRows = [
  ['ア行', 'カ行', 'サ行', 'タ行', 'ナ行'],
  ['ハ行', 'マ行', 'ヤ行', 'ラ行', 'ワ行'],
];

const columns = [
  '2 / 8',
  '10 / 16',
  '18 / 24',
  '26 / 32',
  '34 / 40',
];

export default function RepeatHistoryPage() {
  const router = useRouter();
  const { setOrderData } = useOrder();

  const [loading, setLoading] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [selectedKana, setSelectedKana] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadCustomers = async (label) => {
    setLoading(true);
    setSelectedKana(label);

    try {
      const q = query(collection(db, 'orders'), where('kana', '==', label));
      const snap = await getDocs(q);

      const customerMap = new Map();

      snap.forEach((doc) => {
        const data = doc.data();
        if (!data.customerName) return;

const existing = customerMap.get(data.customerName);

customerMap.set(data.customerName, {
  customerName: data.customerName,
  kana: data.kana || '',
  yomi: data.yomi || existing?.yomi || '',
});
      });

const list = Array.from(customerMap.values()).sort((a, b) =>
  String(a.yomi || a.customerName || '').localeCompare(
    String(b.yomi || b.customerName || ''),
    'ja'
  )
);

      setCustomers(list);
      setPopupType('customers');
    } catch (error) {
      console.error(error);
      alert('顧客一覧の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (customerName) => {
    setLoading(true);
    setSelectedCustomer(customerName);

    try {
      const q = query(collection(db, 'orders'), where('customerName', '==', customerName));
      const snap = await getDocs(q);

      const list = [];

      snap.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      list.sort((a, b) =>
  String(b.sortKey || '').localeCompare(String(a.sortKey || ''))
);

      setOrders(list);
      setPopupType('orders');
    } catch (error) {
      console.error(error);
      alert('注文履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

const restoreOrder = (order) => {
  setOrderData((prev) => ({
    ...prev,

customerName: order.customerName || '',
kana: order.kana || '',
yomi: order.yomi || '',
mode: order.mode || 'common',

    position1: order.position1 || '',
    position2: order.position2 || '',

    direction1: order.direction1 || '',
    direction2: order.direction2 || '',

    color1: order.color1 || '',
    color2: order.color2 || '',

    font1: order.font1 || '',
    font2: order.font2 || '',

    size1: order.size1 || '',
    size2: order.size2 || '',

note: order.note || '',

    textCommon: order.textCommon || {
      line1: '',
      line2: '',
      second: '',
    },

    textIndividual: order.textIndividual || Array.from({ length: 10 }, () => ({
      line1: '',
      line2: '',
    })),
  }));

  setPopupType('');
  router.push('/step6');
};

  const closePopup = () => {
    setPopupType('');
    setCustomers([]);
    setOrders([]);
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen">

          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '5 / 9' }}>数量</div>
          <div className="cell blue progress-box" style={{ gridRow: '1 / 3', gridColumn: '9 / 13' }}>履歴選択</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '13 / 17' }}></div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '17 / 21' }}></div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '21 / 25' }}></div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '25 / 29' }}></div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '29 / 33' }}>追加項目</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '33 / 37' }}>注文書</div>
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '37 / 41' }}>GOAL</div>

          <div
            className="cell white"
            style={{
              gridRow: '4 / 6',
              gridColumn: '6 / 36',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            再注文されるお客様名を五十音より選んでください
          </div>

          <div
            className="cell white"
            style={{
              gridRow: '6 / 8',
              gridColumn: '6 / 36',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            （ポップアップ画面よりお客様名→該当する注文履歴を選択）
          </div>

          {kanaRows[0].map((label, index) => (
            <button
              key={label}
              className="app-button"
              onClick={() => loadCustomers(label)}
              style={{
                gridRow: '11 / 15',
                gridColumn: columns[index],
                fontSize: '24px',
                background: '#99cc00',
              }}
            >
              {label}
            </button>
          ))}

          {kanaRows[1].map((label, index) => (
            <button
              key={label}
              className="app-button"
              onClick={() => loadCustomers(label)}
              style={{
                gridRow: '19 / 23',
                gridColumn: columns[index],
                fontSize: '24px',
                background: '#99cc00',
              }}
            >
              {label}
            </button>
          ))}

          <div
            className="bottom-bar"
            style={{
              gridRow: '29 / 31',
              gridColumn: '1 / 41',
            }}
          />

          <button
            className="app-button"
            onClick={() => router.push('/')}
            style={{
              gridRow: '29 / 31',
              gridColumn: '1 / 5',
              fontSize: '14px',
              zIndex: 2,
            }}
          >
            戻る
          </button>

          {loading && (
            <div
              className="cell white"
              style={{
                gridRow: '26 / 28',
                gridColumn: '15 / 27',
                border: '2px solid #000',
                fontSize: '16px',
                fontWeight: 'bold',
                zIndex: 30,
              }}
            >
              読み込み中...
            </div>
          )}

{popupType === 'customers' && (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
    }}
  >
    <div
      style={{
        width: '62%',
        maxHeight: '75%',
        overflowY: 'auto',
        background: '#fff',
        border: '3px solid #000',
        borderRadius: '14px',
        padding: '0 18px 18px 18px',
        boxSizing: 'border-box',
      }}
    >
      {/* 右上に常駐する×ボタン行 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: '#fff',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '46px',
          paddingTop: '8px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={closePopup}
          style={{
            width: '36px',
            height: '36px',
            border: 'none',
            borderRadius: '50%',
            background: '#ff9900',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            lineHeight: '36px',
            textAlign: 'center',
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '14px',
        }}
      >
        {selectedKana}のお客様一覧
      </div>

      {customers.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: '16px', padding: '20px' }}>
          該当する履歴がありません
        </div>
      ) : (
        customers.map((customer) => (
          <button
            key={customer.customerName}
            onClick={() => loadOrders(customer.customerName)}
            style={{
              display: 'flex',
              width: '100%',
              marginBottom: '8px',
              padding: '7px 12px',
              background: '#dddddd',
              border: '1px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              justifyContent: 'flex-start',
              alignItems: 'center',
              textAlign: 'left',
            }}
          >
            <div style={{ width: '100%' }}>
              <div
                style={{
                  fontSize: '10px',
                  color: '#555',
                  lineHeight: 1.1,
                  textAlign: 'left',
                }}
              >
                {customer.yomi || ''}
              </div>

              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  lineHeight: 1.25,
                  textAlign: 'left',
                }}
              >
                {customer.customerName}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  </div>
)}

          {popupType === 'orders' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  width: '72%',
                  maxHeight: '78%',
                  overflowY: 'auto',
                  background: '#fff',
                  border: '3px solid #000',
                  borderRadius: '14px',
                  padding: '18px',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '14px',
                  }}
                >
                  {selectedCustomer} 様の注文履歴
                </div>

                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', fontSize: '16px', padding: '20px' }}>
                    注文履歴がありません
                  </div>
                ) : (
                  orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => restoreOrder(order)}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginBottom: '8px',
                        padding: '12px',
                        background: '#dddddd',
                        border: '1px solid #000',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '15px',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '17px' }}>
                        {order.orderDate || '注文日なし'}　{order.mode === 'individual' ? '個別' : '共通'}
                      </div>
                    </button>
                  ))
                )}

                <button
                  onClick={() => setPopupType('customers')}
                  className="app-button"
                  style={{
                    marginTop: '12px',
                    marginRight: '10px',
                    width: '120px',
                    height: '42px',
                    fontSize: '14px',
                    background: '#dddddd',
                  }}
                >
                  戻る
                </button>

                <button
                  onClick={closePopup}
                  className="app-button"
                  style={{
                    marginTop: '12px',
                    width: '120px',
                    height: '42px',
                    fontSize: '14px',
                    background: '#ff9900',
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}