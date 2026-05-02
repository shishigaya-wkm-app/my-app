'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

export default function Step1() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const setValue = (key, value) => {
    setOrderData({
      ...orderData,
      [key]: value,
    });
  };

  const clearStep1 = () => {
    setOrderData({
      ...orderData,
      position1: '',
      position2: '',
      direction1: '',
      direction2: '',
    });
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen" style={{ position: 'relative' }}>

          {/* 進捗バー */}
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '1 / 5' }}>START</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '5 / 9' }}>数量</div>
          <div className="cell blue progress-box" style={{ gridRow: '1 / 3', gridColumn: '9 / 13' }}>場所・向き</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '13 / 17' }}>文字</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '17 / 21' }}>糸色</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '21 / 25' }}>書体</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '25 / 29' }}>大きさ</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '29 / 33' }}>追加項目</div>
          <div className="cell gray progress-box" style={{ gridRow: '1 / 3', gridColumn: '33 / 37' }}>注文書</div>
          <div className="cell black progress-box" style={{ gridRow: '1 / 3', gridColumn: '37 / 41' }}>GOAL</div>

          {/* タイトル */}
          <div className="cell white" style={{ gridRow: '5 / 6', gridColumn: '5 / 18', fontSize: '12px', fontWeight: 'bold' }}>
            文字を入れる場所を選んでください
          </div>

          <div className="cell white" style={{ gridRow: '5 / 6', gridColumn: '25 / 36', fontSize: '12px', fontWeight: 'bold' }}>
            文字の向きを選んでください
          </div>

          {/* 入力UI */}
          <div className="cell black" style={{ gridRow: '7 / 9', gridColumn: '3 / 7', fontSize: '12px' }}>
            1ヶ所目
          </div>

          <select
            className="app-input"
            value={orderData.position1}
            onChange={(e) => setValue('position1', e.target.value)}
            style={{ gridRow: '7 / 9', gridColumn: '7 / 19' }}
          >
            <option value="">選択</option>
            <option>左胸</option>
            <option>右胸</option>
            <option>左腕</option>
            <option>右腕</option>
          </select>

          <div className="cell black" style={{ gridRow: '7 / 9', gridColumn: '23 / 27', fontSize: '12px' }}>
            1ヶ所目
          </div>

          <select
            className="app-input"
            value={orderData.direction1}
            onChange={(e) => setValue('direction1', e.target.value)}
            style={{ gridRow: '7 / 9', gridColumn: '27 / 39' }}
          >
            <option value="">選択</option>
            <option>ポケット上/ラインに平行</option>
            <option>ポケット上/地面に平行</option>
          </select>

          <div className="cell dark-gray" style={{ gridRow: '10 / 12', gridColumn: '3 / 7', fontSize: '12px' }}>
            2ヶ所目
          </div>

          <select
            className="app-input"
            value={orderData.position2}
            onChange={(e) => setValue('position2', e.target.value)}
            style={{ gridRow: '10 / 12', gridColumn: '7 / 19' }}
          >
            <option value="">選択</option>
            <option>左胸</option>
            <option>右胸</option>
            <option>左腕</option>
            <option>右腕</option>
          </select>

          <div className="cell dark-gray" style={{ gridRow: '10 / 12', gridColumn: '23 / 27', fontSize: '12px' }}>
            2ヶ所目
          </div>

          <select
            className="app-input"
            value={orderData.direction2}
            onChange={(e) => setValue('direction2', e.target.value)}
            style={{ gridRow: '10 / 12', gridColumn: '27 / 39' }}
          >
            <option value="">選択</option>
            <option>ポケット上/ラインに平行</option>
            <option>ポケット上/地面に平行</option>
          </select>

          {/* 🔥 画像（場所） */}
          <div style={{ gridRow: '13 / 23', gridColumn: '3 / 19', position: 'relative', zIndex: 0 }}>
            <img
              src="/sheet1-place.png"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* 🔥 画像（向き） */}
          <div style={{ gridRow: '13 / 20', gridColumn: '23 / 39', position: 'relative', zIndex: 0 }}>
            <img
              src="/sheet1-direction.png"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* ボタン */}
          <button className="app-button" onClick={() => router.push('/')} style={{ gridRow: '24 / 27', gridColumn: '14 / 19' }}>
            戻る
          </button>

          <button className="app-button" onClick={() => router.push('/step2-common')} style={{ gridRow: '23 / 25', gridColumn: '23 / 28' }}>
            次へ(共通)
          </button>

          <button className="app-button" onClick={() => router.push('/step2-individual')} style={{ gridRow: '26 / 28', gridColumn: '23 / 28' }}>
            次へ(個別)
          </button>

        </div>
      </div>
    </main>
  );
}