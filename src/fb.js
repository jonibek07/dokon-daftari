// Firebase ulanishi. Sozlamalar (config va egasi emaili) build paytida qo'yiladi.
import { initializeApp } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, signOut
} from 'firebase/auth';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache,
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc, writeBatch
} from 'firebase/firestore';

/* global __FB_CONFIG__ */
const app = initializeApp(__FB_CONFIG__);
export const auth = getAuth(app);

// Internet bo'lmasa ham ishlashi uchun ma'lumotlar telefonda ham saqlanadi
let db;
try {
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
} catch (e) {
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
}

export {
  db, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, signOut,
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc, writeBatch
};
