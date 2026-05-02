'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

const threadColors = [
  '▼▼▼モノトーン系▼▼▼',
  'White/白',
  '1142/ﾗｲﾄｸﾞﾚｰ',
  '1607/明るいﾗｲﾄｸﾞﾚｰ',
  '2943/ｸﾞﾚｰ',
  '1944/くすんだｸﾞﾚｰ',
  '1610/濃いｸﾞﾚｰ',
  '1611/かなり濃いｸﾞﾚｰ',
  'Black/黒',

  '▼▼▼黄色・ｵﾚﾝｼﾞ系▼▼▼',
  '1056/薄い黄色',
  '1094/黄色',
  '1105/濃い黄色',
  '1112/薄いｵﾚﾝｼﾞ',
  '1710/ｵﾚﾝｼﾞ',
  '1332/濃いｵﾚﾝｼﾞ',
  '9325/明るい朱色',

  '▼▼▼ﾋﾟﾝｸ・赤系▼▼▼',
  '1065/薄いﾋﾟﾝｸ',
  '1515/ﾋﾟﾝｸ',
  '1147/濃いﾋﾟﾝｸ',
  '1902/赤',
  '1037/濃い赤',
  '1911/えんじ',

  '▼▼▼紫・青系▼▼▼',
  '1434/薄い紫',
  '1832/紫',
  '1042/薄い青',
  '1043/青',
  '1134/濃い青',
  '1924/紺',

  '▼▼▼緑・茶系▼▼▼',
  '1237/薄い緑',
  '1238/緑',
  '1751/深緑',
  '1876/薄い茶',
  '1877/茶',
  '1366/濃い茶',

  '▼▼▼金・銀▼▼▼',
  'Silver/銀',
  'Gold/金',
];

export default function Step3() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const setValue = (key, value) => {
    setOrderData({
      ...orderData,
      [key]: value,
    });
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
        <div className="grid-screen">

          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '5 / 9' }}>数量</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '9 / 13' }}>場所・向き</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '13 / 17' }}>文字</div>
          <div className="cell blue progress-box" style={{ gridRow: '1 / 3', gridColumn: '17 / 21' }}>糸色</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '21 / 25' }}>書体</div>
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
            糸の色を選んでください
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
            value={orderData.color1}
            onChange={(e) => setValue('color1', e.target.value)}
            style={{
              gridRow: '6 / 8',
              gridColumn: '7 / 20',
              fontSize: '14px',
            }}
          >
            <option value="">選択</option>
            {threadColors.map((color) => (
              <option key={color} value={color}>
                {color}
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
            value={orderData.color2}
            onChange={(e) => setValue('color2', e.target.value)}
            style={{
              gridRow: '6 / 8',
              gridColumn: '26 / 39',
              fontSize: '14px',
            }}
          >
            <option value="">選択</option>
            {threadColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>

          <button
            className="app-button"
            onClick={() => router.push(orderData.mode === 'individual' ? '/step2-individual' : '/step2-common')}
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
            onClick={() => router.push('/step4')}
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
            onClick={clearStep3}
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