'use client';

import { useState } from 'react';
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

function QuantityPickerButton({ row, col, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        outline: 'none',
        padding: 0,
        zIndex: 3,
        cursor: 'pointer',
      }}
    >
      {value || ''}
    </button>
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

function PatternLabel({ rowFull, rowText, col, label, bg }) {
  return (
    <>
      <Cell row={rowFull} col={col} bg={bg} color="#fff" />
      <Cell row={rowText} col={col} bg="transparent" color="#fff" border="none" size="9px">
        {label}
      </Cell>
    </>
  );
}

function makeIndividualList(source) {
  const base = source || [];
  return Array.from({ length: 10 }, (_, i) => ({
    line1: base[i]?.line1 || '',
    line2: base[i]?.line2 || '',
    quantity: base[i]?.quantity || '',
  }));
}

export default function Step2Individual() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const [pickerIndex, setPickerIndex] = useState(null);

  const list = makeIndividualList(orderData.textIndividual);

  const setPatternValue = (index, key, value) => {
    const newList = makeIndividualList(list);

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
    const newList = makeIndividualList(list);

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

  const getPatternQuantityTotal = () => {
    return list.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  };

  const canMoveNext = () => {
    const totalQuantity = Number(orderData.quantity || 0);
    const patternTotal = getPatternQuantityTotal();

    if (totalQuantity !== patternTotal) {
      alert('総数量とパターン別数量の合計が合いません');
      return false;
    }

    return true;
  };

  const moveToStep3 = () => {
    if (!canMoveNext()) return;
    router.push('/step3');
  };

  const moveToConfirmIndividual = () => {
    if (!canMoveNext()) return;
    router.push('/confirm-individual');
  };

  const clearStep2Individual = () => {
    setOrderData((prev) => ({
      ...prev,
      textIndividual: Array.from({ length: 10 }, () => ({
        line1: '',
        line2: '',
        quantity: '',
      })),
    }));
  };

  const selectQuantity = (value) => {
    if (pickerIndex === null) return;

    setPatternValue(pickerIndex, 'quantity', value === 0 ? '' : String(value));
    setPickerIndex(null);
  };

  const renderQuantityPicker = () => {
    if (pickerIndex === null) return null;

    const current = Number(list[pickerIndex]?.quantity || 0);

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '260px',
            height: '360px',
            background: '#fff',
            border: '3px solid #000',
            borderRadius: '16px',
            padding: '14px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            パターン{pickerIndex + 1} 着数
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              border: '1px solid #999',
              borderRadius: '10px',
              background: '#f7f7f7',
            }}
          >
            {Array.from({ length: 101 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectQuantity(i)}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '44px',
                  border: 'none',
                  borderBottom: '1px solid #ddd',
                  background: current === i ? '#ffcc00' : '#fff',
                  fontSize: '20px',
                  fontWeight: current === i ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {i}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPickerIndex(null)}
            style={{
              marginTop: '12px',
              height: '44px',
              border: '2px solid #000',
              borderRadius: '10px',
              background: '#ff9900',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="app-shell">
      <div className="ipad-frame">
        <div className="grid-screen" style={{ position: 'relative' }}>
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

          <Cell row="4 / 6" col="3 / 39" border="none" size="13px" weight="bold">
            刺繍する文字とパターン毎の着数を入力してください（胸＝10文字まで、腕＝5文字までが目安）
          </Cell>

          <Cell row="7 / 9" col="2 / 5" bg="#000" color="#fff">パターン</Cell>
          <Cell row="7 / 9" col="5 / 12" bg="#000" color="#fff">1ヶ所目/1行目</Cell>
          <Cell row="7 / 9" col="12 / 19" bg="#000" color="#fff">
            1ヶ所目/2行目{'\n'}または2ヶ所目
          </Cell>
          <Cell row="7 / 9" col="19 / 21" bg="#000" color="#fff">着数</Cell>

          <Cell row="7 / 9" col="21 / 24" bg="#000" color="#fff">パターン</Cell>
          <Cell row="7 / 9" col="24 / 31" bg="#000" color="#fff">1ヶ所目/1行目</Cell>
          <Cell row="7 / 9" col="31 / 38" bg="#000" color="#fff">
            1ヶ所目/2行目{'\n'}または2ヶ所目
          </Cell>
          <Cell row="7 / 9" col="38 / 40" bg="#000" color="#fff">着数</Cell>

          {[0, 1, 2, 3, 4].map((idx) => {
            const top = 9 + idx * 2;
            const bg = idx % 2 === 0 ? '#666666' : '#000000';

            return (
              <div key={`left-${idx}`} style={{ display: 'contents' }}>
                <PatternLabel
                  rowFull={`${top} / ${top + 2}`}
                  rowText={`${top} / ${top + 1}`}
                  col="2 / 5"
                  label={`パターン${idx + 1}`}
                  bg={bg}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="5 / 12"
                  value={list[idx]?.line1 || ''}
                  onChange={(value) => setPatternValue(idx, 'line1', value)}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="12 / 19"
                  value={list[idx]?.line2 || ''}
                  onChange={(value) => setPatternValue(idx, 'line2', value)}
                />

                <QuantityPickerButton
                  row={`${top} / ${top + 2}`}
                  col="19 / 21"
                  value={list[idx]?.quantity || ''}
                  onClick={() => setPickerIndex(idx)}
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
                <PatternLabel
                  rowFull={`${top} / ${top + 2}`}
                  rowText={`${top} / ${top + 1}`}
                  col="21 / 24"
                  label={`パターン${idx + 1}`}
                  bg={bg}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="24 / 31"
                  value={list[idx]?.line1 || ''}
                  onChange={(value) => setPatternValue(idx, 'line1', value)}
                />

                <TextInput
                  row={`${top} / ${top + 2}`}
                  col="31 / 38"
                  value={list[idx]?.line2 || ''}
                  onChange={(value) => setPatternValue(idx, 'line2', value)}
                />

                <QuantityPickerButton
                  row={`${top} / ${top + 2}`}
                  col="38 / 40"
                  value={list[idx]?.quantity || ''}
                  onClick={() => setPickerIndex(idx)}
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
            onClick={moveToStep3}
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
            onClick={moveToConfirmIndividual}
            style={{
              gridRow: '29 / 31',
              gridColumn: '37 / 41',
              fontSize: '10px',
              zIndex: 2,
            }}
          >
            確認画面<br />（個別）
          </button>

          {renderQuantityPicker()}
        </div>
      </div>
    </main>
  );
}