import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

function getTodayBase() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeMode(orderData) {
  if (orderData.mode === "individual") return "individual";
  if (orderData.textIndividual?.some((row) => row?.line1 || row?.line2)) return "individual";
  return "common";
}

async function makeOrderDate(customerName) {
  const baseDate = getTodayBase();

  const q = query(
    collection(db, "orders"),
    where("customerName", "==", customerName || ""),
    where("orderDateBase", "==", baseDate)
  );

  const snapshot = await getDocs(q);
  const branch = String(snapshot.size + 1).padStart(2, "0");

  return {
    orderDateBase: baseDate,
    orderDate: `${baseDate}-${branch}`,
  };
}

function buildCommonData(orderData) {
  return {
    textCommon: {
      line1: orderData.textCommon?.line1 || "",
      line2: orderData.textCommon?.line2 || "",
      second: orderData.textCommon?.second || "",
    },
  };
}

function buildIndividualData(orderData) {
  const rows = orderData.textIndividual || [];

  return {
    textIndividual: Array.from({ length: 10 }, (_, i) => ({
      line1: rows[i]?.line1 || "",
      line2: rows[i]?.line2 || "",
    })),
  };
}

export const saveOrder = async (orderData) => {
  const mode = normalizeMode(orderData);
  const customerName = orderData.customerName || "";
  const { orderDateBase, orderDate } = await makeOrderDate(customerName);

  const baseData = {
    orderDate,
    orderDateBase,

    customerName,
    kana: orderData.kana || "",
    yomi: orderData.yomi || "",
    mode,

    position1: orderData.position1 || "",
    position2: orderData.position2 || "",

    direction1: orderData.direction1 || "",
    direction2: orderData.direction2 || "",

    color1: orderData.color1 || "",
    color2: orderData.color2 || "",

    font1: orderData.font1 || "",
    font2: orderData.font2 || "",

    size1: orderData.size1 || "",
    size2: orderData.size2 || "",

    note: orderData.note || "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docData =
    mode === "individual"
      ? { ...baseData, ...buildIndividualData(orderData) }
      : { ...baseData, ...buildCommonData(orderData) };

  const docRef = await addDoc(collection(db, "orders"), docData);
  return docRef.id;
};