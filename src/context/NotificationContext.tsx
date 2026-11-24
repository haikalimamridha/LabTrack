/**
 * NotificationContext.tsx
 *
 * FR-15 – Menyimpan & memperbarui token FCM per pengguna.
 * FR-16 – Meminta izin notifikasi saat masuk aplikasi.
 * FR-17 – Menangani kondisi token tidak tersedia dengan pesan jelas.
 *
 * Cara pakai:
 *   - Bungkus di root layout (sudah dilakukan di _layout.tsx).
 *   - Komponen lain gunakan `useNotification()` untuk akses status.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  getFirebaseMessagingSafe,
  isExpoGo,
} from '../services/notificationHelper';

import { useAuth } from './AuthContext';
import {
  hapusTokenFCM,
  simpanTokenFCM,
} from '../services/notificationService';
import { PESAN_IZIN } from '../hooks/usePermissions';

// ---------------------------------------------------------------------------
// Tipe
// ---------------------------------------------------------------------------

interface NotificationContextType {
  /** true selama proses permintaan izin / simpan token */
  loading: boolean;
  /** true jika izin notifikasi sudah diberikan */
  izinDiberikan: boolean;
  /** Pesan error jika ada masalah, null jika normal */
  pesanError: string | null;
  /** Minta izin & simpan token secara manual (dipanggil dari UI jika perlu) */
  mintaIzinDanSimpanToken: () => Promise<void>;
}

const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useAuth();
  const uid = user?.uid ?? null;

  const [loading, setLoading] = useState(false);
  const [izinDiberikan, setIzinDiberikan] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -------------------------------------------------------------------------
  // Minta izin & simpan token
  // -------------------------------------------------------------------------

  const mintaIzinDanSimpanToken = useCallback(async () => {
    if (!uid) return;

    setLoading(true);
    setPesanError(null);

    try {
      // 1. Cek / minta izin notifikasi
      let granted = false;
      const msg = getFirebaseMessagingSafe();

      if (msg) {
        try {
          const { requestPermission, AuthorizationStatus } = require('@react-native-firebase/messaging');
          const authStatus = await requestPermission(msg);
          granted =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;
        } catch {
          granted = false;
        }
      } else if (isExpoGo) {
        // Pada Expo Go tanpa modul native FCM, anggap izin aktif untuk testing
        granted = true;
      }

      if (!mountedRef.current) return;

      if (!granted) {
        setPesanError(PESAN_IZIN.notifikasi_ditolak);
        setIzinDiberikan(false);
        return;
      }

      setIzinDiberikan(true);

      // 2. Simpan token ke Firestore
      const hasil = await simpanTokenFCM(uid);
      if (!mountedRef.current) return;

      if (!hasil.ok) {
        setPesanError(hasil.pesan);
      }
    } catch (e) {
      console.warn('[NotificationContext] Gagal inisialisasi FCM:', e);
      if (mountedRef.current) {
        setPesanError(PESAN_IZIN.koneksi_terganggu);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [uid]);

  // -------------------------------------------------------------------------
  // Jalankan saat pengguna login
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!uid) {
      // Pengguna logout — reset state
      setIzinDiberikan(false);
      setPesanError(null);
      return;
    }

    void mintaIzinDanSimpanToken();
  }, [uid, mintaIzinDanSimpanToken]);

  // -------------------------------------------------------------------------
  // Perbarui token jika FCM me-refresh token (FR-15)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!uid) return;

    const msg = getFirebaseMessagingSafe();
    if (!msg) return;

    try {
      const { onTokenRefresh } = require('@react-native-firebase/messaging');
      const unsubscribe = onTokenRefresh(msg, async (_newToken: string) => {
        try {
          await simpanTokenFCM(uid);
          console.info('[FCM] Token diperbarui untuk uid:', uid);
        } catch {
          console.warn('[FCM] Gagal memperbarui token.');
        }
      });

      return unsubscribe;
    } catch {
      return undefined;
    }
  }, [uid]);

  // -------------------------------------------------------------------------
  // Tangani notifikasi foreground (FR-17: tampilkan pesan di UI)
  // -------------------------------------------------------------------------

  useEffect(() => {
    const msg = getFirebaseMessagingSafe();
    if (!msg) return undefined;

    try {
      const { onMessage } = require('@react-native-firebase/messaging');
      const unsubscribe = onMessage(msg, async (remoteMessage: any) => {
        console.info(
          '[FCM] Pesan masuk (foreground):',
          remoteMessage.notification?.title,
        );
      });

      return unsubscribe;
    } catch {
      return undefined;
    }
  }, []);

  // -------------------------------------------------------------------------
  // Hapus token saat logout (FR-15)
  // -------------------------------------------------------------------------

  const prevUidRef = useRef<string | null>(null);
  useEffect(() => {
    const prevUid = prevUidRef.current;
    prevUidRef.current = uid;

    // Jika uid berubah dari ada menjadi null → logout
    if (prevUid && !uid) {
      void hapusTokenFCM(prevUid);
    }
  }, [uid]);

  return (
    <NotificationContext.Provider
      value={{
        loading,
        izinDiberikan,
        pesanError,
        mintaIzinDanSimpanToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotification(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotification harus digunakan di dalam NotificationProvider',
    );
  }
  return ctx;
}
