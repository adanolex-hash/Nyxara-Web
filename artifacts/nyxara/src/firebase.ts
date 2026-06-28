import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBJ7zJPxejOS5Q9b5X_SEW2NjwpJ7vtyTw",
  authDomain: "nyxara-6a7ef.firebaseapp.com",
  projectId: "nyxara-6a7ef",
  storageBucket: "nyxara-6a7ef.appspot.com",
  messagingSenderId: "20227132538",
  appId: "1:20227132538:web:6bad67d610147daea8bfc3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
