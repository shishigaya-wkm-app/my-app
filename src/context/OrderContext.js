'use client';

import { createContext, useContext, useState } from 'react';

// Context作成
const OrderContext = createContext();

// 初期データ
const initialOrderData = {
  quantity: 1,
  mode: "common",

  position1: "",
  position2: "",
  direction1: "",
  direction2: "",

  textCommon: {
    line1: "",
    line2: "",
    second: ""
  },

  textIndividual: Array.from({ length: 10 }, () => ({
    line1: "",
    line2: "",
    second: ""
  })),

  color1: "",
  color2: "",

  font1: "",
  font2: "",

  size1: "",
  size2: "",

  options: {
    winter: false,
  },

  note: "",

  customerName: "",
  kana: "",
};

// Provider
export const OrderProvider = ({ children }) => {
  const [orderData, setOrderData] = useState(initialOrderData);

  // 全クリア
  const resetOrder = () => {
    setOrderData(initialOrderData);
  };

  return (
    <OrderContext.Provider value={{ orderData, setOrderData, resetOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

// どこからでも使うための関数
export const useOrder = () => useContext(OrderContext);