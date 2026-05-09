'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import JsBarcode from 'jsbarcode';
import { useOrder } from '../../context/OrderContext';
import { calcLinePrice, isGoldOrSilver } from '../../lib/calc';
import { saveOrder } from "../../lib/saveOrder";
import { createSpreadsheetPdf } from '../../lib/createSpreadsheetPdf';
import { createCommonOrderPdf } from '../../lib/pdf/createCommonOrderPdf';

const kanaOptions = ['ア行', 'カ行', 'サ行', 'タ行', 'ナ行', 'ハ行', 'マ行', 'ヤ行', 'ラ行', 'ワ行'];
let kuroshiroInstance = null;
let kuroshiroInitializing = null;

async function getKuroshiro() {
  if (kuroshiroInstance) return kuroshiroInstance;

  if (!kuroshiroInitializing) {
    kuroshiroInitializing = (async () => {
      const KuroshiroModule = await import('kuroshiro');
      const KuromojiAnalyzerModule = await import('kuroshiro-analyzer-kuromoji');

      const Kuroshiro = KuroshiroModule.default;
      const KuromojiAnalyzer = KuromojiAnalyzerModule.default;

      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict' }));

      kuroshiroInstance = kuroshiro;
      return kuroshiro;
    })();
  }

  return kuroshiroInitializing;
}

function cleanCustomerNameForYomi(name) {
  return String(name || '')
    .replace(/株式会社/g, '')
    .replace(/有限会社/g, '')
    .replace(/合同会社/g, '')
    .replace(/㈱/g, '')
    .replace(/㈲/g, '')
    .replace(/\(株\)/g, '')
    .replace(/（株）/g, '')
    .replace(/\(有\)/g, '')
    .replace(/（有）/g, '')
    .replace(/\(同\)/g, '')
    .replace(/（同）/g, '')
    .trim();
}

async function makeAutoYomi(name) {
  const cleaned = cleanCustomerNameForYomi(name);
  if (!cleaned) return '';

  try {
    const kuroshiro = await getKuroshiro();
    const converted = await kuroshiro.convert(cleaned, {
      to: 'katakana',
      mode: 'normal',
    });

    return String(converted || '').replace(/\s/g, '').trim();
  } catch (error) {
    console.error(error);
    return cleaned;
  }
}

function yen(value) {
  if (value === '' || value === null || value === undefined || Number(value) === 0) return '';
  return Number(value).toLocaleString('ja-JP');
}

function todayText() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function adjustedLength(text) {
  if (!text) return 0;
  let str = String(text);
  str = str.replace(/（株）|\(株\)/g, '■');
  str = str.replace(/[（）() 　]/g, '');
  return str.length;
}

function checkDigit(code12) {
  const nums = String(code12).split('').map(Number);
  const sum = nums.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

function makeBarcode(total) {
  const amount = String(Number(total || 0)).padStart(6, '0');
  const base12 = `291002${amount}`;
  return `${base12}${checkDigit(base12)}`;
}

export default function ConfirmCommon() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrder();

  const barcodeRef = useRef(null);

  const [showPrintPopup, setShowPrintPopup] = useState(false);
  const [doPrint, setDoPrint] = useState(true);
  const [doSave, setDoSave] = useState(true);

  const quantity = Number(orderData.quantity || 0);

  const text1 = orderData.textCommon?.line1 || '';
  const text2 = orderData.textCommon?.line2 || '';
  const text3 = orderData.textCommon?.second || '';

  const unit1 = calcLinePrice(text1);
  const unit2 = calcLinePrice(text2);
  const unit3 = calcLinePrice(text3);

  const qty1 = unit1 ? quantity : '';
  const qty2 = unit2 ? quantity : '';
  const qty3 = unit3 ? quantity : '';

  const amount1 = unit1 && quantity ? unit1 * quantity : '';
  const amount2 = unit2 && quantity ? unit2 * quantity : '';
  const amount3 = unit3 && quantity ? unit3 * quantity : '';

  const colorUnit =
    (isGoldOrSilver(orderData.color1) ? (adjustedLength(text1) + adjustedLength(text2)) * 20 : 0) +
    (isGoldOrSilver(orderData.color2) ? adjustedLength(text3) * 20 : 0);

  const colorQty = colorUnit ? quantity : '';
  const colorAmount = colorUnit && quantity ? colorUnit * quantity : '';

  const optionUnit = orderData.options?.winter ? 100 : 0;
  const optionQty = optionUnit ? quantity : '';
  const optionAmount = optionUnit && quantity ? optionUnit * quantity : '';

  const total =
    Number(amount1 || 0) +
    Number(amount2 || 0) +
    Number(amount3 || 0) +
    Number(colorAmount || 0) +
    Number(optionAmount || 0);

  const barcodeValue = makeBarcode(total);

  useEffect(() => {
    if (!barcodeRef.current) return;

    const timer = setTimeout(() => {
      if (!barcodeRef.current) return;

      barcodeRef.current.innerHTML = '';

      JsBarcode(barcodeRef.current, barcodeValue, {
        format: 'EAN13',
        displayValue: false,
        margin: 0,
        width: 1.7,
        height: 44,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [barcodeValue, orderData.customerName, orderData.yomi, orderData.kana]);

  const updateField = (key, value) => {
    setOrderData({
      ...orderData,
      [key]: value,
    });
  };

  function getKanaGroup(yomi) {
    const first = String(yomi || '').trim().charAt(0);

    if ('アイウエオ'.includes(first)) return 'ア行';
    if ('カキクケコガギグゲゴ'.includes(first)) return 'カ行';
    if ('サシスセソザジズゼゾ'.includes(first)) return 'サ行';
    if ('タチツテトダヂヅデド'.includes(first)) return 'タ行';
    if ('ナニヌネノ'.includes(first)) return 'ナ行';
    if ('ハヒフヘホバビブベボパピプペポ'.includes(first)) return 'ハ行';
    if ('マミムメモ'.includes(first)) return 'マ行';
    if ('ヤユヨ'.includes(first)) return 'ヤ行';
    if ('ラリルレロ'.includes(first)) return 'ラ行';
    if ('ワヲン'.includes(first)) return 'ワ行';

    return '';
  }

const executePrintSave = async () => {
  if (!doPrint && !doSave) {
    alert('印刷または保存を選択してください。');
    return;
  }

  let previewWindow = null;

  if (doPrint) {
    previewWindow = window.open('', '_blank');

    if (!previewWindow) {
      alert('新しいタブを開けませんでした。ポップアップブロックを解除してください。');
      return;
    }
  }

  try {
    if (doPrint && previewWindow) {
      const previewUrl = await createCommonOrderPdf(orderData);
      previewWindow.location.href = previewUrl;
    }

    setShowPrintPopup(false);

    if (doSave) {
      await createSpreadsheetPdf({
        orderData,
        mode: 'common',
        savePdf: true,
      });

      if (!doPrint) {
        alert('PDFデータを保存しました。');
      }
    }
  } catch (error) {
    console.error(error);

    if (previewWindow) {
      previewWindow.close();
    }

    alert('PDF作成に失敗しました。');
  }
};

  const Cell = ({
    row,
    col,
    children,
    bg = '#fff',
    color = '#000',
    size = '12px',
    border = '1px solid #000',
    justify = 'center',
    align = 'center',
    weight = 'normal',
    style = {},
  }) => (
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
        textAlign: justify === 'flex-start' ? 'left' : justify === 'flex-end' ? 'right' : 'center',
        padding: '2px',
        overflow: 'hidden',
        whiteSpace: 'pre-line',
        ...style,
      }}
    >
      {children}
    </div>
  );

  const StepCell = ({ row, col, children, bg = '#dddddd', color = '#fff' }) => (
    <Cell
      row={row}
      col={col}
      bg={bg}
      color={color}
      border="1px solid #fff"
      size="12px"
    >
      {children}
    </Cell>
  );

  const ChangeButton = ({ row, onClick }) => (
    <button
      onClick={onClick}
      style={{
        gridRow: row,
        gridColumn: '6 / 9',
        width: '90%',
        height: '90%',
        alignSelf: 'center',
        justifySelf: 'center',
        fontSize: '10px',
        zIndex: 4,
        background: '#ff9900',
        color: '#000',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: 'none',
      }}
    >
      変更
    </button>
  );

  const LeftLabel = ({ row, children }) => (
    <>
      <Cell row={row} col="3 / 9" bg="#dddddd" />
      <Cell row={row} col="3 / 6" bg="transparent" border="none" color="#000">
        {children}
      </Cell>
    </>
  );

  return (
    <main className="app-shell">
      <div className="ipad-frame" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <div
          className="grid-screen"
          style={{
            height: '160%',
            gridTemplateRows: 'repeat(48, 1fr)',
          }}
        >
          <StepCell row="1 / 3" col="1 / 5" bg="#000">START</StepCell>
          <StepCell row="1 / 3" col="5 / 9">数量</StepCell>
          <StepCell row="1 / 3" col="9 / 13">場所・向き</StepCell>
          <StepCell row="1 / 3" col="13 / 17">文字</StepCell>
          <StepCell row="1 / 3" col="17 / 21">糸色</StepCell>
          <StepCell row="1 / 3" col="21 / 25">書体</StepCell>
          <StepCell row="1 / 3" col="25 / 29">大きさ</StepCell>
          <StepCell row="1 / 3" col="29 / 33">追加項目</StepCell>
          <StepCell row="1 / 3" col="33 / 37" bg="#0044cc">注文書</StepCell>
          <StepCell row="1 / 3" col="37 / 41" bg="#000">GOAL</StepCell>

          <button
            className="app-button"
            onClick={async () => {
              try {
                await saveOrder(orderData);
                alert("保存しました");
              } catch (e) {
                alert("保存失敗");
              }
            }}
            style={{
              gridRow: '3 / 5',
              gridColumn: '33 / 36',
              width: '90%',
              height: '90%',
              alignSelf: 'center',
              justifySelf: 'center',
              fontSize: '10px',
              zIndex: 5,
            }}
          >
            保存
          </button>

          <button
            className="app-button"
            onClick={() => setShowPrintPopup(true)}
            style={{
              gridRow: '3 / 5',
              gridColumn: '36 / 39',
              width: '90%',
              height: '90%',
              alignSelf: 'center',
              justifySelf: 'center',
              fontSize: '10px',
              zIndex: 5,
            }}
          >
            印刷
          </button>

          <Cell row="4 / 5" col="17 / 25" border="none">お客様情報入力欄</Cell>

          <Cell row="5 / 6" col="3 / 6" border="none" justify="flex-end">注文日:</Cell>
          <input
  type="text"
  value={orderData.orderDate || todayText()}
  onChange={(e) =>
    setOrderData({
      ...orderData,
      orderDate: e.target.value,
    })
  }
  style={{
    gridRow: '5 / 6',
    gridColumn: '6 / 11',
    border: 'none',
    fontSize: '14px',
    textAlign: 'left',
    paddingLeft: '4px',
    background: 'transparent',
    outline: 'none',
    zIndex: 3,
  }}
/>

          <Cell row="6 / 8" col="3 / 10" bg="#000" color="#fff">お客様名</Cell>

          <div
            style={{
              gridRow: '6 / 8',
              gridColumn: '10 / 31',
              display: 'grid',
              gridTemplateRows: '1fr 0.72fr',
              border: '1px solid #000',
              background: '#fff',
              zIndex: 3,
              boxSizing: 'border-box',
            }}
          >
            <input
              value={orderData.customerName || ''}
              onChange={(e) => updateField('customerName', e.target.value)}
                onBlur={async () => {
    const yomi = await makeAutoYomi(orderData.customerName);

    setOrderData({
      ...orderData,
      yomi,
      kana: getKanaGroup(yomi),
    });
  }}
              style={{
                border: 'none',
                borderBottom: '1px solid #ccc',
                fontSize: '14px',
                paddingLeft: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <input
              value={orderData.yomi || ''}
              onChange={(e) => {
                const yomi = e.target.value;

                setOrderData({
                  ...orderData,
                  yomi: yomi,
                  kana: getKanaGroup(yomi),
                });
              }}
              placeholder="フリガナ"
              style={{
                border: 'none',
                fontSize: '10px',
                paddingLeft: '8px',
                outline: 'none',
                color: '#333',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <Cell row="6 / 8" col="31 / 36" bg="#000" color="#fff">
            保存先{'\n'}グループ
          </Cell>

          <select
            value={orderData.kana || ''}
            onChange={(e) => updateField('kana', e.target.value)}
            style={{
              gridRow: '6 / 8',
              gridColumn: '36 / 39',
              border: '1px solid #000',
              fontSize: '14px',
              textAlign: 'center',
              zIndex: 3,
            }}
          >
            <option value="">▼</option>
            {kanaOptions.map((kana) => (
              <option key={kana} value={kana}>{kana}</option>
            ))}
          </select>

          <Cell row="9 / 10" col="3 / 39" bg="#000" color="#fff">ネーム内容</Cell>

          <LeftLabel row="10 / 12">着数</LeftLabel>
          <ChangeButton row="10 / 12" onClick={() => router.push('/')} />
          <Cell row="10 / 12" col="9 / 39" size="14px">{quantity ? `${quantity}着` : ''}</Cell>

          <LeftLabel row="12 / 18">文字</LeftLabel>
          <ChangeButton row="14 / 16" onClick={() => router.push('/step2-common')} />
          <Cell row="12 / 14" col="9 / 24" bg="#dddddd">1ヶ所目</Cell>
          <Cell row="12 / 14" col="24 / 39" bg="#dddddd">2ヶ所目</Cell>
          <Cell row="14 / 16" col="9 / 24" size="14px">{text1}</Cell>
          <Cell row="16 / 18" col="9 / 24" size="14px">{text2}</Cell>
          <Cell row="14 / 18" col="24 / 39" size="14px">{text3}</Cell>

          <LeftLabel row="18 / 20">場所</LeftLabel>
          <ChangeButton row="18 / 20" onClick={() => router.push('/step1')} />
          <Cell row="18 / 20" col="9 / 24" size="14px">{orderData.position1}</Cell>
          <Cell row="18 / 20" col="24 / 39" size="14px">{orderData.position2}</Cell>

          <LeftLabel row="20 / 22">向き</LeftLabel>
          <ChangeButton row="20 / 22" onClick={() => router.push('/step1')} />
          <Cell row="20 / 22" col="9 / 24" size="14px">{orderData.direction1}</Cell>
          <Cell row="20 / 22" col="24 / 39" size="14px">{orderData.direction2}</Cell>

          <LeftLabel row="22 / 24">糸色</LeftLabel>
          <ChangeButton row="22 / 24" onClick={() => router.push('/step3')} />
          <Cell row="22 / 24" col="9 / 24" size="14px">{orderData.color1}</Cell>
          <Cell row="22 / 24" col="24 / 39" size="14px">{orderData.color2}</Cell>

          <LeftLabel row="24 / 26">書体</LeftLabel>
          <ChangeButton row="24 / 26" onClick={() => router.push('/step4')} />
          <Cell row="24 / 26" col="9 / 24" size="14px">{orderData.font1}</Cell>
          <Cell row="24 / 26" col="24 / 39" size="14px">{orderData.font2}</Cell>

          <LeftLabel row="26 / 28">大きさ</LeftLabel>
          <ChangeButton row="26 / 28" onClick={() => router.push('/step5')} />
          <Cell row="26 / 28" col="9 / 24" size="14px">{orderData.size1}</Cell>
          <Cell row="26 / 28" col="24 / 39" size="14px">{orderData.size2}</Cell>

          <LeftLabel row="28 / 30">追加項目</LeftLabel>
          <ChangeButton row="28 / 30" onClick={() => router.push('/step6')} />
          <Cell row="28 / 30" col="9 / 39" size="14px">
            {orderData.options?.winter ? '防寒着への刺繍' : ''}
          </Cell>

          <LeftLabel row="30 / 33">備考欄</LeftLabel>
          <ChangeButton row="30 / 33" onClick={() => router.push('/step6')} />
          <Cell
            row="30 / 33"
            col="9 / 39"
            size="14px"
            justify="flex-start"
            align="flex-start"
            style={{ padding: '5px', lineHeight: '1.25' }}
          >
            {orderData.note}
          </Cell>

          <Cell row="34 / 36" col="3 / 15" bg="#000" color="#fff">料金</Cell>
          <Cell row="34 / 36" col="15 / 23" bg="#dddddd">単価</Cell>
          <Cell row="34 / 36" col="23 / 31" bg="#dddddd">数量</Cell>
          <Cell row="34 / 36" col="31 / 39" bg="#dddddd">金額(税込)</Cell>

          <Cell row="36 / 42" col="3 / 7" bg="#dddddd">基本料</Cell>
          <Cell row="36 / 38" col="7 / 15" bg="#dddddd">1ヶ所目/1行目</Cell>
          <Cell row="38 / 40" col="7 / 15" bg="#dddddd">1ヶ所目/2行目</Cell>
          <Cell row="40 / 42" col="7 / 15" bg="#dddddd">2ヶ所目</Cell>

          <Cell row="42 / 44" col="3 / 15" bg="#dddddd">糸色追加料金(金・銀)</Cell>
          <Cell row="44 / 46" col="3 / 15" bg="#dddddd">追加料金項目</Cell>

          <Cell row="36 / 38" col="15 / 23" size="14px" justify="flex-end">{yen(unit1)}</Cell>
          <Cell row="38 / 40" col="15 / 23" size="14px" justify="flex-end">{yen(unit2)}</Cell>
          <Cell row="40 / 42" col="15 / 23" size="14px" justify="flex-end">{yen(unit3)}</Cell>
          <Cell row="42 / 44" col="15 / 23" size="14px" justify="flex-end">{yen(colorUnit)}</Cell>
          <Cell row="44 / 46" col="15 / 23" size="14px" justify="flex-end">{yen(optionUnit)}</Cell>

          <Cell row="36 / 38" col="23 / 31" size="14px" justify="flex-end">{qty1}</Cell>
          <Cell row="38 / 40" col="23 / 31" size="14px" justify="flex-end">{qty2}</Cell>
          <Cell row="40 / 42" col="23 / 31" size="14px" justify="flex-end">{qty3}</Cell>
          <Cell row="42 / 44" col="23 / 31" size="14px" justify="flex-end">{colorQty}</Cell>
          <Cell row="44 / 46" col="23 / 31" size="14px" justify="flex-end">{optionQty}</Cell>

          <Cell row="36 / 38" col="31 / 39" size="14px" justify="flex-end">{yen(amount1)}</Cell>
          <Cell row="38 / 40" col="31 / 39" size="14px" justify="flex-end">{yen(amount2)}</Cell>
          <Cell row="40 / 42" col="31 / 39" size="14px" justify="flex-end">{yen(amount3)}</Cell>
          <Cell row="42 / 44" col="31 / 39" size="14px" justify="flex-end">{yen(colorAmount)}</Cell>
          <Cell row="44 / 46" col="31 / 39" size="14px" justify="flex-end">{yen(optionAmount)}</Cell>

          <Cell
            row="46 / 48"
            col="3 / 39"
            border="2px solid #000"
            bg="transparent"
            style={{
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          <Cell
            row="46 / 48"
            col="3 / 15"
            bg="#dddddd"
            border="2px solid #000"
            weight="bold"
            style={{ zIndex: 2 }}
          >
            合計
          </Cell>

          <Cell
            row="46 / 48"
            col="15 / 23"
            border="none"
            bg="#fff"
            style={{ zIndex: 2 }}
          >
            <svg ref={barcodeRef} style={{ width: '90%', height: '90%' }} />
          </Cell>

          <Cell
            row="46 / 48"
            col="23 / 39"
            size="16px"
            justify="flex-end"
            border="none"
            weight="bold"
            style={{
              paddingRight: '8px',
              zIndex: 2,
            }}
          >
            {yen(total)}
          </Cell>

          {showPrintPopup && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  width: '55%',
                  background: '#fff',
                  border: '3px solid #000',
                  borderRadius: '14px',
                  padding: '22px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
<div style={{ fontSize: '20px', marginBottom: '18px' }}>
  処理を選択してください
</div>

<div
  style={{
    width: '260px',
    margin: '0 auto 20px',
    textAlign: 'left',
  }}
>
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      fontSize: '18px',
      marginBottom: '12px',
      justifyContent: 'flex-start',
    }}
  >
    <input
      type="checkbox"
      checked={doPrint}
      onChange={(e) => setDoPrint(e.target.checked)}
      style={{
        width: '22px',
        height: '22px',
        marginRight: '10px',
      }}
    />
    印刷する
  </label>

  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      fontSize: '18px',
      justifyContent: 'flex-start',
    }}
  >
    <input
      type="checkbox"
      checked={doSave}
      onChange={(e) => setDoSave(e.target.checked)}
      style={{
        width: '22px',
        height: '22px',
        marginRight: '10px',
      }}
    />
    PDFデータを保存する
  </label>
</div>

                <button
                  className="app-button"
                  onClick={executePrintSave}
                  style={{ width: '110px', height: '45px', fontSize: '14px', marginRight: '16px' }}
                >
                  実行
                </button>

                <button
                  className="app-button"
                  onClick={() => setShowPrintPopup(false)}
                  style={{ width: '110px', height: '45px', fontSize: '14px' }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}