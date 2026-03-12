// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB80eKra_lUIjDGe-K0Hxbbq0Fabfdr03Y',
  authDomain: 'app-4b05c.firebaseapp.com',
  databaseURL: 'https://app-4b05c-default-rtdb.firebaseio.com',
  projectId: 'app-4b05c',
  storageBucket: 'app-4b05c.firebasestorage.app',
  messagingSenderId: '69562046511',
  appId: '1:69562046511:web:38b909326efd9b3fc60eda',
  measurementId: 'G-Z1RKVMSQGJ',
};

// Verificar que la configuración sea válida
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  throw new Error('Firebase configuration is missing required fields');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics solo en el cliente
export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
