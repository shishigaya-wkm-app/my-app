'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

export default function Step2Common() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const setCommonText = (key, value) => {
    setOrderData({
      ...orderData,
      mode: 'common',
      textCommon: {
        ...orderData.textCommon,
        [key]: value,
      },
    });
  };

  const clearStep2Common = () => {
    setOrderData({
      ...orderData,
      textCommon: {
        line1: '',
        line2: '',
        second: '',
      },
    });
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen">

          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '5 / 9' }}>数量</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '9 / 13' }}>場所・向き</div>
          <div className="cell blue progress-box" style={{ gridRow: '1 / 3', gridColumn: '13 / 17' }}>文字</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '17 / 21' }}>糸色</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '21 / 25' }}>書体</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '25 / 29' }}>大きさ</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '29 / 33' }}>追加項目</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '33 / 37' }}>注文書</div>
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '37 / 41' }}>GOAL</div>

          <div
            className="cell white"
            style={{
              gridRow: '5 / 6',
              gridColumn: '7 / 35',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            刺繍する文字を入力してください　（胸＝10文字まで、腕＝5文字までが目安）
          </div>

          <div className="cell black" style={{ gridRow: '7 / 16', gridColumn: '3 / 7', fontSize: '14px', border: '1px solid #000' }}>
            1ヶ所目
          </div>

          <div className="cell dark-gray" style={{ gridRow: '7 / 11', gridColumn: '7 / 11', fontSize: '14px', border: '1px solid #000' }}>
            1行目
          </div>

          <input
            className="app-input"
            value={orderData.textCommon.line1}
            onChange={(e) => setCommonText('line1', e.target.value)}
            style={{
              gridRow: '7 / 11',
              gridColumn: '11 / 39',
              fontSize: '36px',
            }}
          />

          <div className="cell dark-gray" style={{ gridRow: '12 / 16', gridColumn: '7 / 11', fontSize: '14px', border: '1px solid #000' }}>
            2行目
          </div>

          <input
            className="app-input"
            value={orderData.textCommon.line2}
            onChange={(e) => setCommonText('line2', e.target.value)}
            style={{
              gridRow: '12 / 16',
              gridColumn: '11 / 39',
              fontSize: '36px',
            }}
          />

          <div
            className="cell black"
            style={{
              gridRow: '17 / 21',
              gridColumn: '3 / 11',
              fontSize: '14px',
              border: '1px solid #000',
              whiteSpace: 'pre-line',
            }}
          >
            2ヶ所目{'\n'}(1行のみ)
          </div>

          <input
            className="app-input"
            value={orderData.textCommon.second}
            onChange={(e) => setCommonText('second', e.target.value)}
            style={{
              gridRow: '17 / 21',
              gridColumn: '11 / 39',
              fontSize: '36px',
            }}
          />

          <button
            className="app-button"
            onClick={() => router.push('/step1')}
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
            onClick={() => router.push('/step3')}
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
            onClick={clearStep2Common}
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

        </div>
      </div>
    </main>
  );
}