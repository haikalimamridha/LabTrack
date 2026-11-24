/**
 * notificationHelper.ts
 *
 * Helper aman untuk integrasi FCM (Firebase Cloud Messaging).
 * Menghindari error crash di Expo Go:
 * - "Native module NativeRNFBTurboMessaging is not registered"
 * - "Cannot find native module 'ExpoPushTokenManager'"
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Cek apakah aplikasi sedang berjalan di lingkungan Expo Go.
 * Di Expo Go (SDK 51+), native module custom seperti Firebase Messaging
 * memerlukan Development Build (npx expo run:android).
 */
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

/**
 * Memuat instance @react-native-firebase/messaging secara aman.
 * Mengembalikan null jika di Expo Go atau modul native belum di-link.
 */
export function getFirebaseMessagingSafe(): any {
  if (isExpoGo) return null;

  try {
    const { getMessaging } = require('@react-native-firebase/messaging');
    return getMessaging();
  } catch {
    return null;
  }
}

/**
 * Mengambil token notifikasi FCM perangkat.
 * - Pada Development Build / Standalone APK: mengambil FCM Token asli dari Firebase.
 * - Pada Expo Go / Simulator: menghasilkan token testing yang valid sehingga
 *   alur Firestore (FR-15, FR-18) dan UI tetap berfungsi tanpa crash.
 */
export async function getDevicePushTokenSafe(uid?: string): Promise<string> {
  // 1. Coba ambil token asli dari Firebase Cloud Messaging jika native module tersedia
  const fcm = getFirebaseMessagingSafe();
  if (fcm) {
    try {
      const { getToken } = require('@react-native-firebase/messaging');
      const token = await getToken(fcm);
      if (token) return token;
    } catch (e) {
      console.info('[notificationHelper] Native FCM getToken belum aktif:', e);
    }
  }

  // 2. Token development / Expo Go untuk testing presensi & notifikasi Firestore
  const identifier = uid ? uid.slice(0, 8) : Date.now().toString(36);
  return `fcm-token-${Platform.OS}-${identifier}`;
}
