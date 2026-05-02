import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB244V-AcVGx_4shMC4OyoeQ-uLHc_hyL4",
  authDomain: "name-embroidery-order.firebaseapp.com",
  projectId: "name-embroidery-order",
  storageBucket: "name-embroidery-order.firebasestorage.app",
  messagingSenderId: "1620747878714",
  appId: "1:1620747878714:web:6915c6d819e76d99b78003"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);