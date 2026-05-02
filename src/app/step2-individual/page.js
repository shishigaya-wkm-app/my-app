'use client';

import { useRouter } from 'next/navigation';
import { useOrder } from '../../context/OrderContext';

function getFontSize(text) {
  const len = String(text || '').length;
  if (len <= 8) return '14px';
  if (len <= 10) return '13px';
  if (len <= 12) return '12px';
  if (len <= 15) return '11px';
  return '10px';
}

function Cell({
  row,
  col,
  children,
  bg = '#fff',
  color = '#000',
  size = '11px',
  border = '1px solid #000',
  weight = 'normal',
  justify = 'center',
  align = 'center',
  style = {},
}) {
  return (
    <div
      style={{
        gridRow: row,
        gridColumn: col,
        background: bg,
        color,
        border,
        fontSize: size,
        fontWeight: weight,
        display: 'flex',
        justifyContent: justify,
        alignItems: align,
        textAlign: 'center',
        whiteSpace: 'pre-line',
        overflow: 'hidden',
        padding: '2px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StepCell({ row, col, children, bg = '#dddddd' }) {
  return (
    <Cell row={row} col={col} bg={bg} color="#fff" border="1px solid #fff" size="12px">
      {children}
    </Cell>
  );
}

function TextInput({ row, col, value, onChange }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        gridRow: row,
        gridColumn: col,
        display: 'block',
        width: '100%',
        height: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        border: '1px solid #000',
        background: '#fff',
        fontSize: getFontSize(value),
        textAlign: 'center',
        outline: 'none',
        padding: '0 4px',
        fontFamily: '"MS PGothic", "MSPゴシック", "Yu Gothic", sans-serif',
        zIndex: 3,
      }}
    />
  );
}

function CopyButton({ row, col, targetIndex, onCopy }) {
  return (
    <button
      onClick={() => onCopy(targetIndex)}
      style={{
        gridRow: row,
        gridColumn: col,
        width: '90%',
        height: '90%',
        alignSelf: 'center',
        justifySelf: 'center',
        border: 'none',
        borderRadius: '8px',
        background: '#ff9900',
        color: '#000',
        fontSize: '10.5px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: 'none',
        zIndex: 4,
      }}
    >
      COPY
    </button>
  );
}

function WearLabel({ rowFull, rowText, col, label, bg }) {
  return (
    <>
      <Cell row={rowFull} col={col} bg={bg} color="#fff" />
      <Cell row={rowText} col={col} bg="transparent" color="#fff" border="none" size="11px">
        {label}
      </Cell>
    </>
  );
}

export default function Step2Individual() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const list = orderData.textIndividual || Array.from({ length: 10 }, () => ({
    line1: '',
    line2: '',
  }));

  const setText = (index, key, value) => {
    const newList = Array.from({ length: 10 }, (_, i) => ({
      line1: list[i]?.line1 || '',
      line2: list[i]?.line2 || '',
    }));

    newList[index] = {
      ...newList[index],
      [key]: value,
    };

    setOrderData((prev) => ({
      ...prev,
      mode: 'individual',
      textIndividual: newList,
    }));
  };

  const copyLine1To = (targetIndex) => {
    const newList = Array.from({ length: 10 }, (_, i) => ({
      line1: list[i]?.line1 || '',
      line2: list[i]?.line2 || '',
    }));

    newList[targetIndex] = {
      ...newList[targetIndex],
      line1: newList[0]?.line1 || '',
    };

    setOrderData((prev) => ({
      ...prev,
      mode: 'individual',
      textIndividual: newList,
    }));
  };

  const clearStep2Individual = () => {
    setOrderData((prev) => ({
      ...prev,
      textIndividual: Array.from({ length: 10 }, () => ({
        line1: '',
        line2: '',
      })),
    }));
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen">
          <StepCell row="1 / 3" col="1 / 5" bg="#000">START</StepCell>
          <StepCell row="1 / 3" col="5 / 9">数量</StepCell>
          <StepCell row="1 / 3" col="9 / 13">場所・向き</StepCell>
          <StepCell row="1 / 3" col="13 / 17" bg="#0044cc">文字</StepCell>
          <StepCell row="1 / 3" col="17 / 21">糸色</StepCell>
          <StepCell row="1 / 3" col="21 / 25">書体</StepCell>
          <StepCell row="1 / 3" col="25 / 29">大きさ</StepCell>
          <StepCell row="1 / 3" col="29 / 33">追加項目</StepCell>
          <StepCell row="1 / 3" col="33 / 37">注文書</StepCell>
          <StepCell row="1 / 3" col="37 / 41" bg="#000">GOAL</StepCell>

          <Cell row="5 / 6" col="7 / 35" border="none" size="14px" weight="bold">
            刺繍する文字を入力してください　（胸＝10文字まで、腕＝5文字までが目安）
          </Cell>

          <Cell row="7 / 9" col="2 / 5" bg="#000" color="#fff">着数</Cell>
          <Cell row="7 / 9" col="5 / 13" bg="#000" color="#fff">1ヶ所目/1行目</Cell>
          <Cell row="7 / 9" col="13 / 21" bg="#000" color="#fff">
            1ヶ所目/2行目{'\n'}または2ヶ所目
          </Cell>

          <Cell row="7 / 9" col="21 / 24" bg="#000" color="#fff">着数</Cell>
          <Cell row="7 / 9" col="24 / 32" bg="#000" color="#fff">1ヶ所目/1行目</Cell>
          <Cell row="7 / 9" col="32 / 40" bg="#000" color="#fff">
            1ヶ所目/2行目{'\n'}または2ヶ所目
          </Cell>

          {[0, 1, 2, 3, 4].map((idx) => {
            const top = 9 + idx * 2;
            const bg = idx % 2 === 0 ? '#666666' : '#000000';

            return (
              <div key={`left-${idx}`} style={{ display: 'contents' }}>
                <WearLabel
                  rowFull={`${top} / ${top + 2}`}
                  rowText={`${top} / ${top + 1}`}
                  col="2 / 5"
                  label={`${idx + 1}着目`}
                  bg={bg}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="5 / 13"
                  value={list[idx]?.line1 || ''}
                  onChange={(value) => setText(idx, 'line1', value)}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="13 / 21"
                  value={list[idx]?.line2 || ''}
                  onChange={(value) => setText(idx, 'line2', value)}
                />
              </div>
            );
          })}

          {[5, 6, 7, 8, 9].map((idx) => {
            const rowIndex = idx - 5;
            const top = 9 + rowIndex * 2;
            const bg = rowIndex % 2 === 0 ? '#666666' : '#000000';

            return (
              <div key={`right-${idx}`} style={{ display: 'contents' }}>
                <WearLabel
                  rowFull={`${top} / ${top + 2}`}
                  rowText={`${top} / ${top + 1}`}
                  col="21 / 24"
                  label={`${idx + 1}着目`}
                  bg={bg}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="24 / 32"
                  value={list[idx]?.line1 || ''}
                  onChange={(value) => setText(idx, 'line1', value)}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="32 / 40"
                  value={list[idx]?.line2 || ''}
                  onChange={(value) => setText(idx, 'line2', value)}
                />
              </div>
            );
          })}

          <CopyButton row="12 / 13" col="2 / 5" targetIndex={1} onCopy={copyLine1To} />
          <CopyButton row="14 / 15" col="2 / 5" targetIndex={2} onCopy={copyLine1To} />
          <CopyButton row="16 / 17" col="2 / 5" targetIndex={3} onCopy={copyLine1To} />
          <CopyButton row="18 / 19" col="2 / 5" targetIndex={4} onCopy={copyLine1To} />

          <CopyButton row="10 / 11" col="21 / 24" targetIndex={5} onCopy={copyLine1To} />
          <CopyButton row="12 / 13" col="21 / 24" targetIndex={6} onCopy={copyLine1To} />
          <CopyButton row="14 / 15" col="21 / 24" targetIndex={7} onCopy={copyLine1To} />
          <CopyButton row="16 / 17" col="21 / 24" targetIndex={8} onCopy={copyLine1To} />
          <CopyButton row="18 / 19" col="21 / 24" targetIndex={9} onCopy={copyLine1To} />

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
            onClick={clearStep2Individual}
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