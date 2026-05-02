'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

const fonts = [
  '楷書体',
  '明朝体',
  '行書体',
  '勘亭流',
  '太ゴシック体',
  '丸ゴシック体',
  '筆記体Script1',
  '筆記体Script2',
  '筆記体Script3',
  '筆記体Script4',
  '筆記体Baantines',
  '筆記体Carla',
  '筆記体Cayman',
];

export default function Step4() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const setValue = (key, value) => {
    setOrderData({
      ...orderData,
      [key]: value,
    });
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
        <div className="grid-screen">

          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '5 / 9' }}>数量</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '9 / 13' }}>場所・向き</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '13 / 17' }}>文字</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '17 / 21' }}>糸色</div>
          <div className="cell blue progress-box" style={{ gridRow: '1 / 3', gridColumn: '21 / 25' }}>書体</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '25 / 29' }}>大きさ</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '29 / 33' }}>追加項目</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '33 / 37' }}>注文書</div>
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '37 / 41' }}>GOAL</div>

          <div
            className="cell white"
            style={{
              gridRow: '4 / 5',
              gridColumn: '16 / 26',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            書体を選んでください
          </div>

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
            value={orderData.font1}
            onChange={(e) => setValue('font1', e.target.value)}
            style={{
              gridRow: '6 / 8',
              gridColumn: '7 / 20',
              fontSize: '14px',
            }}
          >
            <option value="">選択</option>
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>

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
            value={orderData.font2}
            onChange={(e) => setValue('font2', e.target.value)}
            style={{
              gridRow: '6 / 8',
              gridColumn: '26 / 39',
              fontSize: '14px',
            }}
          >
            <option value="">選択</option>
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>

          <div
            style={{
              gridRow: '9 / 24',
              gridColumn: '7 / 35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/sheet4-font.png"
              alt="書体一覧"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </div>

          <button
            className="app-button"
            onClick={() => router.push('/step3')}
            style={{
              gridRow: '24 / 27',
              gridColumn: '14 / 19',
              fontSize: '14px',
            }}
          >
            戻る
          </button>

          <button
            className="app-button"
            onClick={() => router.push('/step5')}
            style={{
              gridRow: '24 / 27',
              gridColumn: '23 / 28',
              fontSize: '14px',
            }}
          >
            次へ
          </button>

          <div className="bottom-bar" style={{ gridRow: '29 / 31', gridColumn: '1 / 41' }} />

          <button
            className="app-button"
            onClick={clearStep4}
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