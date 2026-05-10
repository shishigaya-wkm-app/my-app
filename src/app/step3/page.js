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
'1004/ﾗｲﾄﾋﾟﾝｸ',
'1358/ﾋﾟﾝｸ',
'1359/ｼｮｯｷﾝｸﾞﾋﾟﾝｸ',
'9323/ﾏｾﾞﾝﾀﾞﾋﾟﾝｸ',
'1135/明るい紫',
'9922/赤',
'9226/明るいｴﾝｼﾞ',
'▼▼▼緑・青系▼▼▼',
'1059/明るい草色',
'1259/ｱｸｱｸﾞﾘｰﾝ',
'1060/緑',
'1062/ｴﾒﾗﾙﾄﾞ',
'1439/ｱｰﾐｰ',
'1238/ﾓｽｸﾞﾘｰﾝ',
'1245/薄めの水色',
'1508/明るい水色',
'1505/ﾀｰｺｲｽﾞ',
'1036/ｻｯｸｽﾌﾞﾙｰ',
'1537/青',
'1233/明るい紺',
'1502/藍色',
'1525/紺',
'1521/濃い紺',
'2519/くすんだ紺',
'▼▼▼追加料金ｶﾗｰ▼▼▼',
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

          <div
            style={{
              gridRow: '9 / 23',
              gridColumn: '7 / 35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/sheet3-thread-color.png"
              alt="糸色一覧"
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