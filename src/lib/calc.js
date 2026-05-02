// 特殊ルール適用後の文字数取得
function getAdjustedLength(text) {
  if (!text) return 0;

  let str = text;

  // （株）を1文字扱いに変換
  str = str.replace(/（株）|\(株\)/g, '■');

  // カウントしない文字を削除
  str = str.replace(/[（）() 　]/g, '');

  return str.length;
}

// 1行料金
export function calcLinePrice(text) {
  const length = getAdjustedLength(text);

  if (length === 0) return 0;
  if (length <= 5) return 400;

  return 400 + (length - 5) * 50;
}

// 金銀判定
export function isGoldOrSilver(color) {
  return color === 'Gold/金' || color === 'Silver/銀';
}

// 共通注文
export function calcCommonTotal(orderData) {
  const quantity = Number(orderData.quantity || 0);

  const line1Len = getAdjustedLength(orderData.textCommon?.line1);
  const line2Len = getAdjustedLength(orderData.textCommon?.line2);
  const secondLen = getAdjustedLength(orderData.textCommon?.second);

  const line1Price = calcLinePrice(orderData.textCommon?.line1);
  const line2Price = calcLinePrice(orderData.textCommon?.line2);
  const secondPrice = calcLinePrice(orderData.textCommon?.second);

  const line1Amount = line1Price * quantity;
  const line2Amount = line2Price * quantity;
  const secondAmount = secondPrice * quantity;

  const color1Unit = isGoldOrSilver(orderData.color1)
    ? (line1Len + line2Len) * 20
    : 0;

  const color2Unit = isGoldOrSilver(orderData.color2)
    ? secondLen * 20
    : 0;

  const colorAmount = (color1Unit + color2Unit) * quantity;

  const winterUnit = orderData.options?.winter ? 100 : 0;
  const winterAmount = winterUnit * quantity;

  const total =
    line1Amount +
    line2Amount +
    secondAmount +
    colorAmount +
    winterAmount;

  return {
    total,
  };
}

// 個別注文
export function calcIndividualTotal(orderData) {
  const rows = orderData.textIndividual || [];

  const firstLineTotal = rows.reduce((sum, row) => {
    return sum + calcLinePrice(row.line1);
  }, 0);

  const secondLineTotal = rows.reduce((sum, row) => {
    const text = row.line2 || row.second || '';
    return sum + calcLinePrice(text);
  }, 0);

  const color1Len = rows.reduce((sum, row) => {
    return sum + getAdjustedLength(row.line1);
  }, 0);

  const color2Len = rows.reduce((sum, row) => {
    const text = row.line2 || row.second || '';
    return sum + getAdjustedLength(text);
  }, 0);

  const colorAmount =
    (isGoldOrSilver(orderData.color1) ? color1Len * 20 : 0) +
    (isGoldOrSilver(orderData.color2) ? color2Len * 20 : 0);

  const count = rows.filter((r) => r.line1 || r.line2 || r.second).length;
  const winterAmount = orderData.options?.winter ? count * 100 : 0;

  return {
    total:
      firstLineTotal +
      secondLineTotal +
      colorAmount +
      winterAmount,
  };
}