/**
 * usePermissions.ts
 *
 * FR-16 – Minta izin notifikasi dan lokasi.
 * FR-17 – Tangani kondisi: izin ditolak, GPS mati, lokasi belum tersedia,
 *          koneksi terganggu, notifikasi tidak dapat diterima — dengan pesan jelas.
 *
 * Pola satu hook untuk koordinasi dengan Faiq (presensi/lokasi) dan Haikal (maps).
 */

import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { getFirebaseMessagingSafe, isExpoGo } from '@/services/notificationHelper';

// ---------------------------------------------------------------------------
// Tipe
// ---------------------------------------------------------------------------

export type StatusIzin = 'unknown' | 'granted' | 'denied' | 'unavailable';

export interface StatusPermissions {
  notifikasi: StatusIzin;
  lokasi: StatusIzin;
  lokasiLatar: StatusIzin; // background (opsional, dipakai Faiq/Haikal)
}

export interface HasilPermissions {
  status: StatusPermissions;
  loading: boolean;
  mintaIzinNotifikasi: () => Promise<StatusIzin>;
  mintaIzinLokasi: () => Promise<StatusIzin>;
  mintaIzinLokasiLatar: () => Promise<StatusIzin>;
  cekSemua: () => Promise<StatusPermissions>;
}

// ---------------------------------------------------------------------------
// Pesan error ramah pengguna (FR-17)
// ---------------------------------------------------------------------------

export const PESAN_IZIN = {
  notifikasi_ditolak:
    'Notifikasi dinonaktifkan. Aktifkan di Pengaturan > Aplikasi > LabTrack > Notifikasi agar kamu tidak melewatkan info penting.',
  lokasi_ditolak:
    'Izin lokasi ditolak. Aktifkan di Pengaturan > Aplikasi > LabTrack > Izin > Lokasi.',
  lokasi_tidak_tersedia:
    'Layanan lokasi tidak tersedia di perangkat ini.',
  gps_mati:
    'GPS tidak aktif. Aktifkan Lokasi/GPS di pengaturan perangkat untuk melanjutkan.',
  koneksi_terganggu:
    'Tidak dapat terhubung ke server. Periksa koneksi internet, lalu coba lagi.',
  notifikasi_tidak_bisa:
    'Notifikasi tidak dapat diterima saat ini (perangkat fisik diperlukan untuk notifikasi push).',
} as const;

// ---------------------------------------------------------------------------
// Helper: buka pengaturan sistem
// ---------------------------------------------------------------------------

function bukaSettings() {
  if (Platform.OS === 'ios') {
    void Linking.openURL('app-settings:');
  } else {
    void Linking.openSettings();
  }
}

function alertDenied(fitur: string, pesan: string) {
  Alert.alert(
    `Izin ${fitur} Diperlukan`,
    pesan,
    [
      { text: 'Nanti', style: 'cancel' },
      { text: 'Buka Pengaturan', onPress: bukaSettings },
    ],
    { cancelable: true },
  );
}

// ---------------------------------------------------------------------------
// Hook utama
// ---------------------------------------------------------------------------

export function usePermissions(): HasilPermissions {
  const [status, setStatus] = useState<StatusPermissions>({
    notifikasi: 'unknown',
    lokasi: 'unknown',
    lokasiLatar: 'unknown',
  });
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -------------------------------------------------------------------------
  // FR-16 & FR-17: Izin notifikasi
  // -------------------------------------------------------------------------

  const mintaIzinNotifikasi = useCallback(async (): Promise<StatusIzin> => {
    try {
      // Simulator tidak mendukung push notifications
      const { isDevice } = await import('expo-device');
      if (!isDevice) {
        if (mountedRef.current)
          setStatus((s) => ({ ...s, notifikasi: 'unavailable' }));
        console.info(PESAN_IZIN.notifikasi_tidak_bisa);
        return 'unavailable';
      }

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
        // Pada Expo Go tanpa modul native, anggap izin aktif untuk pengujian UI/Firestore
        granted = true;
      }

      const result: StatusIzin = granted ? 'granted' : 'denied';

      if (mountedRef.current)
        setStatus((s) => ({ ...s, notifikasi: result }));

      if (!granted) {
        alertDenied('Notifikasi', PESAN_IZIN.notifikasi_ditolak);
      }

      return result;
    } catch (e) {
      console.warn('[usePermissions] Gagal minta izin notifikasi:', e);
      if (mountedRef.current)
        setStatus((s) => ({ ...s, notifikasi: 'denied' }));
      return 'denied';
    }
  }, []);

  // -------------------------------------------------------------------------
  // FR-16 & FR-17: Izin lokasi (foreground)
  // -------------------------------------------------------------------------

  const mintaIzinLokasi = useCallback(async (): Promise<StatusIzin> => {
    try {
      // Cek apakah layanan lokasi aktif di perangkat (GPS)
      const layananAktif = await Location.hasServicesEnabledAsync();
      if (!layananAktif) {
        if (mountedRef.current)
          setStatus((s) => ({ ...s, lokasi: 'denied' }));
        Alert.alert(
          'GPS Tidak Aktif',
          PESAN_IZIN.gps_mati,
          [{ text: 'OK' }],
        );
        return 'denied';
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      let result: StatusIzin;
      if (status === 'granted') {
        result = 'granted';
      } else if (status === 'denied') {
        result = 'denied';
        alertDenied('Lokasi', PESAN_IZIN.lokasi_ditolak);
      } else {
        result = 'unavailable';
      }

      if (mountedRef.current)
        setStatus((s) => ({ ...s, lokasi: result }));

      return result;
    } catch (e) {
      console.warn('[usePermissions] Gagal minta izin lokasi:', e);
      if (mountedRef.current)
        setStatus((s) => ({ ...s, lokasi: 'denied' }));
      return 'denied';
    }
  }, []);

  // -------------------------------------------------------------------------
  // Izin lokasi latar (background) — untuk Faiq/Haikal jika diperlukan
  // -------------------------------------------------------------------------

  const mintaIzinLokasiLatar = useCallback(async (): Promise<StatusIzin> => {
    try {
      const { status: fg } = await Location.getForegroundPermissionsAsync();
      if (fg !== 'granted') {
        // Harus minta foreground dulu
        const hasilFg = await mintaIzinLokasi();
        if (hasilFg !== 'granted') return hasilFg;
      }

      const { status } =
        await Location.requestBackgroundPermissionsAsync();
      const result: StatusIzin = status === 'granted' ? 'granted' : 'denied';

      if (mountedRef.current)
        setStatus((s) => ({ ...s, lokasiLatar: result }));

      if (result === 'denied') {
        alertDenied('Lokasi Latar', PESAN_IZIN.lokasi_ditolak);
      }

      return result;
    } catch (e) {
      console.warn('[usePermissions] Gagal minta izin lokasi latar:', e);
      if (mountedRef.current)
        setStatus((s) => ({ ...s, lokasiLatar: 'denied' }));
      return 'denied';
    }
  }, [mintaIzinLokasi]);

  // -------------------------------------------------------------------------
  // Cek semua izin (tanpa meminta ulang jika sudah granted)
  // -------------------------------------------------------------------------

  const cekSemua = useCallback(async (): Promise<StatusPermissions> => {
    setLoading(true);
    try {
      // Notifikasi
      let notifikasi: StatusIzin = 'unknown';
      const msg = getFirebaseMessagingSafe();

      if (msg) {
        try {
          const { hasPermission, AuthorizationStatus } = require('@react-native-firebase/messaging');
          const authStatus = await hasPermission(msg);
          notifikasi =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL
              ? 'granted'
              : authStatus === AuthorizationStatus.NOT_DETERMINED
              ? 'unknown'
              : 'denied';
        } catch {
          notifikasi = 'denied';
        }
      } else if (isExpoGo) {
        notifikasi = 'granted';
      }

      // Lokasi foreground
      const { status: fgStatus } =
        await Location.getForegroundPermissionsAsync();
      const lokasi: StatusIzin =
        fgStatus === 'granted'
          ? 'granted'
          : fgStatus === 'denied'
          ? 'denied'
          : 'unknown';

      // Lokasi background
      const { status: bgStatus } =
        await Location.getBackgroundPermissionsAsync();
      const lokasiLatar: StatusIzin =
        bgStatus === 'granted'
          ? 'granted'
          : bgStatus === 'denied'
          ? 'denied'
          : 'unknown';

      const hasil: StatusPermissions = { notifikasi, lokasi, lokasiLatar };
      if (mountedRef.current) setStatus(hasil);
      return hasil;
    } catch (e) {
      console.warn('[usePermissions] Gagal cek permissions:', e);
      return status;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [status]);

  return {
    status,
    loading,
    mintaIzinNotifikasi,
    mintaIzinLokasi,
    mintaIzinLokasiLatar,
    cekSemua,
  };
}
