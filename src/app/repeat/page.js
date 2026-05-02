'use client';

import { useRouter } from 'next/navigation';

const kanaRows = [
  ['ア行', 'カ行', 'サ行', 'タ行', 'ナ行'],
  ['ハ行', 'マ行', 'ヤ行', 'ラ行', 'ワ行'],
];

export default function RepeatPage() {
  const router = useRouter();

  const handleKanaClick = (label) => {
    alert(`${label}の顧客リスト表示は、Firebase接続後に作成します。`);
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

          {kanaRows[0].map((label, index) => {
            const columns = [
              '2 / 8',
              '10 / 16',
              '18 / 24',
              '26 / 32',
              '34 / 40',
            ];

            return (
              <button
                key={label}
                className="app-button"
                onClick={() => handleKanaClick(label)}
                style={{
                  gridRow: '11 / 15',
                  gridColumn: columns[index],
                  fontSize: '24px',
                  background: '#99cc00',
                }}
              >
                {label}
              </button>
            );
          })}

          {kanaRows[1].map((label, index) => {
            const columns = [
              '2 / 8',
              '10 / 16',
              '18 / 24',
              '26 / 32',
              '34 / 40',
            ];

            return (
              <button
                key={label}
                className="app-button"
                onClick={() => handleKanaClick(label)}
                style={{
                  gridRow: '19 / 23',
                  gridColumn: columns[index],
                  fontSize: '24px',
                  background: '#99cc00',
                }}
              >
                {label}
              </button>
            );
          })}

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

        </div>
      </div>
    </main>
  );
}