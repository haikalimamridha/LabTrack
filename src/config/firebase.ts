import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAO_Ugu6hwnIi127j5809KmEYCUxC3XQP8',
  appId: '1:567603587056:android:2489720bb0480cdd10df35',
  databaseURL: 'https://labtrack-a44c0-default-rtdb.firebaseio.com',
  messagingSenderId: '567603587056',
  projectId: 'labtrack-a44c0',
  storageBucket: 'labtrack-a44c0.firebasestorage.app',
  authDomain: 'labtrack-a44c0.firebaseapp.com',
};

// Inisialisasi Firebase app jika belum ada instance aktif (terutama pada web / environment non-native)
if (getApps().length === 0) {
  try {
    initializeApp(firebaseConfig);
  } catch (error) {
    console.warn('Inisialisasi Firebase otomatis:', error);
  }
}

export const auth = getAuth();
export const firestore = getFirestore();
