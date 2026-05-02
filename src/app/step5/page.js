'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

const sizes = [
  '12mm',
  '10mm',
];

export default function Step5() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const setValue = (key, value) => {
    setOrderData({
      ...orderData,
      [key]: value,
    });
  };

  const clearStep5 = () => {
    setOrderData({
      ...orderData,
      size1: '',
      size2: '',
    });
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen">

          {/* 進行バー */}
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '5 / 9' }}>数量</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '9 / 13' }}>場所・向き</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '13 / 17' }}>文字</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '17 / 21' }}>糸色</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '21 / 25' }}>書体</div>
          <div className="cell blue progress-box" style={{ gridRow: '1 / 3', gridColumn: '25 / 29' }}>大きさ</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '29 / 33' }}>追加項目</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '33 / 37' }}>注文書</div>
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '37 / 41' }}>GOAL</div>

          {/* タイトル */}
          <div
            className="cell white"
            style={{
              gridRow: '4 / 5',
              gridColumn: '16 / 26',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            大きさを選んでください
          </div>

          {/* 1ヶ所目 */}
          <div
            className="cell black"
            style={{
              gridRow: '6 / 8',
              gridColumn: '3 / 7',
              fontSize: '12px',
              border: '1px solid #000',
            }}
          >
            1ヶ所目
          </div>

          <select
            className="app-input"
            value={orderData.size1}
            onChange={(e) => setValue('size1', e.target.value)}
            style={{
              gridRow: '6 / 8',
              gridColumn: '7 / 20',
              fontSize: '14px',
            }}
          >
            <option value="">選択</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* 2ヶ所目 */}
          <div
            className="cell black"
            style={{
              gridRow: '6 / 8',
              gridColumn: '22 / 26',
              fontSize: '12px',
              border: '1px solid #000',
            }}
          >
            2ヶ所目
          </div>

          <select
            className="app-input"
            value={orderData.size2}
            onChange={(e) => setValue('size2', e.target.value)}
            style={{
              gridRow: '6 / 8',
              gridColumn: '26 / 39',
              fontSize: '14px',
            }}
          >
            <option value="">選択</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* 戻る */}
          <button
            className="app-button"
            onClick={() => router.push('/step4')}
            style={{
              gridRow: '24 / 27',
              gridColumn: '14 / 19',
              fontSize: '14px',
            }}
          >
            戻る
          </button>

          {/* 次へ */}
          <button
            className="app-button"
            onClick={() => router.push('/step6')}
            style={{
              gridRow: '24 / 27',
              gridColumn: '23 / 28',
              fontSize: '14px',
            }}
          >
            次へ
          </button>

          {/* 下バー */}
          <div className="bottom-bar" style={{ gridRow: '29 / 31', gridColumn: '1 / 41' }} />

          {/* クリア */}
          <button
            className="app-button"
            onClick={clearStep5}
            style={{
              gridRow: '29 / 31',
              gridColumn: '1 / 5',
              fontSize: '14px',
              zIndex: 2,
            }}
          >
            クリア
          </button>

          <button
            className="app-button"
            onClick={() => router.push('/confirm-common')}
            style={{
              gridRow: '29 / 31',
              gridColumn: '32 / 36',
              fontSize: '10px',
              zIndex: 2,
            }}
          >
            確認画面<br />（共通）
          </button>

          <button
            className="app-button"
            onClick={() => router.push('/confirm-individual')}
            style={{
              gridRow: '29 / 31',
              gridColumn: '37 / 41',
              fontSize: '10px',
              zIndex: 2,
            }}
          >
            確認画面<br />（個別）
          </button>

        </div>
      </div>
    </main>
  );
}