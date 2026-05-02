'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../context/OrderContext';

export default function Home() {
  const router = useRouter();
  const { orderData, setOrderData, resetOrder } = useOrder();
  const [showMenu, setShowMenu] = useState(false);

  const setQuantity = (value) => {
    const numberOnly = value.replace(/[^0-9]/g, '');
    setOrderData({
      ...orderData,
      quantity: numberOnly === '' ? '' : Number(numberOnly),
    });
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen">

          <div
            className="cell orange"
            style={{
              gridRow: '1 / 3',
              gridColumn: '1 / 41',
              fontSize: '22px',
              fontWeight: 'bold',
            }}
          >
            ネーム刺繍注文受付システム
          </div>

<button
  onClick={() => setShowMenu(true)}
  style={{
    gridRow: '1 / 3',
    gridColumn: '1 / 3',
    zIndex: 20,
    alignSelf: 'center',
    justifySelf: 'center',
    width: '90%',
    height: '90%',
    fontSize: '22px',
    fontWeight: 'bold',
    background: 'transparent',
    border: 'none',
    color: '#000',
    cursor: 'pointer',
  }}
>
  ☰
</button>

{showMenu && (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onClick={() => setShowMenu(false)}
  >
    <div
      style={{
        width: '260px',
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
        管理者メニュー
      </div>

      <button
        className="app-button"
        onClick={() => {
          router.push('/import-history');
          setShowMenu(false);
        }}
        style={{ fontSize: '16px' }}
      >
        データ取込
      </button>

      <button
  className="app-button"
  onClick={() => {
    router.push('/pdf-history');
    setShowMenu(false);
  }}
  style={{ fontSize: '16px' }}
>
  PDF検索
</button>

      <button
        className="app-button"
        onClick={() => setShowMenu(false)}
        style={{ fontSize: '16px' }}
      >
        閉じる
      </button>
    </div>
  </div>
)}

          <div className="cell black progress-box" style={{ gridRow: '3 / 5', gridColumn: '1 / 5' }}>START</div>
          <div className="cell blue progress-box" style={{ gridRow: '3 / 5', gridColumn: '5 / 9' }}>数量</div>
          <div className="cell gray progress-box" style={{ gridRow: '3 / 5', gridColumn: '9 / 13' }}>場所・向き</div>
          <div className="cell gray progress-box" style={{ gridRow: '3 / 5', gridColumn: '13 / 17' }}>文字</div>
          <div className="cell gray progress-box" style={{ gridRow: '3 / 5', gridColumn: '17 / 21' }}>糸色</div>
          <div className="cell gray progress-box" style={{ gridRow: '3 / 5', gridColumn: '21 / 25' }}>書体</div>
          <div className="cell gray progress-box" style={{ gridRow: '3 / 5', gridColumn: '25 / 29' }}>大きさ</div>
          <div className="cell gray progress-box" style={{ gridRow: '3 / 5', gridColumn: '29 / 33' }}>追加項目</div>
          <div className="cell gray progress-box" style={{ gridRow: '3 / 5', gridColumn: '33 / 37' }}>注文書</div>
          <div className="cell black progress-box" style={{ gridRow: '3 / 5', gridColumn: '37 / 41' }}>GOAL</div>

          <div
            className="cell white"
            style={{
              gridRow: '7 / 8',
              gridColumn: '5 / 16',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            衣類の数量を入力してください
          </div>

          <div
            className="cell white"
            style={{
              gridRow: '7 / 8',
              gridColumn: '23 / 34',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            該当するご注文を押してください
          </div>

<div
  style={{
    gridRow: '9 / 14',
    gridColumn: '5 / 13',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  }}
>

  {/* −ボタン（小さめ） */}
  <button
    onClick={() =>
      setOrderData({
        ...orderData,
        quantity: Math.max(1, Number(orderData.quantity || 1) - 1),
      })
    }
    style={{
      width: '36px',
      height: '36px',
      fontSize: '18px',
      background: '#ddd',
      border: '1px solid #999',
      borderRadius: '6px',
    }}
  >
    −
  </button>

  {/* 数字入力（メイン） */}
  <input
    value={orderData.quantity || ''}
    onChange={(e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      setOrderData({
        ...orderData,
        quantity: val === '' ? '' : Number(val),
      });
    }}
    inputMode="numeric"
    pattern="[0-9]*"
  className="cell white"
  style={{
    width: '100px',                 // ← 少し横長に（80→100）
    textAlign: 'center',
    display: 'flex',                // ← 追加
    alignItems: 'center',           // ← 追加（縦中央）
    justifyContent: 'center',       // ← 追加（横中央）
    fontSize: '34px',               // ← 2上げる（32→34でもOK）
    fontWeight: 'bold',
    border: '2px solid #000',
  }}
  />

  {/* ＋ボタン（小さめ） */}
  <button
    onClick={() =>
      setOrderData({
        ...orderData,
        quantity: Number(orderData.quantity || 1) + 1,
      })
    }
  style={{
    width: '36px',
    height: '36px',
    fontSize: '18px',
    background: '#ddd',
    border: '1px solid #999',
    borderRadius: '6px',
    position: 'relative',
    zIndex: 5,
    }}
  >
    ＋
  </button>

</div>

          <div
            className="cell white"
            style={{
              gridRow: '10 / 13',
              gridColumn: '14 / 18',
              fontSize: '34px',
              fontWeight: 'bold',
              justifyContent: 'flex-start',
              paddingLeft: '4px',
            }}
          >
            着
          </div>

          <button
            className="app-button"
            onClick={() => router.push('/step1')}
            style={{
              gridRow: '9 / 14',
              gridColumn: '21 / 28',
              fontSize: '24px',
            }}
          >
            新規<br />注文
          </button>

          <button
            className="app-button"
            onClick={() => router.push('/repeat-history')}
            style={{
              gridRow: '9 / 14',
              gridColumn: '30 / 37',
              fontSize: '24px',
              background: '#99cc00',
            }}
          >
            リピート<br />注文
          </button>

          <div
            className="cell black"
            style={{
              gridRow: '17 / 19',
              gridColumn: '5 / 37',
              fontSize: '16px',
              color: '#ff9900',
              fontWeight: 'bold',
              border: '1px solid #000',
            }}
          >
            基本メニュー
          </div>

          <div
            style={{
              gridRow: '19 / 25',
              gridColumn: '5 / 37',
              border: '1px solid #000',
              display: 'grid',
              gridTemplateColumns: '6fr 10fr 16fr',
              background: '#fff',
              color: '#0044cc',
              fontSize: '12px',
              lineHeight: '1.55',
              alignItems: 'center',
              fontFamily: '"MS PGothic", "MSPゴシック", "Yu Gothic", sans-serif',
            }}
          >
            <div style={{ paddingLeft: '1em' }}>
              ①料金<br />
              ②刺繍できる場所<br />
              ③糸の色<br />
              ④書体<br />
              ⑤大きさ
            </div>

            <div>
              ：5文字まで400円/着(1ヶ所毎)<br />
              ：左右の胸・左右の腕<br />
              ：指定の糸色より選択<br />
              ：指定の書体より選択<br />
              ：文字高12mmまたは10mm
            </div>

            <div>
              ※1文字追加+50円/着、他追加料金項目あり<br />
              ※最大2ヶ所まで。1ヶ所目のみ2行まで刺繍可<br />
              ※1ヶ所毎に1色を選択、金・銀は追加料金+20円/字<br />
              ※1ヶ所毎に書体を選択<br />
              ※1ヶ所毎に大きさを選択
            </div>
          </div>

          <div
            className="cell white"
            style={{
              gridRow: '25 / 26',
              gridColumn: '5 / 37',
              fontSize: '11px',
              justifyContent: 'flex-start',
              paddingLeft: '1em',
              fontWeight: 'bold',
            }}
          >
            ※個人名など複数着で異なる内容の刺繍をする場合は、1ヶ所のみ2行まで、または2ヶ所各1行のみとなります
          </div>

          <div
            className="cell white"
            style={{
              gridRow: '26 / 27',
              gridColumn: '5 / 37',
              fontSize: '11px',
              justifyContent: 'flex-start',
              paddingLeft: '1em',
              fontWeight: 'bold',
            }}
          >
            ※上記以外のネーム刺繍を希望される場合は別途対応となります
          </div>

          <div
            className="bottom-bar"
            style={{
              gridRow: '29 / 31',
              gridColumn: '1 / 41',
            }}
          />

          <button
            className="app-button"
            onClick={resetOrder}
            style={{
              gridRow: '29 / 31',
              gridColumn: '1 / 5',
              fontSize: '14px',
              zIndex: 2,
            }}
          >
            全クリア
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