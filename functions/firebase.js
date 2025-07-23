// firebase.js (adjusted for Firebase-only logic, no MQTT)

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCg6xi0_Kx7uX6Nc4t6B-4nwukCgo5LT4k",
  authDomain: "meesa-6cc00.firebaseapp.com",
  projectId: "meesa-6cc00",
  storageBucket: "meesa-6cc00.appspot.com",
  messagingSenderId: "648709826389",
  appId: "1:648709826389:web:3ff56515d746cabcccb1dc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, signInWithPopup, signOut, collection, addDoc, query, where, orderBy, onSnapshot };
