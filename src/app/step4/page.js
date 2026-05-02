'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

const fonts = [/* 省略 */];

export default function Step4() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const setValue = (key, value) => {
    setOrderData({ ...orderData, [key]: value });
  };

  const clearStep4 = () => {
    setOrderData({
      ...orderData,
      font1: '',
      font2: '',
    });
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen" style={{ position: 'relative' }}>

          {/* 🔥 背景画像 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0
          }}>
            <img
              src="/sheet4.png"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* UI */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>

            {/* ↓既存そのまま */}

            <button
              className="app-button"
              onClick={clearStep4}
              style={{
                gridRow: '29 / 31',
                gridColumn: '1 / 5',
                zIndex: 2,
              }}
            >
              クリア
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}