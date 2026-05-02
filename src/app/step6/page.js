'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

const defaultOptionLabels = [
  '防寒着への刺繍（＋100円/着）',
  'TBD',
  'TBD',
];

export default function Step6() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const optionLabels = orderData.optionLabels || defaultOptionLabels;

  const updateOption = (key, checked) => {
    setOrderData({
      ...orderData,
      options: {
        ...orderData.options,
        [key]: checked,
      },
    });
  };

  const updateOptionLabel = (index) => {
    const newText = window.prompt('項目名を入力してください', optionLabels[index]);
    if (newText === null) return;

    const newLabels = [...optionLabels];
    newLabels[index] = newText;

    setOrderData({
      ...orderData,
      optionLabels: newLabels,
    });
  };

  const clearStep6 = () => {
    setOrderData({
      ...orderData,
      options: {
        winter: false,
        option2: false,
        option3: false,
      },
      note: '',
      optionLabels: defaultOptionLabels,
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
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '21 / 25' }}>書体</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '25 / 29' }}>大きさ</div>
          <div className="cell blue progress-box" style={{ gridRow: '1 / 3', gridColumn: '29 / 33' }}>追加項目</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '33 / 37' }}>注文書</div>
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '37 / 41' }}>GOAL</div>

          <div
            className="cell white"
            style={{
              gridRow: '4 / 5',
              gridColumn: '15 / 27',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            追加項目をチェックしてください
          </div>

          <div
            style={{
              gridRow: '6 / 13',
              gridColumn: '6 / 36',
              border: '2px solid #000',
              background: '#fff',
            }}
          />

          <input
            type="checkbox"
            checked={!!orderData.options?.winter}
            onChange={(e) => updateOption('winter', e.target.checked)}
            style={{
              gridRow: '7 / 8',
              gridColumn: '8 / 9',
              width: '100%',
              height: '100%',
            }}
          />

          <div
            className="cell white"
            style={{
              gridRow: '7 / 8',
              gridColumn: '10 / 32',
              fontSize: '12px',
              justifyContent: 'flex-start',
            }}
          >
            {optionLabels[0]}
          </div>

          <button
            className="cell white"
            onClick={() => updateOptionLabel(0)}
            style={{
              gridRow: '7 / 8',
              gridColumn: '33 / 34',
              border: 'none',
              background: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✎
          </button>

          <input
            type="checkbox"
            checked={!!orderData.options?.option2}
            onChange={(e) => updateOption('option2', e.target.checked)}
            style={{
              gridRow: '9 / 10',
              gridColumn: '8 / 9',
              width: '100%',
              height: '100%',
            }}
          />

          <div
            className="cell white"
            style={{
              gridRow: '9 / 10',
              gridColumn: '10 / 32',
              fontSize: '12px',
              justifyContent: 'flex-start',
            }}
          >
            {optionLabels[1]}
          </div>

          <button
            className="cell white"
            onClick={() => updateOptionLabel(1)}
            style={{
              gridRow: '9 / 10',
              gridColumn: '33 / 34',
              border: 'none',
              background: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✎
          </button>

          <input
            type="checkbox"
            checked={!!orderData.options?.option3}
            onChange={(e) => updateOption('option3', e.target.checked)}
            style={{
              gridRow: '11 / 12',
              gridColumn: '8 / 9',
              width: '100%',
              height: '100%',
            }}
          />

          <div
            className="cell white"
            style={{
              gridRow: '11 / 12',
              gridColumn: '10 / 32',
              fontSize: '12px',
              justifyContent: 'flex-start',
            }}
          >
            {optionLabels[2]}
          </div>

          <button
            className="cell white"
            onClick={() => updateOptionLabel(2)}
            style={{
              gridRow: '11 / 12',
              gridColumn: '33 / 34',
              border: 'none',
              background: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✎
          </button>

          <div
            className="cell white"
            style={{
              gridRow: '15 / 16',
              gridColumn: '11 / 31',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            備考欄：刺繍業者への伝達事項を入力してください
          </div>

          <textarea
            value={orderData.note}
            onChange={(e) => setOrderData({ ...orderData, note: e.target.value })}
            style={{
              gridRow: '17 / 22',
              gridColumn: '6 / 36',
              border: '2px solid #000',
              background: '#fff',
              fontSize: '18px',
              padding: '8px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          <button
            className="app-button"
            onClick={() => router.push('/step5')}
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
            onClick={() => router.push(orderData.mode === 'individual' ? '/confirm-individual' : '/confirm-common')}
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
            onClick={clearStep6}
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