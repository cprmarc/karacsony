import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// A te Firebase konfigurációd
const firebaseConfig = {
  apiKey: "AIzaSyAHKh33i3EF-DQiMQkb2J6Mzp0gHy-ugRA",
  authDomain: "karihuzas-109c5.firebaseapp.com",
  databaseURL: "https://karihuzas-109c5-default-rtdb.firebaseio.com",
  projectId: "karihuzas-109c5",
  storageBucket: "karihuzas-109c5.firebasestorage.app",
  messagingSenderId: "86550166304",
  appId: "1:86550166304:web:7d50b2529d0663ae16f545",
  measurementId: "G-5EQNJG596P"
};

// Most már konfigurálva van, így mindig true-t adunk vissza
export const isFirebaseConfigured = () => {
  return true;
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);