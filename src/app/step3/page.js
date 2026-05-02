'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

const threadColors = [/* 省略（そのまま） */];

export default function Step3() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const setValue = (key, value) => {
    setOrderData({ ...orderData, [key]: value });
  };

  const clearStep3 = () => {
    setOrderData({
      ...orderData,
      color1: '',
      color2: '',
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
              src="/sheet3.png"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* UIは上に */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* 元コードそのまま */}
            <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>

            {/* ↓全部そのまま残す */}

            <button
              className="app-button"
              onClick={clearStep3}
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