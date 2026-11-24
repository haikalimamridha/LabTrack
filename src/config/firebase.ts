import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getFirebaseMessagingSafe } from '@/services/notificationHelper';

export const auth = getAuth();
export const firestore = getFirestore();

// Lazy getter yang aman untuk messaging (menghindari error di Expo Go)
export const getMessagingSafe = getFirebaseMessagingSafe;



 