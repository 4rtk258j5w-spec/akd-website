import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBQPqa15ppwQeAac9ifPWIl8ZfMKRbMqzU",
  authDomain: "akd-web.firebaseapp.com",
  projectId: "akd-web",
  storageBucket: "akd-web.firebasestorage.app",
  messagingSenderId: "600232230484",
  appId: "1:600232230484:web:144c96924b8a43e836f7c1",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;